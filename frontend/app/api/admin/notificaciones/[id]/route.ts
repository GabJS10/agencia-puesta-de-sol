import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { countUnread } from "@/lib/admin-notifications";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

async function target(ctx: Ctx) {
  const admin = await requireAdmin();
  if (!admin) return { error: NextResponse.json({ error: "No autorizado" }, { status: 403 }) };
  const id = Number((await ctx.params).id);
  if (Number.isNaN(id)) return { error: NextResponse.json({ error: "ID inválido" }, { status: 400 }) };
  return { admin, id };
}

/** { read: boolean } */
export async function PATCH(req: Request, ctx: Ctx) {
  const t = await target(ctx);
  if ("error" in t) return t.error;
  const parsed = z.object({ read: z.boolean() }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const { read } = parsed.data;
  // Al marcar leída se conserva la primera fecha de lectura.
  await prisma.notification.updateMany({
    where: { id: t.id, userId: t.admin.id, readAt: read ? null : { not: null } },
    data: { readAt: read ? new Date() : null },
  });
  return NextResponse.json({ ok: true, unread: await countUnread(t.admin.id) });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const t = await target(ctx);
  if ("error" in t) return t.error;
  const res = await prisma.notification.deleteMany({ where: { id: t.id, userId: t.admin.id } });
  if (res.count === 0) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  return NextResponse.json({ ok: true, unread: await countUnread(t.admin.id) });
}
