interface Props {
  stats: { value: string; label: string }[];
}

// Banda de estadísticas bajo el hero (mockup dirección 1).
export function StatsBar({ stats }: Props) {
  return (
    <section className="border-b border-border bg-muted">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-6 divide-border px-6 py-7 md:grid-cols-4 md:gap-y-0 md:divide-x">
        {stats.map((stat, i) => (
          <div key={i} className="px-4 text-center">
            <div className="font-display text-3xl font-semibold text-barro md:text-4xl">
              {stat.value}
            </div>
            <div className="mt-0.5 text-sm font-semibold text-muted-foreground">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
