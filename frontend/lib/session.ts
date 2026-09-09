// Helpers de sesión JWT — edge-safe (solo `jose`, sin dependencias de Node).
// Usado tanto por el middleware (Edge) como por lib/auth.ts (Node).
import { SignJWT, jwtVerify } from "jose";

export const COOKIE_NAME = "pds_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 días

export type Role = "CLIENT" | "ADMIN";

export interface SessionUser {
  id: number;
  email: string;
  name: string;
  role: Role;
}

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET no está definido");
  return new TextEncoder().encode(secret);
}

export async function signSession(user: SessionUser): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecret());
}

export async function verifySession(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      id: payload.id as number,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as Role,
    };
  } catch {
    return null;
  }
}
