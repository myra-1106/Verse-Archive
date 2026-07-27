import { AuthorStatus, Prisma, WorkStatus } from "@prisma/client";
import { db } from "@/lib/db";
import type { PublicWork } from "@/components/work-card";
import { demoAuthors, demoCollection, demoWorks } from "@/server/demo-data";
import type { WorkFilters } from "@/lib/work-filters";

const publicStatuses = [WorkStatus.PUBLISHED, WorkStatus.OFF_SHELF];
const url = (key?: string | null) => key ? `/${key.replace(/^\/+/, "")}` : null;

export async function getAuthors(limit?: number) {
  if (process.env.DEMO_MODE === "1") return limit ? demoAuthors.slice(0, limit) : demoAuthors;
  const authors = await db.author.findMany({ where: { status: AuthorStatus.ACTIVE }, take: limit, orderBy: [{ displayOrder: "asc" }, { name: "asc" }], include: { avatarAsset: true, coverAsset: true, _count: { select: { works: { where: { status: { in: publicStatuses } } } } } } });
  return authors.map((author) => ({ slug: author.slug, name: author.name, bio: author.bio, workCount: author._count.works, avatarUrl: url(author.avatarAsset?.storageKey), coverUrl: url(author.coverAsset?.storageKey) }));
}

export async function getAuthorCollection(slug: string) {
  if (process.env.DEMO_MODE === "1") {
    if (!demoAuthors.some((author) => author.slug === slug)) return null;
    const selected = demoAuthors.find((author) => author.slug === slug)!;
    return { ...demoCollection, slug: selected.slug, name: selected.name, bio: selected.bio };
  }
  const author = await db.author.findFirst({ where: { slug, status: AuthorStatus.ACTIVE }, include: { avatarAsset: true, wechatQrAsset: true, categories: { orderBy: { displayOrder: "asc" }, include: { works: { where: { status: { in: publicStatuses } }, orderBy: { displayOrder: "asc" }, include: workInclude } } }, works: { where: { authorCategoryId: null, status: { in: publicStatuses } }, orderBy: { displayOrder: "asc" }, include: workInclude } } });
  if (!author) return null;
  const mapWork = (work: typeof author.works[number]): PublicWork => ({ id: work.id, name: work.name, status: work.status as PublicWork["status"], supportsLab: work.supportsLab, supportsWcglass: work.supportsWcglass, directPriceCents: work.directPriceCents, repostPriceCents: work.repostPriceCents, features: work.features, repostRequirements: work.repostRequirements, purchaseNotes: work.purchaseNotes, mainImageUrl: url(work.mainAsset?.storageKey), images: work.images.map((image) => ({ id: image.id, url: url(image.asset.storageKey)!, alt: image.asset.altText || `${work.name}预览图` })), version: work.currentVersion?.version ?? "1.0.0", updatedAt: work.updatedAt });
  return { id: author.id, slug: author.slug, name: author.name, bio: author.bio, publicWechatId: author.publicWechatId, avatarUrl: url(author.avatarAsset?.storageKey), qrUrl: url(author.wechatQrAsset?.storageKey), categories: author.categories.filter((category) => category.works.length).map((category) => ({ id: category.id, name: category.name, works: category.works.map(mapWork) })), uncategorized: author.works.map(mapWork) };
}

const workInclude = { mainAsset: true, currentVersion: true, images: { orderBy: { sortOrder: "asc" as const }, include: { asset: true } } };

