"use server";

import { UserRole, WorkStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { workSchema } from "@/lib/validation/work";
import { requireAuthorAccess, requireRole, requireUser } from "@/server/current-user";

async function resolveAuthorId(formData: FormData) {
  const user = await requireUser();
  if (user.role === UserRole.AUTHOR) {
    if (!user.author) throw new Error("NO_AUTHOR_PROFILE");
    return user.author.id;
  }
  await requireRole([UserRole.CONTENT_ADMIN, UserRole.SUPER_ADMIN]);
  return String(formData.get("authorId") ?? "");
}

async function parseWork(formData: FormData, authorId: string) {
  const data = workSchema.parse(Object.fromEntries(formData));
  if (data.authorCategoryId) {
    const category = await db.authorCategory.findFirst({ where: { id: data.authorCategoryId, authorId } });
    if (!category) throw new Error("INVALID_CATEGORY");
  }
  return data;
}

export async function createWork(formData: FormData) {
  const user = await requireUser();
  const authorId = await resolveAuthorId(formData);
  await requireAuthorAccess(authorId);
  formData.set("slug", `work-${randomUUID()}`);
  const data = await parseWork(formData, authorId);
  const version = String(formData.get("version") ?? "1.0.0").trim();
  const work = await db.$transaction(async (tx) => {
    const created = await tx.work.create({ data: { ...data, authorId, createdById: user.id, updatedById: user.id } });
    const currentVersion = await tx.workVersion.create({ data: { workId: created.id, version, releasedAt: new Date(), changeLog: "首次发布。", minLabVersion: "latest", minWcglassVersion: "latest", createdById: user.id } });
    return tx.work.update({ where: { id: created.id }, data: { currentVersionId: currentVersion.id } });
  });
  redirect(`/admin/works/${work.id}/edit`);
}

export async function updateWork(formData: FormData) {
  const user = await requireUser();
  const workId = String(formData.get("workId") ?? "");
  const work = await db.work.findUniqueOrThrow({ where: { id: workId }, include: { author: true } });
  await requireAuthorAccess(work.authorId);
  const data = await parseWork(formData, work.authorId);
  await db.work.update({ where: { id: work.id }, data: { ...data, updatedById: user.id } });
  revalidatePath(`/admin/works/${work.id}/edit`);
}

export async function setWorkStatus(formData: FormData) {
  const workId = String(formData.get("workId") ?? "");
  const status = String(formData.get("status") ?? "") as WorkStatus;
  if (![WorkStatus.DRAFT, WorkStatus.PUBLISHED, WorkStatus.OFF_SHELF, WorkStatus.DELETED].includes(status)) throw new Error("INVALID_STATUS");
  const work = await db.work.findUniqueOrThrow({ where: { id: workId } });
  await requireAuthorAccess(work.authorId);
  await db.work.update({ where: { id: work.id }, data: { status, publishedAt: status === WorkStatus.PUBLISHED ? work.publishedAt ?? new Date() : work.publishedAt, deletedAt: status === WorkStatus.DELETED ? new Date() : null } });
  revalidatePath("/admin/works");
}

export async function restoreWork(formData: FormData) {
  await requireRole([UserRole.SUPER_ADMIN]);
  const workId = String(formData.get("workId") ?? "");
  await db.work.update({ where: { id: workId }, data: { status: WorkStatus.DRAFT, deletedAt: null } });
  revalidatePath("/admin/works");
}
