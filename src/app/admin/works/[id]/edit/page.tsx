import { db } from "@/lib/db";
import { WorkForm } from "@/components/admin/work-form";
import { requireAuthorAccess } from "@/server/current-user";
import { updateWork } from "@/server/work-actions";

export default async function EditWorkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const work = await db.work.findUniqueOrThrow({ where: { id } }); await requireAuthorAccess(work.authorId);
  const categories = await db.authorCategory.findMany({ where: { authorId: work.authorId }, orderBy: { displayOrder: "asc" } });
  return <div className="max-w-2xl"><h1 className="text-3xl font-semibold">编辑作品</h1><WorkForm action={updateWork} work={work} authorId={work.authorId} categories={categories} /><section className="mt-10 rounded-2xl border border-dashed border-border p-5"><h2 className="font-semibold">作品图片与版本</h2><p className="mt-2 text-sm text-muted">主图、上机预览图与新增版本将在数据库环境接通后启用上传和保存。</p></section></div>;
}
