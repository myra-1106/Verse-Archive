import Link from "next/link";
import { UserRole } from "@prisma/client";
import { db } from "@/lib/db";
import { requireRole } from "@/server/current-user";

export default async function AuthorsAdminPage() {
  await requireRole([UserRole.CONTENT_ADMIN, UserRole.SUPER_ADMIN]);
  const authors = await db.author.findMany({ orderBy: [{ displayOrder: "asc" }, { name: "asc" }], include: { _count: { select: { works: true } } } });
  return <div><div className="flex items-center justify-between"><h1 className="text-3xl font-semibold">全部作者</h1><Link className="primary-button" href="/admin/authors/new">新增作者</Link></div><div className="mt-7 space-y-3">{authors.map((author) => <Link className="flex justify-between rounded-2xl border border-border bg-surface p-5" href={`/admin/authors/${author.id}/edit`} key={author.id}><span>{author.name}</span><span className="text-muted">{author._count.works} 件作品</span></Link>)}</div></div>;
}
