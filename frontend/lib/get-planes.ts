import { query } from "@/lib/strapi";

export async function getPlanes(page: number = 1) {
  const queryParams = new URLSearchParams({
    "populate[photo]": "true",
    "populate[gallery]": "true",
    "populate[tags]": "true",
    "pagination[page]": page.toString(),
    "pagination[pageSize]": "9",
  });

  const res = await query(`planes?${queryParams.toString()}`);

  return res;
}
