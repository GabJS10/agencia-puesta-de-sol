// Banda sol con los destinos desfilando. Decorativa: los destinos ya se
// listan en la sección de planes, por eso queda oculta a lectores de pantalla.
// La pista son dos mitades idénticas y se desplaza -50%: al terminar el ciclo
// la segunda mitad queda donde empezó la primera y el bucle no se nota. Cada
// mitad repite los destinos hasta superar el ancho de pantallas grandes.
const MIN_PER_HALF = 14;

export function Marquee({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  const half = Array.from(
    { length: Math.ceil(MIN_PER_HALF / items.length) },
    () => items,
  ).flat();
  const loop = [...half, ...half];
  return (
    <div aria-hidden="true" className="overflow-hidden bg-sol py-5 text-[#2a1a0a]">
      <div
        className="anim-marquee flex w-max"
        // Velocidad constante (~40 px/s) sin importar cuántos destinos haya.
        style={{ animationDuration: `${half.length * 5}s` }}
      >
        {loop.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-7 whitespace-nowrap pr-7 text-[22px] font-extrabold tracking-[-0.01em]"
          >
            {item}
            <svg width="14" height="14" viewBox="0 0 14 14">
              <path d="M7 0 L14 7 L7 14 L0 7 Z" fill="currentColor" />
            </svg>
          </span>
        ))}
      </div>
    </div>
  );
}
