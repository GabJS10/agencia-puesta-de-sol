import { SunsetScene } from "@/components/ui/SunsetScene";

interface PageHeroProps {
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Contenido extra bajo el texto (p. ej. el buscador de planes). */
  children?: React.ReactNode;
}

/** Encabezado oscuro de las páginas internas, con el atardecer compacto de fondo. */
export function PageHero({ eyebrow, title, description, children }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-noche px-6 pb-24 pt-36 text-[#fbf5e9]">
      <SunsetScene variant="compact" />
      <div className="relative mx-auto max-w-7xl">
        <span className="anim-rise inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-[#efe3cc]">
          <span className="h-0.5 w-9 rounded-full bg-sol" />
          {eyebrow}
        </span>
        <h1
          className="anim-rise mt-5 max-w-4xl text-5xl font-extrabold leading-none tracking-[-0.045em] md:text-7xl"
          style={{ animationDelay: "80ms" }}
        >
          {title}
        </h1>
        {description && (
          <p
            className="anim-rise mt-5 max-w-xl text-lg leading-relaxed text-[#efe3cc]"
            style={{ animationDelay: "160ms" }}
          >
            {description}
          </p>
        )}
        {children && (
          <div className="anim-rise mt-8" style={{ animationDelay: "240ms" }}>
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
