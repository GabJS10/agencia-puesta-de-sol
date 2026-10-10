// Plantillas de correo (HTML con estilos inline + texto plano). Funciones puras:
// reciben datos ya cargados y devuelven { subject, html, text }.
import type { EventActor, RequestStatus } from "@prisma/client";
import type { EmailContent } from "@/lib/email/brevo";
import { formatPrice } from "@/helpers/formatPrice";
import { STATUS_META } from "@/lib/request-status";

export type RequestEmailData = {
  id: number;
  name: string;
  email: string;
  phone: string;
  planTitle: string | null;
  planUrl: string | null;
  dates: string; // ya formateadas ("14 oct 2026" o rango)
  guests: number;
  message: string | null;
  holdUntil: string | null; // ya formateado
  estimatedTotal: number | null;
  accountUrl: string;
  adminUrl: string;
};

const C = {
  noche: "#171026",
  arena: "#f4ead6",
  surface: "#fbf5e9",
  ink: "#2a2018",
  muted: "#7a6a55",
  sol: "#f5a538",
  barro: "#b85c38",
  border: "#e1cfa9",
};

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const nl2br = (value: string) => esc(value).replace(/\n/g, "<br>");

function layout({
  preheader,
  title,
  intro,
  body,
  cta,
}: {
  preheader: string;
  title: string;
  intro: string; // HTML ya escapado
  body?: string; // HTML ya escapado
  cta?: { label: string; href: string };
}): string {
  const button = cta
    ? `<tr><td style="padding:8px 32px 32px">
        <a href="${esc(cta.href)}" style="display:inline-block;background:${C.sol};color:#2a1a0a;font-weight:700;text-decoration:none;padding:12px 22px;border-radius:10px">${esc(cta.label)}</a>
      </td></tr>`
    : "";
  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:${C.arena};font-family:Manrope,Segoe UI,Helvetica,Arial,sans-serif;color:${C.ink}">
<span style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.arena};padding:24px 12px">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${C.surface};border:1px solid ${C.border};border-radius:16px;overflow:hidden">
  <tr><td style="background:${C.noche};padding:20px 32px">
    <table role="presentation" cellpadding="0" cellspacing="0"><tr>
      <td style="width:28px;height:28px;border-radius:50%;background:${C.sol}"></td>
      <td style="padding-left:12px;color:${C.arena};font-size:17px;font-weight:700">Puesta del Sol</td>
    </tr></table>
  </td></tr>
  <tr><td style="padding:28px 32px 8px">
    <h1 style="margin:0 0 12px;font-size:22px;line-height:1.25;color:${C.ink}">${esc(title)}</h1>
    <p style="margin:0;font-size:15px;line-height:1.6;color:${C.ink}">${intro}</p>
  </td></tr>
  ${body ? `<tr><td style="padding:16px 32px 8px">${body}</td></tr>` : ""}
  ${button}
  <tr><td style="padding:18px 32px;border-top:1px solid ${C.border};font-size:12px;line-height:1.5;color:${C.muted}">
    Agencia de viajes Puesta del Sol · La Guajira, Colombia.<br>
    Recibes este correo por una solicitud hecha en nuestro sitio.
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

