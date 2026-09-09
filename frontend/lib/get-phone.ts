import { PHONE } from "@/content/site";

// Contenido fijo (antes single type Phone de Strapi). Ver content/site.ts.
export async function getPhone(): Promise<string> {
  return PHONE;
}
