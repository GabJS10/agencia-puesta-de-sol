const STEPS = [
  {
    title: "Elige tu plan",
    text: "Desierto, playa o cultura Wayúu. Filtra por tipo, ubicación y precio.",
  },
  {
    title: "Escoge tus fechas",
    text: "El calendario te muestra la disponibilidad real de cada salida.",
  },
  {
    title: "Te confirmamos",
    text: "Sigue el estado de tu solicitud desde tu cuenta hasta el día del viaje.",
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24 md:py-32">
      <div className="mb-14 flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <h2 className="max-w-[620px] text-4xl font-extrabold leading-[1.04] tracking-[-0.035em] md:text-[56px]">
          Reservar es tan simple como mirar el atardecer.
        </h2>
        <p className="max-w-[360px] text-[17px] leading-relaxed text-muted-foreground">
          Tres pasos y nosotros nos encargamos del resto. Te avisamos por correo
          en cada cambio.
        </p>
      </div>

      <ol className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {STEPS.map((step, i) => (
          <li
            key={step.title}
            className="group rounded-[22px] border-[1.5px] border-border px-8 pb-10 pt-9 transition-all duration-300 hover:-translate-y-1.5 hover:bg-card"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-lg font-extrabold text-background transition-colors duration-300 group-hover:bg-sol group-hover:text-[#2a1a0a]">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="mb-2.5 mt-7 text-2xl font-extrabold tracking-[-0.02em]">
              {step.title}
            </h3>
            <p className="leading-relaxed text-muted-foreground">{step.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