export async function getLatestWorks(limit = 6) {
  if (process.env.DEMO_MODE === "1") return demoWorks.slice(0, limit);
  const works = await db.work.findMany({ where: { status: { in: publicStatuses } }, take: limit, orderBy: { publishedAt: "desc" }, include: { ...workInclude, author: { include: { wechatQrAsset: true } } } });
  return works.map((work) => ({ work: { id: work.id, name: work.name, status: work.status as PublicWork["status"], supportsLab: work.supportsLab, supportsWcglass: work.supportsWcglass, directPriceCents: work.directPriceCents, repostPriceCents: work.repostPriceCents, features: work.features, repostRequirements: work.repostRequirements, purchaseNotes: work.purchaseNotes, mainImageUrl: url(work.mainAsset?.storageKey), images: work.images.map((image) => ({ id: image.id, url: url(image.asset.storageKey)!, alt: image.asset.altText || `${work.name}预览图` })), version: work.currentVersion?.version ?? "1.0.0", updatedAt: work.updatedAt } satisfies PublicWork, author: { name: work.author.name, publicWechatId: work.author.publicWechatId, qrUrl: url(work.author.wechatQrAsset?.storageKey) } }));
}

export async function getWorkFilterOptions() {
  if (process.env.DEMO_MODE === "1") {
    return {
      authors: demoAuthors.map((author) => ({ id: author.slug, name: author.name })),
      categories: [],
    };
  }
  const authors = await db.author.findMany({
    where: { status: AuthorStatus.ACTIVE },
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      categories: { orderBy: { displayOrder: "asc" }, select: { id: true, name: true } },
    },
  });
  return {
    authors: authors.map(({ id, name }) => ({ id, name })),
    categories: authors.flatMap((author) => author.categories.map((category) => ({
      ...category,
      authorId: author.id,
      authorName: author.name,
    }))),
  };
}

export async function getFilteredWorks(filters: WorkFilters) {
  if (process.env.DEMO_MODE === "1") {
    return demoWorks.filter((item) => {
      const queryMatches = !filters.q || `${item.work.name} ${item.author.name}`.toLowerCase().includes(filters.q.toLowerCase());
      const authorMatches = !filters.author || item.author.name === demoAuthors.find((author) => author.slug === filters.author)?.name;
      const environmentMatches = !filters.environment || (filters.environment === "LAB" ? item.work.supportsLab : item.work.supportsWcglass);
      return queryMatches && authorMatches && environmentMatches;
    }).sort((a, b) => filters.sort === "updated"
      ? b.work.updatedAt.getTime() - a.work.updatedAt.getTime()
      : b.work.updatedAt.getTime() - a.work.updatedAt.getTime());
  }

  const where: Prisma.WorkWhereInput = {
    status: { in: publicStatuses },
    ...(filters.q ? { OR: [
      { name: { contains: filters.q, mode: "insensitive" } },
      { author: { name: { contains: filters.q, mode: "insensitive" } } },
    ] } : {}),
    ...(filters.author ? { authorId: filters.author } : {}),
    ...(filters.category ? { authorCategoryId: filters.category } : {}),
    ...(filters.environment === "LAB" ? { supportsLab: true } : {}),
    ...(filters.environment === "WCGlass" ? { supportsWcglass: true } : {}),
  };
  const works = await db.work.findMany({
    where,
    orderBy: filters.sort === "updated" ? { updatedAt: "desc" } : [{ publishedAt: "desc" }, { updatedAt: "desc" }],
    include: { ...workInclude, author: { include: { wechatQrAsset: true } } },
  });
  return works.map((work) => ({
    work: {
      id: work.id,
      name: work.name,
      status: work.status as PublicWork["status"],
      supportsLab: work.supportsLab,
      supportsWcglass: work.supportsWcglass,
      directPriceCents: work.directPriceCents,
      repostPriceCents: work.repostPriceCents,
      features: work.features,
      repostRequirements: work.repostRequirements,
      purchaseNotes: work.purchaseNotes,
      mainImageUrl: url(work.mainAsset?.storageKey),
      images: work.images.map((image) => ({ id: image.id, url: url(image.asset.storageKey)!, alt: image.asset.altText || `${work.name}预览图` })),
      version: work.currentVersion?.version ?? "1.0.0",
      updatedAt: work.updatedAt,
    } satisfies PublicWork,
    author: {
      name: work.author.name,
      publicWechatId: work.author.publicWechatId,
      qrUrl: url(work.author.wechatQrAsset?.storageKey),
    },
  }));
}
