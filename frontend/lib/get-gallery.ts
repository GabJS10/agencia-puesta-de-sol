import { query } from "@/lib/strapi";
import { GalleryImage } from "@/types/Gallery";

export async function getGallery(): Promise<GalleryImage[]> {
  const params = new URLSearchParams({
    "populate[image]": "true",
    sort: "order:asc",
    "pagination[pageSize]": "100",
  });

  const res = await query(`gallery-images?${params.toString()}`, {
    next: { revalidate: 60 },
  });

  return res?.data ?? [];
}
