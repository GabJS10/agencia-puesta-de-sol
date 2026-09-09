import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Imágenes de ejemplo (Unsplash está permitido en next.config.ts).
const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;

const TYPES = ["Aventura", "Cultural", "Playa", "Ecoturismo"];
const LOCATIONS = ["Cabo de la Vela", "Punta Gallinas", "Riohacha", "Palomino"];

type SeedPlan = {
  title: string;
  slug: string;
  price: number;
  location: string;
  type: string;
  planLocation: string;
  tags: string[];
  photoUrl: string;
  galleryUrls: string[];
  description: string;
  itinerary: string;
  includes: string;
  recommendations: string;
};

const PLANS: SeedPlan[] = [
  {
    title: "Cabo de la Vela Mágico",
    slug: "cabo-de-la-vela-magico",
    price: 450000,
    location: "Cabo de la Vela, La Guajira",
    type: "Playa",
    planLocation: "Cabo de la Vela",
    tags: ["3 días", "Todo incluido", "Atardeceres"],
    photoUrl: img("1507525428034-b723cf961d3e"),
    galleryUrls: [img("1519046904884-53103b34b206"), img("1505228395891-9a51e7e86bf6")],
    description:
      "## Donde el desierto abraza el Caribe\n\nVive tres días en **Cabo de la Vela**, tierra Wayúu de aguas turquesa y dunas doradas. Recorre el **Pilón de Azúcar**, el **Faro** y el **Ojo de Agua** mientras el atardecer tiñe el cielo de naranja.",
    itinerary:
      "1. **Día 1:** Salida desde Riohacha, llegada y almuerzo frente al mar.\n2. **Día 2:** Pilón de Azúcar, Faro y atardecer.\n3. **Día 3:** Ojo de Agua y regreso.",
    includes:
      "- Transporte 4x4\n- Hospedaje en chinchorros\n- Desayunos y cenas\n- Guía local Wayúu",
    recommendations:
      "- Lleva efectivo (no hay cajeros)\n- Protector solar y sombrero\n- Ropa ligera y una chaqueta para la noche",
  },
  {
    title: "Punta Gallinas Extremo",
    slug: "punta-gallinas-extremo",
    price: 720000,
    location: "Punta Gallinas, La Guajira",
    type: "Aventura",
    planLocation: "Punta Gallinas",
    tags: ["4 días", "Aventura", "Dunas de Taroa"],
    photoUrl: img("1682687220742-aba13b6e50ba"),
    galleryUrls: [img("1682687221038-404cb8830901"), img("1469474968028-56623f02e42e")],
    description:
      "## El punto más al norte de Suramérica\n\nUna expedición inolvidable hasta **Punta Gallinas**, donde las **Dunas de Taroa** caen directamente sobre el mar. Naturaleza pura, cultura Wayúu y paisajes de otro planeta.",
    itinerary:
      "1. **Día 1:** Riohacha → Cabo de la Vela.\n2. **Día 2:** Ruta a Punta Gallinas.\n3. **Día 3:** Dunas de Taroa y Bahía Hondita.\n4. **Día 4:** Regreso.",
    includes:
      "- Transporte 4x4\n- Hospedaje\n- Alimentación completa\n- Guía especializado",
    recommendations:
      "- Condición física básica\n- Hidratación constante\n- Cámara con batería extra",
  },
  {
    title: "Riohacha & Manaure Cultural",
    slug: "riohacha-manaure-cultural",
    price: 280000,
    location: "Riohacha, La Guajira",
    type: "Cultural",
    planLocation: "Riohacha",
    tags: ["2 días", "Cultura", "Salinas"],
    photoUrl: img("1533105079780-92b9be482077"),
    galleryUrls: [img("1528181304800-259b08848526")],
    description:
      "## Sabores y colores de la Guajira\n\nConoce el malecón de **Riohacha**, el mercado de mochilas Wayúu y las imponentes **Salinas de Manaure**, un mosaico rosado y blanco frente al mar.",
    itinerary:
      "1. **Día 1:** City tour por Riohacha y malecón.\n2. **Día 2:** Salinas de Manaure y flamencos.",
    includes: "- Transporte\n- Hospedaje 1 noche\n- Desayuno\n- Guía cultural",
    recommendations: "- Gafas de sol\n- Efectivo para artesanías\n- Calzado cómodo",
  },
  {
    title: "Palomino Río y Mar",
    slug: "palomino-rio-y-mar",
    price: 320000,
    location: "Palomino, La Guajira",
    type: "Ecoturismo",
    planLocation: "Palomino",
    tags: ["2 días", "Tubing", "Sierra Nevada"],
    photoUrl: img("1544551763-46a013bb70d5"),
    galleryUrls: [img("1502680390469-be75c86b636f")],
    description:
      "## Del río al Caribe en un solo día\n\nEn **Palomino** flotas por el río en neumático (**tubing**) desde la Sierra Nevada hasta encontrarte con el mar. Naturaleza, descanso y ecoturismo.",
    itinerary:
      "1. **Día 1:** Llegada y tarde de playa.\n2. **Día 2:** Tubing en el río Palomino.",
    includes: "- Transporte\n- Hospedaje ecológico\n- Desayuno\n- Equipo de tubing",
    recommendations: "- Ropa de baño\n- Bolsa impermeable\n- Repelente",
  },
];

async function main() {
  // 1. Admin (idempotente)
  const email = process.env.ADMIN_EMAIL ?? "admin@puestadelsol.com";
  const password = process.env.ADMIN_PASSWORD ?? "admin1234";
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: "ADMIN" },
    create: { email, passwordHash, name: "Administrador", role: "ADMIN" },
  });
  console.log(`✔ Admin: ${email}`);

  // 2. Tipos y ubicaciones
  for (const type of TYPES) {
    await prisma.planType.upsert({ where: { type }, update: {}, create: { type } });
  }
  for (const location of LOCATIONS) {
    await prisma.planLocation.upsert({
      where: { location },
      update: {},
      create: { location },
    });
  }
  console.log(`✔ ${TYPES.length} tipos, ${LOCATIONS.length} ubicaciones`);

  // 3. Planes (idempotente por slug)
  for (const p of PLANS) {
    const type = await prisma.planType.findUnique({ where: { type: p.type } });
    const loc = await prisma.planLocation.findUnique({
      where: { location: p.planLocation },
    });
    const data = {
      title: p.title,
      price: p.price,
      location: p.location,
      description: p.description,
      itinerary: p.itinerary,
      includes: p.includes,
      recommendations: p.recommendations,
      photoUrl: p.photoUrl,
      galleryUrls: p.galleryUrls,
      tags: p.tags,
      published: true,
      planTypeId: type?.id ?? null,
      planLocationId: loc?.id ?? null,
    };
    await prisma.plan.upsert({
      where: { slug: p.slug },
      update: data,
      create: { slug: p.slug, ...data },
    });
  }
  console.log(`✔ ${PLANS.length} planes`);
}

main()
  .then(() => console.log("Seed completado."))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
