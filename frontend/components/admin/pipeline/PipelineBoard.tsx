"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  pointerWithin,
  rectIntersection,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { GripVertical, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { allowedTransitions, type RequestStatus } from "@/lib/request-status";
import { formatTravelRange } from "@/lib/format-dates";
import type { PipelineCard } from "@/lib/reports";
import { PIPELINE_STAGES, type StageId } from "@/lib/pipeline-stages";
import { HoldBadge, StatusBadge } from "@/components/requests/StatusBadge";
import { TransitionDialog } from "@/components/admin/TransitionDialog";

const REFRESH_MS = 20_000;
const MAX_CARDS = 50;

type ColumnId = StageId;
const COLUMNS = PIPELINE_STAGES;

const LOST_TARGETS: RequestStatus[] = ["REJECTED", "CANCELLED"];

// Con mouse/táctil cuenta solo la columna bajo el puntero (soltar fuera de una
// columna permitida no hace nada); con teclado no hay puntero: usa la intersección.
const collision: CollisionDetection = (args) =>
  args.pointerCoordinates ? pointerWithin(args) : rectIntersection(args);

/** Estado al que pasaría `card` si se suelta en `column` (null = no permitido). */
function targetFor(card: PipelineCard, column: ColumnId): RequestStatus | null {
  const col = COLUMNS.find((c) => c.id === column)!;
  if (col.statuses.includes(card.status)) return null;
  const allowed = allowedTransitions(card.status, "ADMIN").filter(
    (s) => s !== "COMPLETED" || card.canComplete,
  );
  if (column === "LOST") return allowed.find((s) => LOST_TARGETS.includes(s)) ?? null;
  return allowed.includes(column) ? column : null;
}

/**
 * Pipeline de solicitudes: columnas por etapa con arrastrar y soltar. Al soltar
 * se abre el diálogo de transición (mismas reglas y correo que los botones).
 * Se refresca solo cada 20 s, salvo mientras se arrastra o el diálogo está abierto.
 */
export function PipelineBoard({ cards }: { cards: PipelineCard[] }) {
  const router = useRouter();
  const dndId = React.useId();
  // Estados ya confirmados por la API que aún no llegaron en `cards`.
  const [overrides, setOverrides] = React.useState<Map<number, RequestStatus>>(new Map());
  const [prevCards, setPrevCards] = React.useState(cards);
  if (cards !== prevCards) {
    setPrevCards(cards);
    setOverrides(new Map());
  }

  const [active, setActive] = React.useState<PipelineCard | null>(null);
  const [pending, setPending] = React.useState<{ card: PipelineCard; to: RequestStatus } | null>(
    null,
  );
  const busy = React.useRef(false);
  React.useEffect(() => {
    busy.current = active !== null || pending !== null;
  }, [active, pending]);

  React.useEffect(() => {
    const id = window.setInterval(() => {
      if (!busy.current && document.visibilityState === "visible") router.refresh();
    }, REFRESH_MS);
    return () => window.clearInterval(id);
  }, [router]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
    useSensor(KeyboardSensor),
  );

  const current = cards.map((c) =>
    overrides.has(c.id) ? { ...c, status: overrides.get(c.id)! } : c,
  );
  const byColumn = (col: (typeof COLUMNS)[number]) =>
    current.filter((c) => col.statuses.includes(c.status));

  function onDragStart(e: DragStartEvent) {
    setActive(current.find((c) => c.id === e.active.id) ?? null);
  }

  function onDragEnd(e: DragEndEvent) {
    const card = current.find((c) => c.id === e.active.id);
    setActive(null);
    if (!card || !e.over) return;
    const to = targetFor(card, e.over.id as ColumnId);
    if (to) setPending({ card, to });
  }

  return (
    <DndContext
      id={dndId}
      sensors={sensors}
      collisionDetection={collision}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={() => setActive(null)}
    >
      <div className="grid auto-cols-[minmax(200px,1fr)] grid-flow-col gap-3 overflow-x-auto pb-2">
        {COLUMNS.map((col) => {
          const items = byColumn(col);
          const droppable = active ? targetFor(active, col.id) !== null : false;
          const isSource = active ? col.statuses.includes(active.status) : false;
          return (
            <Column
              key={col.id}
              col={col}
              count={items.length}
              state={!active ? "idle" : droppable ? "allowed" : isSource ? "source" : "blocked"}
            >
              {items.slice(0, MAX_CARDS).map((c) => (
                <DraggableCard key={c.id} card={c} lost={col.id === "LOST"} />
              ))}
              {items.length > MAX_CARDS && (
                <Link
                  href={`/admin/solicitudes?estado=${col.id === "LOST" ? "REJECTED" : col.id}`}
                  className="block py-1 text-center text-xs font-semibold text-barro hover:text-primary"
                >
                  Ver las {items.length} en Solicitudes →
                </Link>
              )}
              {items.length === 0 && (
                <p className="py-6 text-center text-xs text-muted-foreground">Sin solicitudes</p>
              )}
            </Column>
          );
        })}
      </div>

      <DragOverlay dropAnimation={null}>
        {active ? <CardBody card={active} lost={false} dragging /> : null}
      </DragOverlay>

      <TransitionDialog
        id={pending?.card.id ?? 0}
        from={pending?.card.status ?? "PENDING"}
        target={pending?.to ?? null}
        onClose={() => setPending(null)}
        onDone={(ok) => {
          if (ok && pending) {
            setOverrides((m) => new Map(m).set(pending.card.id, pending.to));
            router.refresh();
          }
          setPending(null);
        }}
      />
    </DndContext>
  );
}

function Column({
  col,
  count,
  state,
  children,
}: {
  col: (typeof COLUMNS)[number];
  count: number;
  state: "idle" | "allowed" | "source" | "blocked";
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id, disabled: state === "blocked" });
  return (
    <section
      ref={setNodeRef}
      aria-label={`${col.title}: ${count}`}
      className={cn(
        "flex max-h-[34rem] min-h-40 flex-col rounded-2xl border bg-muted/30 transition-colors",
        state === "allowed" ? "border-primary/60 bg-primary/5" : "border-border",
        state === "allowed" && isOver && "border-primary bg-primary/10",
        state === "blocked" && "opacity-50",
      )}
    >
      <header className="flex items-center gap-2 border-b border-border px-3 py-2.5">
        <span className={cn("h-2.5 w-2.5 rounded-full", col.dot)} />
        <h3 className="text-sm font-semibold">{col.title}</h3>
        <span className="ml-auto rounded-full bg-surface px-2 py-0.5 text-xs font-bold tabular-nums text-muted-foreground">
          {count}
        </span>
      </header>
      <div className="flex-1 space-y-2 overflow-y-auto p-2">{children}</div>
    </section>
  );
}

