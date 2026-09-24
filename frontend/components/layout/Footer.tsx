import Link from "next/link";
import { Facebook, Instagram, MessageCircle } from "lucide-react";
import { getSocial } from "@/lib/get-social";

interface Props {
  number: string;
  email: string;
  AboutFooter: string;
  location: string;
}

export async function Footer({ number, email, AboutFooter, location }: Props) {
  const social = await getSocial();

  return (
    <footer className="border-t border-border bg-background px-6 py-14 text-foreground md:px-20">
      <div className="mx-auto max-w-7xl">
        {/* Top */}
        <div className="flex flex-col justify-between gap-12 md:flex-row md:gap-16">
          {/* Left: brand */}
          <div className="max-w-sm">
            <div className="flex items-center gap-3">
              <span
                className="h-8 w-8 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle at 50% 35%, #f5a538, #d6455f)",
                }}
                aria-hidden="true"
              />
              <span className="font-display text-2xl font-semibold">
                Puesta del Sol
              </span>
            </div>

            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              {AboutFooter}
            </p>

            <div className="mt-6 flex gap-3">
              <Link
                href={social.facebook}
                target="_blank"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border transition-colors hover:border-primary hover:text-primary"
              >
                <Facebook size={18} />
              </Link>
              <Link
                href={social.instagram}
                target="_blank"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border transition-colors hover:border-primary hover:text-primary"
              >
                <Instagram size={18} />
              </Link>
              <Link
                href={social.whatsapp}
                target="_blank"
                aria-label="WhatsApp"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border transition-colors hover:border-primary hover:text-primary"
              >
                <MessageCircle size={18} />
              </Link>
            </div>
          </div>

          {/* Right: columns */}
          <div className="flex flex-col gap-10 sm:flex-row sm:gap-16">
            {/* Explorar */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Explorar
              </h3>
              <nav className="mt-4 flex flex-col gap-3 text-sm">
                <Link href="/planes" className="transition-colors hover:text-primary">
                  Planes
                </Link>
                <Link href="/nosotros" className="transition-colors hover:text-primary">
                  Nosotros
                </Link>
                <Link href="/galeria" className="transition-colors hover:text-primary">
                  Galería
                </Link>
                <Link
                  href="/contactanos"
                  className="transition-colors hover:text-primary"
                >
                  Contacto
                </Link>
              </nav>
            </div>

            {/* Horario */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Horario
              </h3>
              <div className="mt-4 flex flex-col gap-3 text-sm">
                <span>Lunes · 8am – 6pm</span>
                <span>Mar – Vie · 9am – 6pm</span>
                <span>Sábado · 9am – 4pm</span>
              </div>
            </div>

            {/* Contacto */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Contacto
              </h3>
              <div className="mt-4 flex flex-col gap-3 text-sm">
                <span className="font-bold text-barro">+57 {number}</span>
                <span>{email}</span>
                <span>{location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© 2026 Puesta del Sol. Todos los derechos reservados.</p>
          <p className="font-display text-sm italic">
            El desierto y el mar no se cuentan, se viven.
          </p>
        </div>
      </div>
    </footer>
  );
}
