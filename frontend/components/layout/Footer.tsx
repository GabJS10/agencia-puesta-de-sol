import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#2a2d2c] text-white py-16 px-6 md:px-20">
      <div className="container mx-auto">
        {/* Top Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Puesta del Sol</h2>
            <p className="text-gray-300 text-sm">Agencia de Viajes y Turismo</p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-xl font-medium">+57 300 123 4567</p>
            <p className="text-gray-300">info@puestadelsol.com</p>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-white/10 mb-16" />

        {/* Middle Section - Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* About Us */}
          <div>
            <h3 className="text-lg font-bold mb-6">Nosotros</h3>
            <p className="text-gray-300 leading-relaxed text-sm">
              Somos apasionados por mostrar la belleza oculta de La Guajira.
              Creamos experiencias auténticas que conectan a los viajeros con la
              naturaleza y la cultura local.
            </p>
          </div>

          {/* Open Hours */}
          <div>
            <h3 className="text-lg font-bold mb-6">Horario</h3>
            <ul className="space-y-3 text-gray-300 text-sm">
              <li className="flex justify-between">
                <span>Lunes:</span>
                <span>8am - 6pm</span>
              </li>
              <li className="flex justify-between">
                <span>Martes - Viernes:</span>
                <span>9am - 6pm</span>
              </li>
              <li className="flex justify-between">
                <span>Sábado:</span>
                <span>9am - 4pm</span>
              </li>
            </ul>
          </div>

          {/* Address */}
          <div>
            <h3 className="text-lg font-bold mb-6">Ubicación</h3>
            <p className="text-gray-300 text-sm mb-2">Cl 14C #16-19</p>
            <p className="text-gray-300 text-sm mb-2">Riohacha, La Guajira</p>
            <p className="text-gray-300 text-sm">Colombia</p>
          </div>

          {/* Follow Us */}
          <div>
            <h3 className="text-lg font-bold mb-6">Síguenos</h3>
            <div className="flex gap-4">
              <Link href="#" className="hover:text-blue-400 transition-colors">
                <Facebook className="w-6 h-6" />
              </Link>
              <Link href="#" className="hover:text-pink-500 transition-colors">
                <Instagram className="w-6 h-6" />
              </Link>
              <Link href="#" className="hover:text-blue-300 transition-colors">
                <Twitter className="w-6 h-6" />
              </Link>
            </div>
            <p className="text-gray-300 text-xs mt-6">
              Síguenos en las redes sociales.
            </p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10 text-xs text-gray-400">
          <p>
            © {new Date().getFullYear()} Puesta del Sol. Todos los derechos
            reservados.
          </p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="#" className="hover:text-white transition-colors">
              Politica de Privacidad
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Términos y Condiciones
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
