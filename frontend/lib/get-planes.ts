import { query } from "@/lib/strapi";

interface GetPlanesParams {
  page?: number;
  search?: string;
  sort?: string;
  types?: string[];
  locations?: string[];
}

export async function getPlanes({
  page = 1,
  search = "",
  sort = "",
  types = [],
  locations = [],
}: GetPlanesParams) {
  console.log("getPlanes", { page, search, sort, types, locations });
  console.log("De nuevo aca");
  const queryParams = new URLSearchParams({
    "populate[photo]": "true",
    "populate[gallery]": "true",
    "populate[plan_location]": "true",
    "populate[plan_type]": "true",
    "populate[tags]": "true",
    "pagination[page]": page.toString(),
    "pagination[pageSize]": "9",
  });

  // 1. Search Filter (Title contains)
  if (search) {
    queryParams.append("filters[title][$containsi]", search);
  }

  // 2. Type Filter (IN array)
  if (types.length > 0) {
    types.forEach((type, index) => {
      queryParams.append(`filters[plan_type][type][$in][${index}]`, type);
    });
  }

  // 3. Location Filter (IN array)
  if (locations.length > 0) {
    locations.forEach((location, index) => {
      queryParams.append(
        `filters[plan_location][location][$in][${index}]`,
        location,
      );
    });
  }

  // 4. Sort
  if (sort) {
    queryParams.append("sort", sort);
  } else {
    // Default sort if none provided
    queryParams.append("sort", "createdAt:desc");
  }

  const res = await query(`planes?${queryParams.toString()}`, {
    next: { revalidate: 60 },
  });

  return res;
}
