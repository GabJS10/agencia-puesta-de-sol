"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Globe } from "lucide-react";

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
          ? "bg-black/30 backdrop-blur-md py-4 shadow-lg border-b border-white/10"
          : "bg-transparent",
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo Placeholder - simplified circle from sketch */}
        <div className="text-white text-2xl font-bold flex items-center gap-2">
          <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center  ">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-all px-6 py-2 rounded-full",
                link.active
                  ? "bg-white text-black shadow-md"
                  : "text-white/80 hover:text-white hover:bg-white/10",
              )}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Language Selector */}
        <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/30 text-white text-xs hover:bg-white/10 transition-colors backdrop-blur-sm">
          <span>IDIOMA</span>
          <Globe className="w-3 h-3" />
        </button>
      </div>
    </nav>
  );
}
