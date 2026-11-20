import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { hashResetToken } from "@/lib/password-reset";

export const runtime = "nodejs";

const schema = z
  .object({
    token: z.string().min(10).max(200),
    password: z.string().min(6).max(100),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, { path: ["confirmPassword"] });

const INVALID = { error: "El enlace no es válido o ya venció. Solicita uno nuevo." };

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    const mismatch = parsed.error.issues.some((i) => i.path[0] === "confirmPassword");
    return NextResponse.json(
      { error: mismatch ? "Las contraseñas no coinciden" : "Datos inválidos" },
      { status: 400 },
    );
  }
  const { token, password } = parsed.data;

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashResetToken(token) },
  });
  if (!record || record.usedAt || record.expiresAt <= new Date()) {
    return NextResponse.json(INVALID, { status: 400 });
  }

  const passwordHash = await hashPassword(password);
  const ok = await prisma.$transaction(async (tx) => {
    // Marcado condicional: si dos peticiones usan el mismo token, solo una gana.
    const used = await tx.passwordResetToken.updateMany({
      where: { id: record.id, usedAt: null, expiresAt: { gt: new Date() } },
      data: { usedAt: new Date() },
    });
    if (used.count !== 1) return false;
    await tx.user.update({ where: { id: record.userId }, data: { passwordHash } });
    return true;
  });
  if (!ok) return NextResponse.json(INVALID, { status: 400 });

  return NextResponse.json({ ok: true });
}
