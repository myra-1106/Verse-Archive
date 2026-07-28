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
  await db.$transaction(DEFAULT_ENVIRONMENTS.map((name, displayOrder) =>
    db.environment.upsert({
      where: { name },
      update: { enabled: true, displayOrder },
      create: { name, displayOrder },
    }),
  ));
}
