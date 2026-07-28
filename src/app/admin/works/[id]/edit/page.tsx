import { db } from "@/lib/db";
import { WorkForm } from "@/components/admin/work-form";
import { requireAuthorAccess } from "@/server/current-user";
import { updateWork } from "@/server/work-actions";
import { WorkImages } from "@/components/admin/work-images";
import { assetUrl } from "@/lib/assets";

export default async function EditWorkPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const work = await db.work.findUniqueOrThrow({ where: { id }, include: { mainAsset: true, environments: true, images: { include: { asset: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] } } });
  await requireAuthorAccess(work.authorId);
  const [categories, environments, templates] = await Promise.all([
    db.authorCategory.findMany({ where: { authorId: work.authorId }, orderBy: { displayOrder: "asc" } }),
    db.environment.findMany({ where: { enabled: true }, orderBy: [{ displayOrder: "asc" }, { name: "asc" }] }),
    db.authorTemplate.findMany({ where: { authorId: work.authorId }, include: { environments: true }, orderBy: { displayOrder: "asc" } }),
  ]);
  return <div className="max-w-3xl"><h1 className="text-3xl font-semibold">编辑作品</h1>{query.saved ? <p className="mt-3 text-sm text-green-600">作品已保存</p> : null}<WorkForm action={updateWork} work={work} authorId={work.authorId} categories={categories} environments={environments} selectedEnvironmentIds={work.environments.map(({ environmentId }) => environmentId)} templates={templates} /><WorkImages workId={work.id} mainImageUrl={assetUrl(work.mainAsset?.storageKey)} previews={work.images} /></div>;
}