function DraggableCard({ card, lost }: { card: PipelineCard; lost: boolean }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: card.id });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      aria-roledescription="Tarjeta arrastrable"
      className={cn("touch-manipulation outline-none", isDragging && "opacity-30")}
    >
      <CardBody card={card} lost={lost} />
    </div>
  );
}

function CardBody({
  card,
  lost,
  dragging = false,
}: {
  card: PipelineCard;
  lost: boolean;
  dragging?: boolean;
}) {
  return (
    <article
      className={cn(
        "cursor-grab rounded-xl border border-border bg-surface p-3 text-sm shadow-sm transition-shadow hover:shadow-md",
        dragging && "cursor-grabbing shadow-lg ring-2 ring-primary/40",
      )}
    >
      <div className="flex items-start gap-1.5">
        <Link
          href={`/admin/solicitudes/${card.id}`}
          className="min-w-0 flex-1 font-semibold text-foreground hover:text-primary"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <span className="text-xs text-muted-foreground">#{card.id}</span> {card.name}
        </Link>
        <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/60" aria-hidden />
      </div>
      <p className="mt-0.5 truncate text-xs text-muted-foreground">{card.planTitle ?? "Consulta general"}</p>
      <p className="mt-1 flex items-center gap-2 text-xs text-foreground/80">
        {formatTravelRange(new Date(card.travelDate), card.endDate ? new Date(card.endDate) : null)}
        <span className="inline-flex items-center gap-0.5 text-muted-foreground">
          <Users className="h-3 w-3" /> {card.guests}
        </span>
      </p>
      {(lost || card.holdExpiresAt) && (
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {lost && <StatusBadge status={card.status} className="px-2 py-0.5 text-[11px]" />}
          {card.holdExpiresAt && (
            <HoldBadge status={card.status} holdExpiresAt={new Date(card.holdExpiresAt)} />
          )}
        </div>
      )}
    </article>
  );
}
