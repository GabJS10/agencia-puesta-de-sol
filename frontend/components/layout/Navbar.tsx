"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Globe, User, Menu, X } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { useSession } from "@/components/session-provider";

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
    { name: "INICIO", href: "/" },
    { name: "PLANES", href: "/planes" },
    { name: "NOSOTROS", href: "/nosotros" },
    { name: "GALERÍA", href: "/galeria" },
    { name: "CONTÁCTANOS", href: "/contactanos" },
  ];

  // El tratamiento transparente + texto blanco solo es legible sobre el hero
  // full-bleed del home. En el resto de rutas el tope es claro (bg-background),
  // así que la barra va sólida desde el primer paint para no quedar invisible.
  const isHome = pathname === "/";
  const transparent = isHome && !isScrolled;

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6",
        transparent
          ? "bg-transparent py-6"
          : "bg-background/80 backdrop-blur-md py-4 shadow-lg border-b border-border",
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div
          className={cn(
            "text-xl font-bold flex items-center gap-2",
            transparent ? "text-white" : "text-foreground",
          )}
        >
          <Image
            src="/favicon.jpg"
            alt="Puesta del Sol"
            width={40}
            height={40}
            className="rounded-full w-10 h-10 object-cover"
          />
          <span className="font-display tracking-tight">Puesta del Sol</span>
        </div>

        {/* Desktop Navigation */}
        <div
          className={cn(
            "hidden md:flex items-center gap-1 p-1 rounded-full transition-colors",
            transparent
              ? "bg-black/20 backdrop-blur-sm border border-white/10"
              : "bg-surface/80 border border-border backdrop-blur-md",
          )}
        >
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "text-xs font-medium tracking-wide transition-all px-4 py-1.5 rounded-full",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : transparent
                      ? "text-white/80 hover:text-white"
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
            className={cn(
              "hidden md:flex items-center gap-2 rounded-full border px-4 py-2 text-xs transition-all backdrop-blur-sm hover:border-primary/50 hover:bg-primary/10",
              transparent
                ? "border-white/10 text-white"
                : "border-foreground/10 text-foreground",
            )}
          >
            <User className="h-3 w-3 text-primary" />
            <span className="tracking-wider">
              {user ? "MI CUENTA" : "INGRESAR"}
            </span>
          </Link>

          {/* Idioma (desktop) */}
          <button
            className={cn(
              "hidden md:flex items-center gap-2 px-4 py-2 rounded-full border text-xs transition-all backdrop-blur-sm hover:border-primary/50 hover:bg-primary/10",
              transparent
                ? "border-white/10 text-white"
                : "border-foreground/10 text-foreground",
            )}
          >
            <span className="tracking-wider">IDIOMA</span>
            <Globe className="w-3 h-3 text-primary" />
          </button>

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

      {/* Menú móvil */}
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
              <span className="font-display text-lg font-semibold tracking-tight">
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
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "border-b border-border/60 px-2 py-4 text-base font-semibold tracking-wide transition-colors",
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
                className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <User className="h-4 w-4" />
                {user ? "Mi cuenta" : "Ingresar"}
              </Link>
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-surface-hover"
              >
                <Globe className="h-4 w-4 text-primary" />
                Idioma
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
