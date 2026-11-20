import "server-only";
import { createHash, randomBytes } from "node:crypto";

export const RESET_TTL_MS = 60 * 60 * 1000; // 1 hora

export const hashResetToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

/** Token aleatorio (256 bits) para el enlace + su hash para la BD. */
export function newResetToken() {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashResetToken(token) };
}
