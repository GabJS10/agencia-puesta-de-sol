"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Globe } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "INICIO", href: "#", active: true },
    { name: "PLANES", href: "#" },
    { name: "NOSOTROS", href: "#" },
    { name: "GALERIA", href: "#" },
    { name: "CONTACTANOS", href: "#" },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-6",
        isScrolled
          ? "bg-background/80 backdrop-blur-md py-4 shadow-lg border-b border-border"
          : "bg-transparent py-6",
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo Placeholder - Clean Horizon */}
        <div className={cn("text-xl font-bold flex items-center gap-2", isScrolled ? "text-foreground" : "text-white")}>
          <div className="w-6 h-6 rounded-full border border-primary flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
          </div>
          <span className="tracking-tight">Puesta del Sol</span>
        </div>

        {/* Desktop Navigation */}
        <div className={cn(
          "hidden md:flex items-center gap-1 p-1 rounded-full transition-colors",
          isScrolled 
            ? "bg-surface/80 border border-border backdrop-blur-md" 
            : "bg-black/20 backdrop-blur-sm border border-white/10"
        )}>
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "text-xs font-medium tracking-wide transition-all px-4 py-1.5 rounded-full",
                link.active
                  ? "bg-primary text-primary-foreground"
                  : isScrolled
                    ? "text-muted-foreground hover:text-foreground"
                    : "text-white/80 hover:text-white"
              )}
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          
          {/* Language Selector */}
          <button className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full border text-xs transition-all backdrop-blur-sm hover:border-primary/50 hover:bg-primary/10",
            isScrolled
              ? "border-foreground/10 text-foreground"
              : "border-white/10 text-white"
          )}>
            <span className="tracking-wider">IDIOMA</span>
            <Globe className="w-3 h-3 text-primary" />
          </button>
        </div>
      </div>
    </nav>
  );
}
