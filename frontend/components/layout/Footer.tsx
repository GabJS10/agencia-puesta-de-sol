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
    <footer className="bg-background text-foreground py-16 px-6 md:px-20 border-t border-border relative overflow-hidden">
      <div className="container mx-auto relative z-10">
        {/* Top Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full border border-primary flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
              </div>
              <h2 className="text-3xl font-bold tracking-tight">
                Puesta del Sol
              </h2>
            </div>
            <p className="text-muted text-sm tracking-wide">
              Agencia de Viajes y Turismo
            </p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-2xl font-bold text-primary">+57 {number}</p>
            <p className="text-muted tracking-wide">{email}</p>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent mb-16" />

        {/* Middle Section - Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* About Us */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-foreground">Nosotros</h3>
            <p className="text-muted leading-relaxed text-sm font-light">
              {AboutFooter}
            </p>
          </div>

          {/* Open Hours */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-foreground">Horario</h3>
            <ul className="space-y-3 text-muted text-sm font-light">
              <li className="flex justify-between border-b border-foreground/5 pb-2">
                <span>Lunes:</span>
                <span className="text-foreground">8am - 6pm</span>
              </li>
              <li className="flex justify-between border-b border-foreground/5 pb-2">
                <span>Martes - Viernes:</span>
                <span className="text-foreground">9am - 6pm</span>
              </li>
              <li className="flex justify-between border-b border-foreground/5 pb-2">
                <span>Sábado:</span>
                <span className="text-foreground">9am - 4pm</span>
              </li>
            </ul>
          </div>

          {/* Address */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-foreground">
              Ubicación
            </h3>
            <p className="text-muted text-sm mb-2 leading-relaxed">
              {location}
            </p>
          </div>

          {/* Follow Us */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-foreground">Síguenos</h3>
            <div className="flex gap-4">
              <Link
                href={social.facebook}
                target="_blank"
                className="w-10 h-10 rounded-full border border-foreground/10 flex items-center justify-center hover:bg-foreground/10 hover:border-primary hover:text-primary transition-all duration-300 group"
              >
                <Facebook className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </Link>
              <Link
                href={social.instagram}
                target="_blank"
                className="w-10 h-10 rounded-full border border-foreground/10 flex items-center justify-center hover:bg-foreground/10 hover:border-primary hover:text-primary transition-all duration-300 group"
              >
                <Instagram className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </Link>
              <Link
                href={social.whatsapp}
                target="_blank"
                className="w-10 h-10 rounded-full border border-foreground/10 flex items-center justify-center hover:bg-foreground/10 hover:border-primary hover:text-primary transition-all duration-300 group"
              >
                <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </Link>
            </div>
            <p className="text-muted text-xs mt-6 font-light">
              Síguenos en las redes sociales para novedades y ofertas.
            </p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-foreground/5 text-xs text-muted font-light">
          <p>© 2026 Puesta del Sol. Todos los derechos reservados.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link
              href="https://gabjs10.netlify.app/"
              className="hover:text-primary transition-colors"
            >
              Sitio web creado por Gabriel Ballesteros
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
