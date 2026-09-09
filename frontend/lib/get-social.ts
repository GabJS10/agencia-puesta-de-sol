import { SOCIAL } from "@/content/site";

// Contenido fijo (antes single type SocialMedia de Strapi). Ver content/site.ts.
export async function getSocial() {
  return SOCIAL;
}
