import { NextResponse, after } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { transitionRequest } from "@/lib/request-workflow";
import { notifyStatusChanged } from "@/lib/notifications";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

const schema = z.object({ note: z.string().max(1000).optional().nullable() });

// El cliente cancela una solicitud propia mientras está Pendiente o Contactada.
export async function POST(req: Request, { params }: Ctx) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  const reqId = Number(id);
  if (Number.isNaN(reqId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }
  const parsed = schema.safeParse((await req.json().catch(() => null)) ?? {});
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const result = await transitionRequest({
    id: reqId,
    to: "CANCELLED",
    note: parsed.data.note,
    actor: "CLIENT",
    actorId: user.id,
    ownerId: user.id,
  });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  after(() => notifyStatusChanged(result.eventId));
  return NextResponse.json({ ok: true });
}
