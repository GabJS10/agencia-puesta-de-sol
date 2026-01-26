import { query } from "@/lib/strapi";

export async function getHome() {
  const data = await query(
    "home?populate[HeroTours][populate]=image&populate[HomeTours][populate]=image&populate[HomeReviews][populate]=photo&populate[Footer][populate]=image&populate[estadistica][populate]=*",
    { next: { revalidate: 3600 } }, // Cache for 1 hour
  );

  return data.data;
}
