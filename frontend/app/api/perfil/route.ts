import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  getSession,
  hashPassword,
  verifyPassword,
  setSessionCookie,
} from "@/lib/auth";

export const runtime = "nodejs";

const schema = z
  .object({
    name: z.string().min(2).max(60),
    email: z.string().email(),
    phone: z.string().min(7).max(20).optional().or(z.literal("")),
    currentPassword: z.string().optional(),
    newPassword: z.string().min(6).max(100).optional(),
  })
  .refine((d) => !d.newPassword || !!d.currentPassword, {
    message: "Ingresa tu contraseña actual para cambiarla",
    path: ["currentPassword"],
  });

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 },
    );
  }
  const { name, email, phone, currentPassword, newPassword } = parsed.data;

  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  // Email único (si cambió).
  if (email !== user.email) {
    const taken = await prisma.user.findUnique({ where: { email } });
    if (taken) {
      return NextResponse.json(
        { error: "Ese correo ya está en uso" },
        { status: 409 },
      );
    }
  }

  // Cambio de contraseña (opcional).
  let passwordHash: string | undefined;
  if (newPassword) {
    const ok = await verifyPassword(currentPassword!, user.passwordHash);
    if (!ok) {
      return NextResponse.json(
        { error: "La contraseña actual es incorrecta" },
        { status: 400 },
      );
    }
    passwordHash = await hashPassword(newPassword);
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      name,
      email,
      phone: phone ? phone : null,
      ...(passwordHash ? { passwordHash } : {}),
    },
  });

  const sessionUser = {
    id: updated.id,
    email: updated.email,
    name: updated.name,
    role: updated.role,
  };
  // Refresca la cookie (name/email pudieron cambiar).
  await setSessionCookie(sessionUser);

  return NextResponse.json({ user: sessionUser });
}
