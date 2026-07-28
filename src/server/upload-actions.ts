"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { saveImage } from "@/lib/storage";
import { requireAuthorAccess, requireUser } from "@/server/current-user";

type AuthorImageKind = "avatar" | "cover" | "wechatQr";

async function createAsset(file: File, uploadedById: string, altText: string) {
  if (!file.size) throw new Error("请选择图片");
  const saved = await saveImage(file);
  return db.asset.create({
    data: {
      storageKey: saved.key,
      mimeType: saved.mimeType,
      width: saved.width,
      height: saved.height,
      sizeBytes: saved.sizeBytes,
      uploadedById,
      altText,
    },
  });
}

export async function uploadAuthorImage(formData: FormData) {
  const authorId = String(formData.get("authorId") ?? "");
  const kind = String(formData.get("kind") ?? "") as AuthorImageKind;
  if (!["avatar", "cover", "wechatQr"].includes(kind)) throw new Error("INVALID_IMAGE_KIND");
  const user = await requireAuthorAccess(authorId);
  const author = await db.author.findUniqueOrThrow({ where: { id: authorId } });
  const asset = await createAsset(
    formData.get("image") as File,
    user.id,
    kind === "avatar" ? `${author.name}头像` : kind === "cover" ? `${author.name}代表作品` : `${author.name}微信二维码`,
  );
  const field = kind === "avatar" ? "avatarAssetId" : kind === "cover" ? "coverAssetId" : "wechatQrAssetId";
  await db.author.update({ where: { id: authorId }, data: { [field]: asset.id } });
  revalidatePath("/admin/author");
  revalidatePath(`/admin/authors/${authorId}/edit`);
  revalidatePath("/");
  revalidatePath(`/authors/${author.slug}`);
}

export async function uploadWorkMainImage(formData: FormData) {
  const workId = String(formData.get("workId") ?? "");
  const work = await db.work.findUniqueOrThrow({ where: { id: workId } });
  const user = await requireAuthorAccess(work.authorId);
  const asset = await createAsset(formData.get("image") as File, user.id, `${work.name}主预览图`);
  await db.work.update({ where: { id: work.id }, data: { mainAssetId: asset.id, updatedById: user.id } });
  revalidatePath(`/admin/works/${work.id}/edit`);
  revalidatePath("/");
}

export async function uploadWorkPreviewImages(formData: FormData) {
  const workId = String(formData.get("workId") ?? "");
  const work = await db.work.findUniqueOrThrow({ where: { id: workId } });
  const user = await requireAuthorAccess(work.authorId);
  const files = formData.getAll("images").filter((value): value is File => value instanceof File && value.size > 0);
  if (!files.length) throw new Error("请选择图片");
  const last = await db.workImage.findFirst({ where: { workId }, orderBy: { sortOrder: "desc" } });

  for (const [index, file] of files.entries()) {
    const asset = await createAsset(file, user.id, `${work.name}预览图`);
    await db.workImage.create({
      data: { workId, assetId: asset.id, sortOrder: (last?.sortOrder ?? -1) + index + 1 },
    });
  }
  revalidatePath(`/admin/works/${work.id}/edit`);
  revalidatePath("/");
}

export async function moveWorkPreviewImage(formData: FormData) {
  const imageId = String(formData.get("imageId") ?? "");
  const direction = formData.get("direction") === "up" ? -1 : 1;
  const image = await db.workImage.findUniqueOrThrow({ where: { id: imageId }, include: { work: true } });
  await requireAuthorAccess(image.work.authorId);
  const images = await db.workImage.findMany({ where: { workId: image.workId }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
  const index = images.findIndex((item) => item.id === imageId);
  const swapIndex = index + direction;
  if (index < 0 || swapIndex < 0 || swapIndex >= images.length) return;
  await db.$transaction([
    db.workImage.update({ where: { id: images[index].id }, data: { sortOrder: swapIndex } }),
    db.workImage.update({ where: { id: images[swapIndex].id }, data: { sortOrder: index } }),
  ]);
  revalidatePath(`/admin/works/${image.workId}/edit`);
}

export async function deleteWorkPreviewImage(formData: FormData) {
  const imageId = String(formData.get("imageId") ?? "");
  const image = await db.workImage.findUniqueOrThrow({ where: { id: imageId }, include: { work: true } });
  const user = await requireUser();
  await requireAuthorAccess(image.work.authorId);
  await db.$transaction([
    db.workImage.delete({ where: { id: image.id } }),
    db.asset.update({ where: { id: image.assetId }, data: { deletedAt: new Date() } }),
    db.work.update({ where: { id: image.workId }, data: { updatedById: user.id } }),
  ]);
  revalidatePath(`/admin/works/${image.workId}/edit`);
  revalidatePath("/");
}
