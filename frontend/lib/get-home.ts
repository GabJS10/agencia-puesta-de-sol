import { HOME } from "@/content/home";

// Contenido fijo (antes single type Home de Strapi). Ver content/home.ts.
export async function getHome() {
  return HOME;
}
