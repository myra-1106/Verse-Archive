"use server";

import { revalidatePath } from "next/cache";
import { UserRole, UserStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { authorProfileSchema, categorySchema } from "@/lib/validation/author";
import { requireAuthorAccess, requireRole, requireUser } from "@/server/current-user";

async function currentAuthorId() {
  const user = await requireUser();
  if (!user.author) throw new Error("NO_AUTHOR_PROFILE");
  return user.author.id;
}

export async function updateOwnAuthorProfile(formData: FormData) {
  const authorId = await currentAuthorId();
  await requireAuthorAccess(authorId);
  const data = authorProfileSchema.parse(Object.fromEntries(formData));
  await db.author.update({ where: { id: authorId }, data });
  revalidatePath("/admin/author");
  revalidatePath("/authors");
}

export async function createOwnCategory(formData: FormData) {
  const authorId = await currentAuthorId();
  await requireAuthorAccess(authorId);
  const { name } = categorySchema.parse(Object.fromEntries(formData));
  const last = await db.authorCategory.findFirst({
    where: { authorId },
    orderBy: { displayOrder: "desc" },
  });
  await db.authorCategory.create({
    data: { authorId, name, displayOrder: (last?.displayOrder ?? -1) + 1 },
  });
  revalidatePath("/admin/author/categories");
}

export async function deleteOwnCategory(formData: FormData) {
  const authorId = await currentAuthorId();
  await requireAuthorAccess(authorId);
  const categoryId = String(formData.get("categoryId") ?? "");
  const category = await db.authorCategory.findFirst({ where: { id: categoryId, authorId } });
  if (!category) throw new Error("CATEGORY_NOT_FOUND");

  await db.$transaction([
    db.work.updateMany({ where: { authorCategoryId: category.id }, data: { authorCategoryId: null } }),
    db.authorCategory.delete({ where: { id: category.id } }),
  ]);
  revalidatePath("/admin/author/categories");
}

export async function moveOwnCategory(formData: FormData) {
  const authorId = await currentAuthorId();
  await requireAuthorAccess(authorId);
  const categoryId = String(formData.get("categoryId") ?? "");
  const direction = formData.get("direction") === "up" ? -1 : 1;
  const categories = await db.authorCategory.findMany({
    where: { authorId },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
  });
  const index = categories.findIndex((item) => item.id === categoryId);
  const swapIndex = index + direction;
  if (index < 0 || swapIndex < 0 || swapIndex >= categories.length) return;
  await db.$transaction([
    db.authorCategory.update({ where: { id: categories[index].id }, data: { displayOrder: swapIndex } }),
    db.authorCategory.update({ where: { id: categories[swapIndex].id }, data: { displayOrder: index } }),
  ]);
  revalidatePath("/admin/author/categories");
}

export async function createAuthorWithAccount(formData: FormData) {
  await requireRole([UserRole.SUPER_ADMIN]);
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const publicWechatId = String(formData.get("publicWechatId") ?? "").trim();
  const accountWechatId = String(formData.get("accountWechatId") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!name || !publicWechatId || !/^[a-z0-9-]{2,50}$/.test(slug)) throw new Error("INVALID_AUTHOR");
  if (!/^[A-Za-z0-9_-]{2,32}$/.test(accountWechatId) || password.length < 8) throw new Error("INVALID_ACCOUNT");
  const passwordHash = await hashPassword(password);
  await db.$transaction(async (tx) => {
    const user = await tx.user.create({ data: { wechatId: accountWechatId, displayName: name, passwordHash, role: UserRole.AUTHOR, mustChangePassword: true } });
    await tx.author.create({ data: { name, slug, publicWechatId, accountUserId: user.id, status: "ACTIVE" } });
  });
  revalidatePath("/admin/authors");
}

export async function updateManagedAuthor(formData: FormData) {
  await requireRole([UserRole.CONTENT_ADMIN, UserRole.SUPER_ADMIN]);
  const authorId = String(formData.get("authorId") ?? "");
  const data = authorProfileSchema.parse(Object.fromEntries(formData));
  await db.author.update({ where: { id: authorId }, data });
  revalidatePath("/admin/authors");
}

export async function setAuthorAccountStatus(formData: FormData) {
  await requireRole([UserRole.SUPER_ADMIN]);
  const authorId = String(formData.get("authorId") ?? "");
  const status = formData.get("status") === "ACTIVE" ? UserStatus.ACTIVE : UserStatus.SUSPENDED;
  const author = await db.author.findUniqueOrThrow({ where: { id: authorId } });
  if (!author.accountUserId) return;
  await db.user.update({ where: { id: author.accountUserId }, data: { status, sessionVersion: { increment: 1 } } });
  revalidatePath(`/admin/authors/${authorId}/edit`);
}
