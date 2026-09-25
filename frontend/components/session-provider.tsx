"use client";

import * as React from "react";
import type { SessionUser } from "@/lib/session";

interface SessionContextValue {
  user: SessionUser | null;
  /** Re-consulta /api/auth/me (escape hatch; normalmente basta router.refresh()). */
  refresh: () => Promise<void>;
}

const SessionContext = React.createContext<SessionContextValue | null>(null);

// Provee la sesión resuelta en el server (app/(site)/layout.tsx) a todo el
// árbol cliente, evitando que cada componente pida /api/auth/me por su cuenta.
export function SessionProvider({
  initialUser,
  children,
}: {
  initialUser: SessionUser | null;
  children: React.ReactNode;
}) {
  const [user, setUser] = React.useState<SessionUser | null>(initialUser);

  // Tras login/logout/register (router.refresh()) el layout server re-renderiza
  // con un initialUser nuevo; sincronizamos el estado con ese valor. La prop solo
  // cambia de identidad cuando el server vuelve a renderizar, no en re-renders
  // del cliente, así que es seguro depender del objeto.
  React.useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  const refresh = React.useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      setUser(data.user ?? null);
    } catch {
      // silencioso: mantenemos el último estado conocido
    }
  }, []);

  const value = React.useMemo(() => ({ user, refresh }), [user, refresh]);

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = React.useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession debe usarse dentro de <SessionProvider>");
  }
  return ctx;
}
