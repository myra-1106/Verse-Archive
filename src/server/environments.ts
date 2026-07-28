import { db } from "@/lib/db";

export async function ensureDefaultEnvironments() {
  const [lab, wcglass] = await db.$transaction([
    db.environment.upsert({ where: { name: "LAB" }, update: {}, create: { name: "LAB", displayOrder: 0 } }),
    db.environment.upsert({ where: { name: "WCGlass" }, update: {}, create: { name: "WCGlass", displayOrder: 1 } }),
  ]);
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
