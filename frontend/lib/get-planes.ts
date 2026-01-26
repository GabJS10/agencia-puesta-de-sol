import { query } from "@/lib/strapi";

export async function getPlanes(page: number = 1) {
  const queryParams = new URLSearchParams({
    "populate[photo]": "true",
    "populate[gallery]": "true",
    "populate[plan_location]": "true",
    "populate[plan_type]": "true",
    "populate[tags]": "true",
    "pagination[page]": page.toString(),
    "pagination[pageSize]": "9",
  });

  const res = await query(`planes?${queryParams.toString()}`, {
    next: { revalidate: 60 },
  });

  return res;
}
