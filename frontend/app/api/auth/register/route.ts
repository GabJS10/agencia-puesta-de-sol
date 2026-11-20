import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword, setSessionCookie } from "@/lib/auth";

export const runtime = "nodejs";

const schema = z
  .object({
    name: z.string().min(2).max(60),
    email: z.string().email(),
    password: z.string().min(6).max(100),
    confirmPassword: z.string(),
    phone: z.string().min(7).max(20).optional(),
  })
  .refine((d) => d.password === d.confirmPassword, { path: ["confirmPassword"] });

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const mismatch = parsed.error.issues.some((i) => i.path[0] === "confirmPassword");
    return NextResponse.json(
      { error: mismatch ? "Las contraseñas no coinciden" : "Datos inválidos" },
      { status: 400 },
    );
  }
  const { name, email, password, phone } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "El correo ya está registrado" },
      { status: 409 },
    );
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { name, email, phone, passwordHash, role: "CLIENT" },
  });

  const sessionUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
  await setSessionCookie(sessionUser);
  return NextResponse.json({ user: sessionUser }, { status: 201 });
}
