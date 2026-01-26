import { query } from "@/lib/strapi";

export async function getPlanLocations() {
  const data = await query("plan-locations");
  return data.data;
}
