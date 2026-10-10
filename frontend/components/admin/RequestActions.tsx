"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ACTION_LABEL, allowedTransitions, type RequestStatus } from "@/lib/request-status";
import { TransitionDialog } from "@/components/admin/TransitionDialog";

const TONE: Partial<Record<RequestStatus, string>> = {
  CONFIRMED: "bg-primary text-primary-foreground hover:bg-primary/90 border-transparent",
  REJECTED: "text-brasa hover:bg-brasa/10 border-brasa/30",
  CANCELLED: "text-brasa hover:bg-brasa/10 border-brasa/30",
};

export function RequestActions({
  id,
  status,
  canComplete,
  compact = false,
}: {
  id: number;
  status: RequestStatus;
  /** El viaje ya empezó: permite "Marcar completado". */
  canComplete: boolean;
  compact?: boolean;
}) {
  const router = useRouter();
  const [target, setTarget] = useState<RequestStatus | null>(null);

  const actions = allowedTransitions(status, "ADMIN").filter(
    (to) => to !== "COMPLETED" || canComplete,
  );
  if (actions.length === 0) {
    return compact ? null : (
      <p className="text-sm text-muted-foreground">
        Estado final: no admite más cambios.
      </p>
    );
  }

  return (
    <>
      <div className={cn("flex flex-wrap gap-1.5", !compact && "gap-2")}>
        {actions.map((to) => (
          <button
            key={to}
            type="button"
            onClick={() => setTarget(to)}
            className={cn(
              "rounded-lg border border-border font-semibold text-foreground/80 transition-colors hover:bg-surface-hover",
              compact ? "px-2.5 py-1 text-xs" : "px-3.5 py-2 text-sm",
              TONE[to],
            )}
          >
            {ACTION_LABEL[to]}
          </button>
        ))}
      </div>
      <TransitionDialog
        id={id}
        from={status}
        target={target}
        onClose={() => setTarget(null)}
        onDone={(ok) => {
          if (ok) {
            setTarget(null);
            router.refresh();
          }
        }}
      />
    </>
  );
}
