import { GalleryImage } from "@/types/Gallery";
import { GALLERY } from "@/content/site";

// Contenido fijo (antes gallery-images de Strapi). Ver content/site.ts.
export async function getGallery(): Promise<GalleryImage[]> {
  return GALLERY;
}
