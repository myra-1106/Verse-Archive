"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAuthorAccess, requireUser } from "@/server/current-user";

async function ownAuthorId() {
  const user = await requireUser();
  if (!user.author) throw new Error("NO_AUTHOR_PROFILE");
  await requireAuthorAccess(user.author.id);
  return user.author.id;
}

function text(data: FormData, key: string) {
  return String(data.get(key) ?? "").trim();
}

function cents(value: string) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) throw new Error("价格格式不正确");
  return Math.round(amount * 100);
}

async function templateData(formData: FormData, authorId: string) {
  const environmentIds = [...new Set(formData.getAll("environmentIds").map(String).filter(Boolean))];
  if (!text(formData, "name")) throw new Error("请输入模板名称");
  const count = await db.environment.count({ where: { id: { in: environmentIds }, enabled: true } });
  if (!environmentIds.length || count !== environmentIds.length) throw new Error("请选择适配环境");
  return {
    authorId,
    name: text(formData, "name"),
    directPriceCents: cents(text(formData, "directPriceYuan")),
    repostPriceCents: cents(text(formData, "repostPriceYuan")),
    features: text(formData, "features"),
    usageRequirements: text(formData, "usageRequirements"),
    acquisitionMethod: text(formData, "acquisitionMethod"),
    repostRequirements: text(formData, "repostRequirements"),
    purchaseNotes: text(formData, "purchaseNotes"),
    contactDetails: text(formData, "contactDetails"),
    otherNotes: text(formData, "otherNotes"),
    environments: { create: environmentIds.map((environmentId) => ({ environmentId })) },
  };
}

export async function saveTemplate(formData: FormData) {
  const authorId = await ownAuthorId();
  const id = text(formData, "templateId");
  const data = await templateData(formData, authorId);
  if (id) {
    const existing = await db.authorTemplate.findFirstOrThrow({ where: { id, authorId } });
    await db.authorTemplate.update({ where: { id: existing.id }, data: { ...data, environments: { deleteMany: {}, create: data.environments.create } } });
  } else {
    await db.authorTemplate.create({ data: { ...data, displayOrder: await db.authorTemplate.count({ where: { authorId } }) } });
  }
  revalidatePath("/admin/templates");
  redirect("/admin/templates?saved=1");
}

export async function copyTemplate(formData: FormData) {
  const authorId = await ownAuthorId();
  const source = await db.authorTemplate.findFirstOrThrow({
    where: { id: text(formData, "templateId"), authorId },
    include: { environments: true },
  });
  let name = `${source.name} 副本`;
  if (await db.authorTemplate.findFirst({ where: { authorId, name } })) name = `${name} ${Date.now()}`;
  await db.authorTemplate.create({ data: {
    authorId, name, directPriceCents: source.directPriceCents, repostPriceCents: source.repostPriceCents,
    features: source.features, usageRequirements: source.usageRequirements, acquisitionMethod: source.acquisitionMethod,
    repostRequirements: source.repostRequirements, purchaseNotes: source.purchaseNotes, contactDetails: source.contactDetails,
    otherNotes: source.otherNotes, displayOrder: await db.authorTemplate.count({ where: { authorId } }),
    environments: { create: source.environments.map(({ environmentId }) => ({ environmentId })) },
  } });
  revalidatePath("/admin/templates");
  redirect("/admin/templates?copied=1");
}

export async function deleteTemplate(formData: FormData) {
  const authorId = await ownAuthorId();
  const template = await db.authorTemplate.findFirstOrThrow({ where: { id: text(formData, "templateId"), authorId } });
  await db.authorTemplate.delete({ where: { id: template.id } });
  revalidatePath("/admin/templates");
  redirect("/admin/templates?deleted=1");
}

export async function moveTemplate(formData: FormData) {
  const authorId = await ownAuthorId();
  const templates = await db.authorTemplate.findMany({ where: { authorId }, orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }] });
  const index = templates.findIndex(({ id }) => id === text(formData, "templateId"));
  const swap = index + (text(formData, "direction") === "up" ? -1 : 1);
  if (index < 0 || swap < 0 || swap >= templates.length) return;
  await db.$transaction([
    db.authorTemplate.update({ where: { id: templates[index].id }, data: { displayOrder: swap } }),
    db.authorTemplate.update({ where: { id: templates[swap].id }, data: { displayOrder: index } }),
  ]);
  revalidatePath("/admin/templates");
  redirect("/admin/templates?moved=1");
}
