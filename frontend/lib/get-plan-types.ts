import { query } from "@/lib/strapi";

export async function getPlanTypes() {
  const data = await query("plan-types");
  return data.data;
}
