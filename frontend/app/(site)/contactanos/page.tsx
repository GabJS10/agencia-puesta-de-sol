import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Instagram,
  Facebook,
  MessageCircle,
} from "lucide-react";
import { getHome } from "@/lib/get-home";
import { getSocial } from "@/lib/get-social";
import { getPhone } from "@/lib/get-phone";
import { ContactForm } from "@/components/contact/ContactForm";
import { Location } from "@/components/home/Location";
import { KanasBand } from "@/components/ui/KanasBand";
import { Eyebrow } from "@/components/ui/Eyebrow";

export const metadata = {
  title: "Contáctanos | Puesta del Sol",
  description:
    "Escríbenos y planeemos juntos tu próxima aventura por La Guajira.",
};

export default async function ContactanosPage() {
  const [home, social, phone] = await Promise.all([
    getHome(),
    getSocial(),
    getPhone(),
  ]);

  const footer = home.Footer;
  const cleanPhone = (phone || footer.number || "").replace(/\D/g, "");
  const directWhatsapp = `https://wa.me/+57${cleanPhone}?text=${encodeURIComponent(
    "Hola, vengo de la página web 🌅. Quisiera más información sobre sus planes.",
  )}`;

  const channels = [
    { icon: Phone, label: "Teléfono", value: `+57 ${footer.number}` },
    { icon: Mail, label: "Correo", value: footer.email },
    { icon: MapPin, label: "Ubicación", value: footer.location },
    { icon: Clock, label: "Horario", value: "Lun–Vie 9am–6pm · Sáb 9am–4pm" },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero oscuro */}
      <section className="relative overflow-hidden bg-noche px-6 pb-16 pt-36 text-arena">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-sol/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 right-1/4 h-80 w-80 rounded-full bg-mar/15 blur-3xl"
        />
        <div className="relative mx-auto max-w-7xl">
          <Eyebrow className="text-sol">Contáctanos</Eyebrow>
          <h1 className="mt-5 max-w-3xl font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
            Hablemos de tu próxima{" "}
            <span className="text-atardecer">aventura</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg font-light text-arena/70">
            Cuéntanos qué sueñas conocer de La Guajira y te armamos el plan.
            Respondemos rápido por WhatsApp.
          </p>
        </div>
      </section>

      <KanasBand height={16} className="opacity-90" />

      {/* Cuerpo */}
      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-16 lg:grid-cols-2">
        {/* Columna izquierda: canales + redes + CTA */}
        <div className="flex flex-col gap-8">
          <div>
            <h2 className="font-display text-3xl font-semibold">
              Escríbenos directo
            </h2>
            <p className="mt-2 max-w-md text-muted-foreground">
              Estamos en Riohacha, listos para ayudarte a planear tu viaje.
            </p>
          </div>

          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {channels.map(({ icon: Icon, label, value }) => (
              <li
                key={label}
                className="flex items-start gap-4 rounded-2xl border border-border bg-surface p-5 shadow-sm"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sol/10 text-sol">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-barro">
                    {label}
                  </p>
                  <p className="mt-1 break-words text-sm font-medium text-foreground">
                    {value}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          {/* Redes */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-barro">
              Síguenos
            </p>
            <div className="flex gap-3">
              {[
                { href: social.instagram, Icon: Instagram, label: "Instagram" },
                { href: social.facebook, Icon: Facebook, label: "Facebook" },
                { href: social.whatsapp, Icon: MessageCircle, label: "WhatsApp" },
              ].map(({ href, Icon, label }) => (
                <Link
                  key={label}
                  href={href}
                  target="_blank"
                  aria-label={label}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-foreground transition-all hover:border-sol hover:bg-sol/10 hover:text-sol"
                >
                  <Icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* CTA directo WhatsApp */}
          <Link
            href={directWhatsapp}
            target="_blank"
            className="group flex items-center justify-between gap-4 rounded-2xl border border-mar/30 bg-mar/10 p-5 transition-colors hover:bg-mar/15"
          >
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-mar text-white">
                <MessageCircle className="h-6 w-6" />
              </span>
              <div>
                <p className="font-display text-lg font-semibold text-foreground">
                  Chatea con nosotros
                </p>
                <p className="text-sm text-muted-foreground">
                  Abre WhatsApp al instante
                </p>
              </div>
            </div>
            <span className="text-mar transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>

        {/* Columna derecha: formulario */}
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm md:p-8">
          <h2 className="mb-1 font-display text-2xl font-semibold">
            Envíanos un mensaje
          </h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Completa y te contactamos por WhatsApp.
          </p>
          <ContactForm phoneNumber={phone || footer.number} />
        </div>
      </section>

      {/* Mapa (reutiliza el componente del home) */}
      <Location />
    </main>
  );
}
