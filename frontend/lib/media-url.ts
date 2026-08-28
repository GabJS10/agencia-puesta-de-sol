import { STRAPI_HOST } from "@/lib/strapi";

/**
 * Construye la URL final de un archivo de media de Strapi.
 * - Si la url ya es absoluta (Cloudinary, http/https), la devuelve tal cual.
 * - Si es relativa (uploads locales en dev/SQLite), le antepone el host de Strapi.
 *
 * En componentes de cliente (donde process.env.STRAPI_HOST no existe) pasa `base`
 * explícitamente con el host recibido por props.
 */
export function resolveMedia(url?: string, base: string = STRAPI_HOST ?? ""): string {
  if (!url) return "";
  return url.startsWith("http") ? url : `${base}${url}`;
}
