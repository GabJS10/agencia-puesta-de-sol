import { NextResponse, after } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email/brevo";
import { passwordReset } from "@/lib/email/templates";
import { RESET_TTL_MS, newResetToken } from "@/lib/password-reset";

export const runtime = "nodejs";

const schema = z.object({ email: z.string().email() });

// Misma respuesta exista o no la cuenta (no revela qué correos están registrados).
const GENERIC = {
  message: "Si el correo está registrado, te enviamos un enlace para restablecer la contraseña.",
};

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Correo inválido" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (user) {
    const { token, tokenHash } = newResetToken();
    // Un enlace nuevo invalida los anteriores sin usar.
    await prisma.$transaction([
      prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } }),
      prisma.passwordResetToken.create({
        data: { userId: user.id, tokenHash, expiresAt: new Date(Date.now() + RESET_TTL_MS) },
      }),
    ]);
    const url = new URL("/restablecer", process.env.APP_URL || "http://localhost:3000");
    url.searchParams.set("token", token);
    // Envío tras responder: el tiempo de respuesta no delata si la cuenta existe.
    after(() => sendEmail({ to: [{ email: user.email, name: user.name }], ...passwordReset(user.name, url.toString()) }));
  }

  return NextResponse.json(GENERIC);
}
