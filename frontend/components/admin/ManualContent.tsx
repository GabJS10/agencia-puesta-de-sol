"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Package, CalendarClock, Inbox, Users, type LucideIcon } from "lucide-react";

interface ManualSection {
  id: string;
  title: string;
  icon: LucideIcon;
  /** Contenido en Markdown. TODO: redactar (por ahora placeholder). */
  markdown: string;
}

// TODO: reemplazar los placeholders por el contenido real del manual.
const SECTIONS: ManualSection[] = [
  {
    id: "planes",
    title: "Planes",
    icon: Package,
    markdown:
      "_Contenido pendiente._\n\nAquí se documentará la gestión de planes: crear y editar, imagen principal y galería, etiquetas, publicar vs borrador, y tipo/ubicación.",
  },
  {
    id: "disponibilidad",
    title: "Disponibilidad",
    icon: CalendarClock,
    markdown:
      "_Contenido pendiente._\n\nAquí se documentará la configuración de disponibilidad: modo de ocupación (Exclusivo/Aforo), cupo, modo de reserva, reservas abiertas y fechas bloqueadas.",
  },
  {
    id: "solicitudes",
    title: "Solicitudes",
    icon: Inbox,
    markdown:
      "_Contenido pendiente._\n\nAquí se documentará la gestión de solicitudes y sus estados (Pendiente, Contactado, Confirmado, Cancelado).",
  },
  {
    id: "cuenta",
    title: "Usuarios y cuenta",
    icon: Users,
    markdown:
      "_Contenido pendiente._\n\nAquí se documentará la gestión de usuarios y roles, y la edición del perfil propio.",
  },
];

const PROSE =
  "prose prose-slate dark:prose-invert max-w-none prose-headings:!text-foreground prose-p:!text-foreground prose-li:!text-foreground prose-strong:!text-foreground";

export function ManualContent() {
  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
      {/* Índice / tabla de contenidos */}
      <nav className="lg:sticky lg:top-8 lg:w-56 lg:shrink-0">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Contenido
        </p>
        <ul className="flex flex-col gap-1">
          {SECTIONS.map(({ id, title, icon: Icon }) => (
            <li key={id}>
              <a
                href={`#${id}`}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Icon className="h-4 w-4 shrink-0" />
                {title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Secciones */}
      <div className="min-w-0 flex-1 space-y-12">
        {SECTIONS.map(({ id, title, icon: Icon, markdown }) => (
          <section key={id} id={id} className="scroll-mt-8">
            <div className="mb-4 flex items-center gap-3 border-b border-border pb-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <h2 className="font-display text-2xl font-semibold">{title}</h2>
            </div>
            <div className={PROSE}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
