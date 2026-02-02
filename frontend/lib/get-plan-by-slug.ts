import { query } from "@/lib/strapi";
import { Plane } from "@/types/Planes";

export async function getPlanBySlug(slug: string): Promise<Plane | null> {
  const queryParams = new URLSearchParams({
    "filters[url][$eq]": slug,
    "populate[photo]": "true",
    "populate[gallery]": "true",
    "populate[tags]": "true",
    "populate[plan_location]": "true",
    "populate[plan_type]": "true",
  });

  const res = await query(`planes?${queryParams.toString()}`, {
    next: { revalidate: 60 },
  });

  if (!res.data || res.data.length === 0) {
    return null;
  }

  return res.data[0];
}
