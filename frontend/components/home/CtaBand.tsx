import Link from "next/link";

export function CtaBand() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24 md:py-32">
      <div className="relative flex flex-col items-start justify-between gap-10 overflow-hidden rounded-[28px] bg-sol px-8 py-14 text-[#2a1a0a] md:flex-row md:items-center md:px-16 md:py-[72px]">
        <svg
          aria-hidden="true"
          viewBox="0 0 420 420"
          className="pointer-events-none absolute -right-24 -top-28 h-[420px] w-[420px] opacity-35"
        >
          <circle className="anim-sun" cx="210" cy="210" r="200" fill="#d6455f" />
        </svg>
        <h2 className="relative max-w-[640px] text-4xl font-extrabold leading-[1.05] tracking-[-0.035em] md:text-[52px]">
          ¿Listo para ver el atardecer desde el Cabo?
        </h2>
        <div className="relative flex flex-wrap gap-3">
          <Link
            href="/planes"
            className="inline-flex min-h-12 items-center rounded-full bg-[#2a2018] px-7 font-bold text-[#f4ead6] transition-transform hover:-translate-y-0.5"
          >
            Ver planes
          </Link>
          <Link
            href="/contactanos"
            className="inline-flex min-h-12 items-center rounded-full border-[1.5px] border-[#2a1a0a] px-7 font-bold transition-all hover:-translate-y-0.5 hover:bg-[#2a1a0a]/10"
          >
            Escríbenos
          </Link>
        </div>
      </div>
    </section>
  );
}
