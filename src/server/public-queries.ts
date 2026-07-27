import { AuthorStatus, WorkStatus } from "@prisma/client";
import { db } from "@/lib/db";
import type { PublicWork } from "@/components/work-card";

const publicStatuses = [WorkStatus.PUBLISHED, WorkStatus.OFF_SHELF];
const url = (key?: string | null) => key ? `/${key.replace(/^\/+/, "")}` : null;

export async function getAuthors(limit?: number) {
  const authors = await db.author.findMany({ where: { status: AuthorStatus.ACTIVE }, take: limit, orderBy: [{ displayOrder: "asc" }, { name: "asc" }], include: { avatarAsset: true, coverAsset: true, _count: { select: { works: { where: { status: { in: publicStatuses } } } } } } });
  return authors.map((author) => ({ slug: author.slug, name: author.name, bio: author.bio, workCount: author._count.works, avatarUrl: url(author.avatarAsset?.storageKey), coverUrl: url(author.coverAsset?.storageKey) }));
}

export async function getAuthorCollection(slug: string) {
  const author = await db.author.findFirst({ where: { slug, status: AuthorStatus.ACTIVE }, include: { avatarAsset: true, wechatQrAsset: true, categories: { orderBy: { displayOrder: "asc" }, include: { works: { where: { status: { in: publicStatuses } }, orderBy: { displayOrder: "asc" }, include: workInclude } } }, works: { where: { authorCategoryId: null, status: { in: publicStatuses } }, orderBy: { displayOrder: "asc" }, include: workInclude } } });
  if (!author) return null;
  const mapWork = (work: typeof author.works[number]): PublicWork => ({ id: work.id, name: work.name, status: work.status as PublicWork["status"], supportsLab: work.supportsLab, supportsWcglass: work.supportsWcglass, directPriceCents: work.directPriceCents, repostPriceCents: work.repostPriceCents, features: work.features, repostRequirements: work.repostRequirements, purchaseNotes: work.purchaseNotes, mainImageUrl: url(work.mainAsset?.storageKey), images: work.images.map((image) => ({ id: image.id, url: url(image.asset.storageKey)!, alt: image.asset.altText || `${work.name}预览图` })), version: work.currentVersion?.version ?? "1.0.0", updatedAt: work.updatedAt });
  return { id: author.id, slug: author.slug, name: author.name, bio: author.bio, publicWechatId: author.publicWechatId, avatarUrl: url(author.avatarAsset?.storageKey), qrUrl: url(author.wechatQrAsset?.storageKey), categories: author.categories.filter((category) => category.works.length).map((category) => ({ id: category.id, name: category.name, works: category.works.map(mapWork) })), uncategorized: author.works.map(mapWork) };
}

const workInclude = { mainAsset: true, currentVersion: true, images: { orderBy: { sortOrder: "asc" as const }, include: { asset: true } } };

export async function getLatestWorks(limit = 6) {
  const works = await db.work.findMany({ where: { status: { in: publicStatuses } }, take: limit, orderBy: { publishedAt: "desc" }, include: { ...workInclude, author: { include: { wechatQrAsset: true } } } });
  return works.map((work) => ({ work: { id: work.id, name: work.name, status: work.status as PublicWork["status"], supportsLab: work.supportsLab, supportsWcglass: work.supportsWcglass, directPriceCents: work.directPriceCents, repostPriceCents: work.repostPriceCents, features: work.features, repostRequirements: work.repostRequirements, purchaseNotes: work.purchaseNotes, mainImageUrl: url(work.mainAsset?.storageKey), images: work.images.map((image) => ({ id: image.id, url: url(image.asset.storageKey)!, alt: image.asset.altText || `${work.name}预览图` })), version: work.currentVersion?.version ?? "1.0.0", updatedAt: work.updatedAt } satisfies PublicWork, author: { name: work.author.name, publicWechatId: work.author.publicWechatId, qrUrl: url(work.author.wechatQrAsset?.storageKey) } }));
}
