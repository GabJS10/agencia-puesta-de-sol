import { query } from "@/lib/strapi";

export async function getPlanLocations() {
  const data = await query("plan-locations", { next: { revalidate: 3600 } });
  return data.data;
}
