import { AuthorStatus, Prisma, WorkStatus } from "@prisma/client";
import { db } from "@/lib/db";
import type { PublicWork } from "@/components/work-card";
import { demoAuthors, demoCollection, demoWorks } from "@/server/demo-data";
import type { WorkFilters } from "@/lib/work-filters";
import { assetUrl } from "@/lib/assets";
import { ensureDefaultEnvironments } from "@/server/environments";

const publicStatuses = [WorkStatus.PUBLISHED, WorkStatus.OFF_SHELF];
const url = assetUrl;

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
  const author = await db.author.findFirst({ where: { slug, status: AuthorStatus.ACTIVE }, include: { avatarAsset: true, wechatQrAsset: true, categories: { orderBy: { displayOrder: "asc" }, include: { works: { where: { status: { in: publicStatuses } }, take: 3, orderBy: [{ featured: "desc" }, { publishedAt: "desc" }], include: workInclude } } } } });
  if (!author) return null;
  return { id: author.id, slug: author.slug, name: author.name, bio: author.bio, publicWechatId: author.publicWechatId, avatarUrl: url(author.avatarAsset?.storageKey), qrUrl: url(author.wechatQrAsset?.storageKey), categories: author.categories.filter((category) => category.works.length).map((category) => ({ id: category.id, name: category.name, works: category.works.map(mapWork) })) };
}

const workInclude = { mainAsset: true, currentVersion: true, environments: { include: { environment: true } }, images: { orderBy: { sortOrder: "asc" as const }, include: { asset: true } } };

function mapWork(work: Prisma.WorkGetPayload<{ include: typeof workInclude }>): PublicWork {
  return {
    id: work.id, name: work.name, status: work.status as PublicWork["status"],
    supportsLab: work.supportsLab, supportsWcglass: work.supportsWcglass,
    environments: work.environments.map(({ environment }) => environment.name),
    directPriceCents: work.directPriceCents, repostPriceCents: work.repostPriceCents,
    features: work.features, usageRequirements: work.usageRequirements, acquisitionMethod: work.acquisitionMethod,
    repostRequirements: work.repostRequirements, purchaseNotes: work.purchaseNotes,
    contactDetails: work.contactDetails, otherNotes: work.otherNotes,
    mainImageUrl: url(work.mainAsset?.storageKey),
    images: work.images.map((image) => ({ id: image.id, url: url(image.asset.storageKey)!, alt: image.asset.altText || `${work.name}预览图` })),
    version: work.currentVersion?.version ?? "1.0.0", updatedAt: work.updatedAt,
  };
}

export async function getLatestWorks(limit = 6) {
  if (process.env.DEMO_MODE === "1") return demoWorks.slice(0, limit);
  const works = await db.work.findMany({ where: { status: { in: publicStatuses } }, take: limit, orderBy: { publishedAt: "desc" }, include: { ...workInclude, author: { include: { wechatQrAsset: true } } } });
  return works.map((work) => ({ work: mapWork(work), author: { name: work.author.name, publicWechatId: work.author.publicWechatId, qrUrl: url(work.author.wechatQrAsset?.storageKey) } }));
}

export async function getWorkFilterOptions() {
  if (process.env.DEMO_MODE === "1") {
    return {
      authors: demoAuthors.map((author) => ({ id: author.slug, name: author.name })),
      categories: [], environments: [{ id: "LAB", name: "LAB" }, { id: "WCGlass", name: "WCGlass" }],
    };
  }
  await ensureDefaultEnvironments();
  const authors = await db.author.findMany({
    where: { status: AuthorStatus.ACTIVE },
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      categories: { orderBy: { displayOrder: "asc" }, select: { id: true, name: true } },
    },
  });
  const environments = await db.environment.findMany({ where: { enabled: true }, orderBy: [{ displayOrder: "asc" }, { name: "asc" }], select: { id: true, name: true } });
  return {
    authors: authors.map(({ id, name }) => ({ id, name })),
    categories: authors.flatMap((author) => author.categories.map((category) => ({
      ...category,
      authorId: author.id,
      authorName: author.name,
    }))), environments,
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
    ...(filters.environment ? { environments: { some: { environmentId: filters.environment } } } : {}),
  };
  const works = await db.work.findMany({
    where,
    orderBy: filters.sort === "updated" ? { updatedAt: "desc" } : [{ publishedAt: "desc" }, { updatedAt: "desc" }],
    include: { ...workInclude, author: { include: { wechatQrAsset: true } } },
  });
  return works.map((work) => ({
    work: mapWork(work),
    author: {
      name: work.author.name,
      publicWechatId: work.author.publicWechatId,
      qrUrl: url(work.author.wechatQrAsset?.storageKey),
    },
  }));
}

export async function getAuthorCategory(slug: string, categoryId: string) {
  const author = await db.author.findFirst({ where: { slug, status: AuthorStatus.ACTIVE }, include: { avatarAsset: true, wechatQrAsset: true } });
  if (!author) return null;
  const category = await db.authorCategory.findFirst({
    where: { id: categoryId, authorId: author.id },
    include: { works: { where: { status: { in: publicStatuses } }, orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }], include: workInclude } },
  });
  if (!category) return null;
  return { author: { name: author.name, slug: author.slug, publicWechatId: author.publicWechatId, qrUrl: url(author.wechatQrAsset?.storageKey) }, category: { id: category.id, name: category.name, works: category.works.map(mapWork) } };
}

export async function getPublicWork(id: string) {
  const work = await db.work.findFirst({ where: { id, status: { in: publicStatuses } }, include: { ...workInclude, author: { include: { wechatQrAsset: true } } } });
  if (!work) return null;
  return { work: mapWork(work), author: { name: work.author.name, publicWechatId: work.author.publicWechatId, qrUrl: url(work.author.wechatQrAsset?.storageKey) } };
}
