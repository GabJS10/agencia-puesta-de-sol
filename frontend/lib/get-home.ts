import { query } from "@/lib/strapi";

export async function getHome() {
  const data = await query("home?populate=*");
  return data.data;
}
