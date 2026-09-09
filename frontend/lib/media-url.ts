/**
 * Devuelve la URL final de una imagen.
 * Las URLs del backend propio son absolutas (Cloudinary/Unsplash), así que se
 * devuelven tal cual. `base` se mantiene por compatibilidad con llamadas previas
 * (para rutas relativas antepone el host recibido).
 */
export function resolveMedia(url?: string, base: string = ""): string {
  if (!url) return "";
  return url.startsWith("http") ? url : `${base}${url}`;
}
