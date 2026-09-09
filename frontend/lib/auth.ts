// Auth server-side (Node): hashing bcrypt + gestión de la cookie de sesión.
import "server-only";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import {
  COOKIE_NAME,
  SESSION_MAX_AGE,
  signSession,
  verifySession,
  type SessionUser,
} from "@/lib/session";

export type { SessionUser };

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function setSessionCookie(user: SessionUser): Promise<void> {
  const token = await signSession(user);
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

// Lanza (para usar en Route Handlers): devuelve el usuario o null.
export async function requireUser(): Promise<SessionUser | null> {
  return getSession();
}

export async function requireAdmin(): Promise<SessionUser | null> {
  const user = await getSession();
  return user?.role === "ADMIN" ? user : null;
}