function detailsTable(d: RequestEmailData, extra: [string, string][] = []): string {
  const rows: [string, string][] = [
    ["Plan", d.planTitle ?? "Consulta general"],
    ["Fechas", d.dates],
    ["Personas", String(d.guests)],
    ...(d.estimatedTotal ? ([["Valor estimado", formatPrice(d.estimatedTotal)]] as [string, string][]) : []),
    ...extra,
  ];
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${C.border};border-radius:12px;font-size:14px">
${rows
  .map(
    ([k, v], i) => `<tr><td style="padding:10px 14px;color:${C.muted};width:38%;${i ? `border-top:1px solid ${C.border};` : ""}">${esc(k)}</td><td style="padding:10px 14px;font-weight:600;${i ? `border-top:1px solid ${C.border};` : ""}">${esc(v)}</td></tr>`,
  )
  .join("\n")}
</table>`;
}

function noteBlock(label: string, note: string): string {
  return `<div style="margin-top:16px;border:1px solid ${C.border};background:${C.arena};padding:12px 16px;border-radius:8px">
  <div style="font-size:12px;font-weight:700;color:${C.barro};text-transform:uppercase;letter-spacing:.04em">${esc(label)}</div>
  <div style="margin-top:6px;font-size:14px;line-height:1.6">${nl2br(note)}</div>
</div>`;
}

function textDetails(d: RequestEmailData): string {
  return [
    `Plan: ${d.planTitle ?? "Consulta general"}`,
    `Fechas: ${d.dates}`,
    `Personas: ${d.guests}`,
    d.estimatedTotal ? `Valor estimado: ${formatPrice(d.estimatedTotal)}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

const plan = (d: RequestEmailData) => d.planTitle ?? "tu solicitud";

/** Al cliente: acuse de recibo de la solicitud. */
export function requestReceivedClient(d: RequestEmailData): EmailContent {
  const hold = d.holdUntil
    ? `Tu cupo queda apartado hasta el <strong>${esc(d.holdUntil)}</strong> mientras la confirmamos.`
    : "Te contactaremos muy pronto para confirmar los detalles.";
  return {
    subject: `Recibimos tu solicitud · ${plan(d)}`,
    html: layout({
      preheader: `Solicitud #${d.id} recibida`,
      title: `¡Hola, ${d.name}! Recibimos tu solicitud`,
      intro: `Gracias por elegir Puesta del Sol. ${hold}`,
      body: detailsTable(d) + (d.message ? noteBlock("Tu mensaje", d.message) : ""),
      cta: { label: "Ver mis solicitudes", href: d.accountUrl },
    }),
    text: [
      `¡Hola, ${d.name}! Recibimos tu solicitud #${d.id}.`,
      d.holdUntil
        ? `Tu cupo queda apartado hasta el ${d.holdUntil} mientras la confirmamos.`
        : "Te contactaremos muy pronto para confirmar los detalles.",
      "",
      textDetails(d),
      "",
      `Sigue el estado en: ${d.accountUrl}`,
    ].join("\n"),
  };
}

/** A la agencia: nueva solicitud. */
export function requestReceivedAdmin(d: RequestEmailData): EmailContent {
  const contact: [string, string][] = [
    ["Cliente", d.name],
    ["Correo", d.email],
    ["Teléfono", d.phone],
  ];
  return {
    subject: `Nueva solicitud #${d.id} · ${plan(d)} · ${d.dates}`,
    html: layout({
      preheader: `${d.name} solicitó ${plan(d)}`,
      title: `Nueva solicitud de ${d.name}`,
      intro: d.holdUntil
        ? `El cupo queda apartado hasta el <strong>${esc(d.holdUntil)}</strong>. Si no se confirma antes, vence solo.`
        : "Revisa la solicitud y contacta al cliente.",
      body:
        detailsTable(d, contact) +
        (d.message ? noteBlock("Mensaje del cliente", d.message) : ""),
      cta: { label: "Gestionar solicitud", href: d.adminUrl },
    }),
    text: [
      `Nueva solicitud #${d.id} de ${d.name} (${d.email}, ${d.phone}).`,
      textDetails(d),
      d.message ? `Mensaje: ${d.message}` : null,
      d.holdUntil ? `Apartado hasta: ${d.holdUntil}` : null,
      "",
      `Gestionar: ${d.adminUrl}`,
    ]
      .filter((l) => l !== null)
      .join("\n"),
  };
}

const STATUS_COPY: Partial<
  Record<RequestStatus, { subject: string; title: string; intro: string }>
> = {
  CONTACTED: {
    subject: "Estamos gestionando tu solicitud",
    title: "Estamos gestionando tu solicitud",
    intro: "Nuestro equipo ya está trabajando en tu solicitud y se pondrá en contacto contigo.",
  },
  CONFIRMED: {
    subject: "¡Tu reserva está confirmada!",
    title: "¡Tu reserva está confirmada!",
    intro: "Todo listo: tu cupo quedó reservado en firme. Te esperamos.",
  },
  COMPLETED: {
    subject: "Gracias por viajar con nosotros",
    title: "Gracias por viajar con Puesta del Sol",
    intro: "Esperamos que hayas disfrutado La Guajira. ¡Te esperamos en tu próxima aventura!",
  },
  REJECTED: {
    subject: "No pudimos atender tu solicitud",
    title: "No pudimos atender tu solicitud",
    intro: "Lo sentimos: esta vez no podemos atender tu solicitud.",
  },
  EXPIRED: {
    subject: "Tu solicitud venció",
    title: "Tu solicitud venció",
    intro:
      "El cupo que tenías apartado venció sin confirmarse. Si aún quieres viajar, vuelve a solicitar el plan.",
  },
};

/** Al cliente: cambio de estado de su solicitud. */
export function statusChangedClient(
  d: RequestEmailData,
  ev: { toStatus: RequestStatus; actor: EventActor; note: string | null },
): EmailContent {
  const cancelledByClient = ev.toStatus === "CANCELLED" && ev.actor === "CLIENT";
  const copy =
    ev.toStatus === "CANCELLED"
      ? cancelledByClient
        ? {
            subject: "Cancelaste tu solicitud",
            title: "Cancelaste tu solicitud",
            intro: "Tu solicitud quedó cancelada y el cupo fue liberado.",
          }
        : {
            subject: "Tu solicitud fue cancelada",
            title: "Tu solicitud fue cancelada",
            intro: "La agencia canceló tu solicitud y el cupo fue liberado.",
          }
      : (STATUS_COPY[ev.toStatus] ?? {
          subject: `Tu solicitud ahora está ${STATUS_META[ev.toStatus].label}`,
          title: `Estado: ${STATUS_META[ev.toStatus].label}`,
          intro: STATUS_META[ev.toStatus].description,
        });

  let intro = esc(copy.intro);
  if (ev.toStatus === "CONTACTED" && d.holdUntil) {
    intro += ` Tu cupo sigue apartado hasta el <strong>${esc(d.holdUntil)}</strong>.`;
  }
  const noteLabel =
    ev.toStatus === "REJECTED" || ev.toStatus === "CANCELLED" ? "Motivo" : "Mensaje de la agencia";
  const showNote = ev.note && !cancelledByClient;
  const cta =
    ev.toStatus === "EXPIRED" && d.planUrl
      ? { label: "Volver a solicitar", href: d.planUrl }
      : { label: "Ver mis solicitudes", href: d.accountUrl };

  return {
    subject: `${copy.subject} · ${plan(d)}`,
    html: layout({
      preheader: `${STATUS_META[ev.toStatus].label} · solicitud #${d.id}`,
      title: copy.title,
      intro: `Hola, ${esc(d.name)}. ${intro}`,
      body: detailsTable(d) + (showNote ? noteBlock(noteLabel, ev.note!) : ""),
      cta,
    }),
    text: [
      `Hola, ${d.name}. ${copy.intro}`,
      ev.toStatus === "CONTACTED" && d.holdUntil ? `Cupo apartado hasta: ${d.holdUntil}` : null,
      "",
      textDetails(d),
      showNote ? `\n${noteLabel}: ${ev.note}` : null,
      "",
      `${cta.label}: ${cta.href}`,
    ]
      .filter((l) => l !== null)
      .join("\n"),
  };
}

/** A la agencia: el cliente canceló su solicitud. */
export function requestCancelledByClientAdmin(
  d: RequestEmailData,
  note: string | null,
): EmailContent {
  return {
    subject: `Solicitud #${d.id} cancelada por el cliente · ${plan(d)}`,
    html: layout({
      preheader: `${d.name} canceló su solicitud`,
      title: `${d.name} canceló su solicitud`,
      intro: "El cupo que apartaba quedó liberado.",
      body:
        detailsTable(d, [
          ["Cliente", d.name],
          ["Correo", d.email],
          ["Teléfono", d.phone],
        ]) + (note ? noteBlock("Motivo del cliente", note) : ""),
      cta: { label: "Ver solicitud", href: d.adminUrl },
    }),
    text: [
      `${d.name} (${d.email}) canceló su solicitud #${d.id}.`,
      textDetails(d),
      note ? `Motivo: ${note}` : null,
      "",
      `Ver: ${d.adminUrl}`,
    ]
      .filter((l) => l !== null)
      .join("\n"),
  };
}
