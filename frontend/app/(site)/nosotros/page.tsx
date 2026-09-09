import Image from "next/image";
import Link from "next/link";
import {
  Compass,
  Users,
  Leaf,
  MapPin,
  CalendarHeart,
  ShieldCheck,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import { getHome } from "@/lib/get-home";
import { resolveMedia } from "@/lib/media-url";
import { KanasBand } from "@/components/ui/KanasBand";
import { Eyebrow } from "@/components/ui/Eyebrow";

export const metadata = {
  title: "Nosotros | Puesta del Sol",
  description:
    "Somos una agencia guajira: viajes auténticos por el desierto y el mar Caribe, de la mano de guías locales.",
};

interface Stat {
  value: string;
  label: string;
}

const VALUES = [
  {
    icon: Compass,
    title: "Autenticidad",
    text: "Rutas reales, sin decorados. Te llevamos a la Guajira que vivimos todos los días, no a la de las postales de catálogo.",
  },
  {
    icon: Users,
    title: "Comunidad Wayúu",
    text: "Trabajamos con familias y guías Wayúu. Viajar con nosotros deja huella buena en el territorio y en su gente.",
  },
  {
    icon: Leaf,
    title: "Naturaleza viva",
    text: "Dunas, flamencos, salinas y mar. Cuidamos los lugares que amamos para que sigan asombrando a quien venga después.",
  },
];

const REASONS = [
  {
    icon: MapPin,
    title: "Guías locales expertos",
    text: "Nacidos y criados en La Guajira: conocen los caminos, las mareas y las historias.",
  },
  {
    icon: CalendarHeart,
    title: "Planes a tu medida",
    text: "Desde escapadas de un día hasta expediciones a Punta Gallinas. Armamos el viaje contigo.",
  },
  {
    icon: ShieldCheck,
    title: "Confianza y seguridad",
    text: "Logística resuelta y acompañamiento de principio a fin para que solo te ocupes de disfrutar.",
  },
];

export default async function NosotrosPage() {
  const home = await getHome();
  const stats: Stat[] = home.estadistica ?? [];

  // Primera imagen disponible (evita índices fijos que a veces no existen)
  const heroCandidate =
    (home.HeroTours ?? [])
      .map((t: { image?: { url?: string } }) => t?.image?.url)
      .find(Boolean) || home.Footer?.image?.url;
  const heroImg = resolveMedia(heroCandidate);

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="relative overflow-hidden bg-noche px-6 pb-16 pt-36 text-arena">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-sol/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 left-1/4 h-80 w-80 rounded-full bg-brasa/15 blur-3xl"
        />
        <div className="relative mx-auto max-w-7xl">
          <Eyebrow className="text-sol">Nosotros</Eyebrow>
          <h1 className="mt-5 max-w-4xl font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
            Hijos del <span className="text-atardecer">desierto</span> y del mar
          </h1>
          <p className="mt-5 max-w-2xl text-lg font-light text-arena/70">
            Somos una agencia guajira. Nacimos para mostrar el rincón más al
            norte de Suramérica como lo sentimos quienes vivimos aquí: crudo,
            luminoso y profundamente hospitalario.
          </p>
        </div>
      </section>

      <KanasBand height={16} className="opacity-90" />

      {/* Historia */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <Eyebrow className="mb-5">Nuestra historia</Eyebrow>
            <h2 className="font-display text-3xl font-semibold leading-[1.1] md:text-4xl">
              Empezó como un sueño frente a un atardecer
            </h2>
            {home.sobreNosotros && (
              <p className="mt-6 text-lg font-light leading-relaxed text-foreground/80">
                {home.sobreNosotros}
              </p>
            )}
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Desde Riohacha empezamos a llevar viajeros a Cabo de la Vela, a
              las salinas de Manaure y hasta Punta Gallinas. Cada ruta la
              caminamos primero nosotros, de la mano de las rancherías Wayúu que
              hoy son parte de la familia.
            </p>
          </div>

          {heroImg && (
            <div className="relative">
              <div className="relative aspect-[5/4] w-full overflow-hidden rounded-3xl border border-border bg-arena-2 shadow-sm">
                <Image
                  src={heroImg}
                  alt="Paisaje de La Guajira"
                  fill
                  priority
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                {/* Velo cálido inferior para dar cohesión */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-noche/25 to-transparent" />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Estadísticas */}
      {stats.length > 0 && (
        <section className="border-y border-border bg-surface px-6 py-16">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-10 md:grid-cols-4">
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <div className="font-display text-4xl font-semibold text-atardecer md:text-5xl">
                  {s.value}
                </div>
                <div className="mt-2 text-sm uppercase tracking-wide text-muted-foreground">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Misión y valores */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="max-w-2xl">
          <Eyebrow className="mb-5">Lo que nos mueve</Eyebrow>
          <h2 className="font-display text-3xl font-semibold leading-[1.1] md:text-4xl">
            Viajes con alma, hechos con respeto
          </h2>
          <p className="mt-4 text-lg font-light text-muted-foreground">
            Nuestra misión es simple: que conozcas La Guajira de verdad y que tu
            visita sea buena para el territorio y su gente.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {VALUES.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="group relative overflow-hidden rounded-3xl border border-border bg-surface p-8 shadow-sm transition-shadow hover:shadow-md"
            >
              <span className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-sol/10 text-sol">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="font-display text-2xl font-semibold">{title}</h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                {text}
              </p>
              <div className="absolute inset-x-0 bottom-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <KanasBand height={10} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Por qué elegirnos + CTA */}
      <section className="bg-noche px-6 py-20 text-arena">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <Eyebrow className="mb-5 text-sol">Por qué elegirnos</Eyebrow>
            <h2 className="font-display text-3xl font-semibold leading-[1.1] md:text-4xl">
              Tu aventura, en las mejores manos
            </h2>
            <ul className="mt-8 space-y-6">
              {REASONS.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-arena/10 text-sol">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-arena">{title}</h3>
                    <p className="mt-1 text-arena/60">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Tarjeta CTA */}
          <div className="rounded-3xl border border-arena/15 bg-gradient-to-br from-arena/5 to-transparent p-8 md:p-10">
            <h3 className="font-display text-3xl font-semibold leading-tight">
              ¿Listo para conocer La Guajira?
            </h3>
            <p className="mt-3 text-arena/70">
              Explora nuestros planes o escríbenos y armamos juntos tu próxima
              aventura.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/planes"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              >
                Ver planes
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contactanos"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-arena/20 px-6 font-semibold text-arena transition-colors hover:bg-arena/10"
              >
                <MessageCircle className="h-4 w-4" />
                Contáctanos
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
