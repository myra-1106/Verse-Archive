import { UserRole } from "@prisma/client";
import { db } from "@/lib/db";
import { WorkForm } from "@/components/admin/work-form";
import { requireUser } from "@/server/current-user";
import { createWork } from "@/server/work-actions";
import Link from "next/link";

export default async function NewWorkPage({ searchParams }: { searchParams: Promise<{ author?: string }> }) {
  const user = await requireUser(); const query = await searchParams;
  if (user.role !== UserRole.AUTHOR && !query.author) {
    const authors = await db.author.findMany({ where: { status: "ACTIVE" }, orderBy: [{ displayOrder: "asc" }, { name: "asc" }] });
    return <div className="max-w-2xl"><h1 className="text-3xl font-semibold">选择作品作者</h1><p className="mt-3 text-muted">作品创建后，该作者可在自己的后台继续管理。</p><div className="mt-7 grid gap-3">{authors.map((author) => <Link className="rounded-2xl border border-border bg-surface p-5 font-medium" href={`/admin/works/new?author=${author.id}`} key={author.id}>{author.name}</Link>)}</div></div>;
  }
  const author = user.role === UserRole.AUTHOR ? await db.author.findUniqueOrThrow({ where: { id: user.author!.id } }) : await db.author.findFirstOrThrow({ where: { id: query.author, status: "ACTIVE" } });
  const categories = await db.authorCategory.findMany({ where: { authorId: author.id }, orderBy: { displayOrder: "asc" } });
  return <div className="max-w-2xl"><h1 className="text-3xl font-semibold">新建作品 · {author.name}</h1><WorkForm action={createWork} authorId={author.id} categories={categories} /></div>;
}
