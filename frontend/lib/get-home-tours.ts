import { getPlanes } from "@/lib/get-planes";
import { resolveMedia } from "@/lib/media-url";
import { HOME } from "@/content/home";
import type { HeroTour } from "@/types/HeroTours";
import type { HomeTour } from "@/types/HomeTours";
import type { Plane } from "@/types/Planes";

const HERO_COUNT = 3;
const DEST_COUNT = 5;

// Primer fragmento legible de una descripción Markdown, para el hero.
function snippet(md: string, max = 130): string {
  const text = md
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // enlaces → texto
    .replace(/[#>*_`~]/g, " ") // marcas Markdown
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s+\S*$/, "") + "…";
}

// Planes destacados para la Home, tomados de la BD. Cae al contenido
// estático (content/home.ts) sólo si todavía no hay planes publicados.
export async function getHomeTours(): Promise<{
  heroTours: HeroTour[];
  homeTours: HomeTour[];
}> {
  const { data } = await getPlanes({ page: 1 });

  if (data.length === 0) {
    return {
      heroTours: HOME.HeroTours.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        image: resolveMedia(t.image.url),
        url: t.url,
      })),
      homeTours: HOME.HomeTours.map((t) => ({
        id: t.id,
        title: t.title,
        price: t.price,
        location: t.location,
        image: resolveMedia(t.image.url),
        url: t.url,
      })),
    };
  }

  const heroTours: HeroTour[] = data.slice(0, HERO_COUNT).map((p: Plane) => ({
    id: p.id,
    title: p.title,
    description: snippet(p.description),
    image: resolveMedia(p.photo.url),
    url: `/planes/${p.url}`,
  }));

  const homeTours: HomeTour[] = data.slice(0, DEST_COUNT).map((p: Plane) => ({
    id: p.id,
    title: p.title,
    price: p.price,
    location: p.plan_location?.location ?? p.location,
    image: resolveMedia(p.photo.url),
    url: `/planes/${p.url}`,
    type: p.plan_type?.type || undefined,
  }));

  return { heroTours, homeTours };
}
