import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { planInclude, toPlane } from "@/lib/plan-map";

interface GetPlanesParams {
  page?: number;
  search?: string;
  sort?: string;
  types?: string[];
  locations?: string[];
}

const PAGE_SIZE = 9;

// Traduce el `sort` estilo Strapi ("campo:dir") a orderBy de Prisma.
function parseSort(sort: string): Prisma.PlanOrderByWithRelationInput {
  const [field, dir] = sort.split(":");
  const direction: Prisma.SortOrder = dir === "asc" ? "asc" : "desc";
  switch (field) {
    case "price":
      return { price: direction };
    case "title":
      return { title: direction };
    case "createdAt":
      return { createdAt: direction };
    default:
      return { createdAt: "desc" };
  }
}

export async function getPlanes({
  page = 1,
  search = "",
  sort = "",
  types = [],
  locations = [],
}: GetPlanesParams) {
  const where: Prisma.PlanWhereInput = { published: true };

  if (search) {
    where.title = { contains: search, mode: "insensitive" };
  }
  if (types.length > 0) {
    where.planType = { type: { in: types } };
  }
  if (locations.length > 0) {
    where.planLocation = { location: { in: locations } };
  }

  const orderBy = sort ? parseSort(sort) : { createdAt: "desc" as const };

  const [total, rows] = await Promise.all([
    prisma.plan.count({ where }),
    prisma.plan.findMany({
      where,
      include: planInclude,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  return {
    data: rows.map(toPlane),
    meta: {
      pagination: {
        page,
        pageSize: PAGE_SIZE,
        pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
        total,
      },
    },
  };
}
