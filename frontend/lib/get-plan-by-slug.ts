import { prisma } from "@/lib/db";
import { planInclude, toPlane } from "@/lib/plan-map";
import { Plane } from "@/types/Planes";

export async function getPlanBySlug(slug: string): Promise<Plane | null> {
  const plan = await prisma.plan.findFirst({
    where: { slug, published: true },
    include: planInclude,
  });

  return plan ? toPlane(plan) : null;
}
