import { query } from "@/lib/strapi";

export async function getSocial() {
  const data = await query("social-media");
  return data.data;
}
