import { query } from "@/lib/strapi";

export async function getPlanTypes() {
  const data = await query("plan-types", { next: { revalidate: 3600 } });
  return data.data;
}
