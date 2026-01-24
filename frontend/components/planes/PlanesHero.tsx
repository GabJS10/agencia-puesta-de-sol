import { Search } from "lucide-react";
import Image from "next/image";

export function PlanesHero() {
  return (
    <div className="relative h-[500px] w-full flex items-center justify-center overflow-hidden bg-surface">
      {/* Background Image - Clean and Minimalist */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1596436889106-be35e843f974?q=80&w=2070&auto=format&fit=crop"
          alt="Experiencias Hero"
          fill
          className="object-cover opacity-90 brightness-[0.85]"
          priority
        />
        {/* Clean overlay for text legibility without heaviness */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-7xl px-6 flex flex-col md:flex-row items-start md:items-end justify-end md:justify-between gap-6 md:gap-12 pb-12 md:pb-16 h-full">
        {/* Left: Minimalist Text */}
        <div className="text-left flex flex-col gap-4 max-w-xl md:mb-4 w-full md:w-auto">
          <h1 className="text-4xl md:text-7xl font-extralight text-white tracking-wide leading-tight">
            Descubre <br />
            <span className="font-medium">tu destino</span>
          </h1>
          <p className="text-white/80 text-lg font-light tracking-wide max-w-sm">
            Explora experiencias únicas diseñadas para conectar con la
            naturaleza y la cultura.
          </p>
        </div>

        {/* Right: Search Bar - Clean & Modern - Aligned with text bottom */}
        <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-full flex items-center shadow-2xl md:mb-2">
          <div className="pl-4 pr-2 text-white/70">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Buscar experiencia..."
            className="flex-1 bg-transparent border-none text-white placeholder:text-white/60 focus:outline-none px-2 py-2 text-base font-light"
          />
        </div>
      </div>
    </div>
  );
}
