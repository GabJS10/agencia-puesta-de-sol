import { query } from "@/lib/strapi";

export async function getPhone() {
  const res = await query("phone");
  // Strapi Single Type usually returns { data: { id: ..., attributes: { ... } } }
  // or if using a transformer/plugin, it might be flatter.
  // We'll access the phone property safely.

  const phone = res?.data?.number || res?.data?.attributes?.number;
  return phone as string;
}
