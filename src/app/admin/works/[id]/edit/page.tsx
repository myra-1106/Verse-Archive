import { db } from "@/lib/db";
import { WorkForm } from "@/components/admin/work-form";
import { requireAuthorAccess } from "@/server/current-user";
import { updateWork } from "@/server/work-actions";
import { WorkImages } from "@/components/admin/work-images";

export default async function EditWorkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const work = await db.work.findUniqueOrThrow({ where: { id }, include: { mainAsset: true, images: { include: { asset: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] } } }); await requireAuthorAccess(work.authorId);
  const categories = await db.authorCategory.findMany({ where: { authorId: work.authorId }, orderBy: { displayOrder: "asc" } });
  return <div className="max-w-3xl"><h1 className="text-3xl font-semibold">编辑作品</h1><WorkForm action={updateWork} work={work} authorId={work.authorId} categories={categories} /><WorkImages workId={work.id} mainImageUrl={work.mainAsset ? `/${work.mainAsset.storageKey}` : null} previews={work.images} /></div>;
}
