import { UserRole } from "@prisma/client";
import { db } from "@/lib/db";
import { WorkForm } from "@/components/admin/work-form";
import { requireUser } from "@/server/current-user";
import { createWork } from "@/server/work-actions";

export default async function NewWorkPage({ searchParams }: { searchParams: Promise<{ author?: string }> }) {
  const user = await requireUser(); const query = await searchParams;
  const author = user.role === UserRole.AUTHOR ? await db.author.findUniqueOrThrow({ where: { id: user.author!.id } }) : await db.author.findFirstOrThrow({ where: { id: query.author, status: "ACTIVE" }, orderBy: { displayOrder: "asc" } });
  const categories = await db.authorCategory.findMany({ where: { authorId: author.id }, orderBy: { displayOrder: "asc" } });
  return <div className="max-w-2xl"><h1 className="text-3xl font-semibold">新建作品 · {author.name}</h1><WorkForm action={createWork} authorId={author.id} categories={categories} /></div>;
}
