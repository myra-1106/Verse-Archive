import { db } from "@/lib/db";

export const DEFAULT_ENVIRONMENTS = [
  "LAB",
  "WCGlass",
  "XOS",
  "白衣",
  "主题盒子",
  "气泡盒子",
] as const;

export async function ensureDefaultEnvironments() {
  const environments = await db.$transaction(DEFAULT_ENVIRONMENTS.map((name, displayOrder) =>
    db.environment.upsert({
      where: { name },
      update: { enabled: true, displayOrder },
      create: { name, displayOrder },
    }),
  ));
  const [lab, wcglass] = environments;
  const [labWorks, wcglassWorks] = await Promise.all([
    db.work.findMany({ where: { supportsLab: true, environments: { none: { environmentId: lab.id } } }, select: { id: true } }),
    db.work.findMany({ where: { supportsWcglass: true, environments: { none: { environmentId: wcglass.id } } }, select: { id: true } }),
  ]);
  await db.workEnvironment.createMany({
    data: [
      ...labWorks.map(({ id }) => ({ workId: id, environmentId: lab.id })),
      ...wcglassWorks.map(({ id }) => ({ workId: id, environmentId: wcglass.id })),
    ],
    skipDuplicates: true,
  });
}
