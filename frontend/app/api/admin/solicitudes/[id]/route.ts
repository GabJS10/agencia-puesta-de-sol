import { NextResponse, after } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { transitionRequest } from "@/lib/request-workflow";
import { notifyStatusChanged } from "@/lib/notifications";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

const schema = z.object({
  status: z.enum(["CONTACTED", "CONFIRMED", "COMPLETED", "REJECTED", "CANCELLED"]),
  note: z.string().max(1000).optional().nullable(),
});

export async function PATCH(req: Request, { params }: Ctx) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const { id } = await params;
  const reqId = Number(id);
  if (Number.isNaN(reqId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
  }

  const result = await transitionRequest({
    id: reqId,
    to: parsed.data.status,
    note: parsed.data.note,
    actor: "ADMIN",
    actorId: admin.id,
  });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  after(() => notifyStatusChanged(result.eventId));
  return NextResponse.json({ ok: true });
}
