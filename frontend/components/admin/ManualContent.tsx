"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Package, CalendarClock, Inbox, Users, type LucideIcon } from "lucide-react";
import { MANUAL_SECTIONS } from "@/lib/manual-content";

const ICONS: Record<string, LucideIcon> = {
  planes: Package,
  disponibilidad: CalendarClock,
  solicitudes: Inbox,
  cuenta: Users,
};

const PROSE =
  "prose prose-slate dark:prose-invert max-w-none prose-headings:!text-foreground prose-p:!text-foreground prose-li:!text-foreground prose-strong:!text-foreground";

const MARKDOWN_COMPONENTS = {
  // Las imágenes son capturas estáticas locales (/manual/*.png).
  img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img
      {...props}
      loading="lazy"
      className="my-4 w-full rounded-lg border border-border shadow-sm"
    />
  ),
};

export function ManualContent() {
  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
      {/* Índice / tabla de contenidos */}
      <nav className="lg:sticky lg:top-8 lg:w-56 lg:shrink-0">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Contenido
        </p>
        <ul className="flex flex-col gap-1">
          {MANUAL_SECTIONS.map(({ id, title }) => {
            const Icon = ICONS[id];
            return (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {Icon && <Icon className="h-4 w-4 shrink-0" />}
                  {title}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Secciones */}
      <div className="min-w-0 flex-1 space-y-12">
        {MANUAL_SECTIONS.map(({ id, title, markdown }) => {
          const Icon = ICONS[id];
          return (
            <section key={id} id={id} className="scroll-mt-8">
              <div className="mb-4 flex items-center gap-3 border-b border-border pb-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {Icon && <Icon className="h-5 w-5" />}
                </span>
                <h2 className="font-display text-2xl font-semibold">{title}</h2>
              </div>
              <div className={PROSE}>
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={MARKDOWN_COMPONENTS}>
                  {markdown}
                </ReactMarkdown>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
