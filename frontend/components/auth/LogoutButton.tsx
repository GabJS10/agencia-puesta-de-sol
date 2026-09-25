"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export function LogoutButton({ collapsed = false }: { collapsed?: boolean }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      title={collapsed ? "Cerrar sesión" : undefined}
      aria-label="Cerrar sesión"
      className={cn(
        "inline-flex items-center gap-2 rounded-xl border border-border text-sm font-medium text-foreground transition-colors hover:border-brasa/50 hover:text-brasa",
        collapsed ? "justify-center px-2 py-2" : "px-4 py-2",
      )}
    >
      <LogOut className="h-4 w-4 shrink-0" />
      {!collapsed && "Cerrar sesión"}
    </button>
  );
}
