"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { User, Menu, X } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { useSession } from "@/components/session-provider";
import { LogoMark } from "@/components/ui/Logo";

const DARK_HERO_ROUTES = ["/", "/planes", "/nosotros", "/galeria", "/contactanos"];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { user } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    // Si la página carga ya desplazada (recarga, volver atrás), la barra arranca sólida.
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Con el menú abierto: bloquea el scroll del body, cierra con Escape y
  // lleva el foco al botón de cierre (accesibilidad).
  useEffect(() => {
    if (!menuOpen) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const navLinks = [
    { name: "Inicio", href: "/" },
    { name: "Planes", href: "/planes" },
    { name: "Nosotros", href: "/nosotros" },
    { name: "Galería", href: "/galeria" },
    { name: "Contacto", href: "/contactanos" },
  ];

  // Las rutas con encabezado oscuro (hero del home y PageHero) llevan la barra
  // transparente con texto claro hasta hacer scroll; el resto, sólida desde el
  // primer paint para no quedar invisible sobre fondo claro.
  const darkTop = DARK_HERO_ROUTES.includes(pathname);
  const transparent = darkTop && !isScrolled;

  return (
    <>
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 px-6 transition-all duration-300",
        transparent
          ? "bg-transparent py-6"
          : "border-b border-border bg-background/85 py-3.5 shadow-[0_10px_30px_-20px_rgba(42,32,24,0.4)] backdrop-blur-md",
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6">
        <Link
          href="/"
          className={cn(
            "flex items-center gap-2.5 text-xl font-extrabold tracking-[-0.02em] transition-colors",
            transparent ? "text-[#fbf5e9]" : "text-foreground",
          )}
        >
          <LogoMark className="h-12 w-12" />
          Puesta del Sol
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative py-3 text-[15px] font-semibold transition-colors",
                  "after:absolute after:inset-x-0 after:bottom-1.5 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-sol after:transition-transform after:duration-300 hover:after:scale-x-100",
                  isActive && "after:scale-x-100",
                  transparent
                    ? isActive
                      ? "text-sol"
                      : "text-[#efe3cc] hover:text-sol"
                    : isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                )}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          {/* Sesión: Ingresar / Mi cuenta (desktop) */}
          <Link
            href={user ? "/cuenta" : "/ingresar"}
            className="group hidden min-h-11 items-center gap-2 rounded-full bg-sol px-5 text-[15px] font-bold text-[#2a1a0a] transition-all hover:-translate-y-0.5 hover:bg-[#f7b456] md:inline-flex"
          >
            <User className="h-4 w-4" />
            {user ? "Mi cuenta" : "Ingresar"}
          </Link>

          {/* Botón de menú (móvil) */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menú"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-full border transition-all md:hidden",
              transparent
                ? "border-white/20 text-white hover:bg-white/10"
                : "border-border text-foreground hover:bg-surface-hover",
            )}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </nav>

      {/* Menú móvil — fuera del <nav> a propósito: el nav usa backdrop-filter,
          que convierte al nav en bloque contenedor de sus descendientes fixed y
          recortaría este overlay a la altura de la barra. Como hermano del nav
          se posiciona contra el viewport. */}
      {menuOpen && (
        <div id="mobile-menu" className="fixed inset-0 z-[60] md:hidden">
          <div
            className="absolute inset-0 bg-noche/60 backdrop-blur-sm motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200"
            aria-hidden="true"
            onClick={() => setMenuOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación"
            className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col overflow-y-auto bg-background text-foreground shadow-2xl motion-safe:animate-in motion-safe:slide-in-from-right motion-safe:duration-300"
          >
            <div className="flex items-center justify-between border-b border-border px-6 py-5">
              <span className="flex items-center gap-2.5 text-lg font-extrabold tracking-[-0.02em]">
                <LogoMark />
                Puesta del Sol
              </span>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Cerrar menú"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-surface-hover"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex flex-col px-4 py-2">
              {navLinks.map((link) => {
                const isActive =
                  link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "border-b border-border/60 px-2 py-4 text-xl font-bold tracking-[-0.02em] transition-colors",
                      isActive
                        ? "text-primary"
                        : "text-foreground hover:text-primary",
                    )}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto flex flex-col gap-3 border-t border-border px-6 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
              <Link
                href={user ? "/cuenta" : "/ingresar"}
                onClick={() => setMenuOpen(false)}
                className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-sol px-4 text-base font-bold text-[#2a1a0a] transition-colors hover:bg-[#f7b456]"
              >
                <User className="h-4 w-4" />
                {user ? "Mi cuenta" : "Ingresar"}
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
