import Link from "next/link";
import { UserRole } from "@prisma/client";
import { db } from "@/lib/db";
import { requireUser } from "@/server/current-user";
import { restoreWork, setWorkStatus } from "@/server/work-actions";

export default async function WorksAdminPage() {
  const user = await requireUser();
  const works = await db.work.findMany({ where: user.role === UserRole.AUTHOR ? { authorId: user.author?.id } : {}, include: { author: true }, orderBy: { updatedAt: "desc" } });
  return <div><div className="flex items-center justify-between"><h1 className="text-3xl font-semibold">作品管理</h1><Link className="primary-button" href="/admin/works/new">新建作品</Link></div><div className="mt-7 space-y-3">{works.map((work) => <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface p-5" key={work.id}><Link className="min-w-0 flex-1" href={`/admin/works/${work.id}/edit`}><strong>{work.name}</strong><p className="text-sm text-muted">{work.author.name} · {work.status}</p></Link>{work.status === "DELETED" && user.role === UserRole.SUPER_ADMIN ? <form action={restoreWork}><input type="hidden" name="workId" value={work.id} /><button type="submit">恢复</button></form> : <form action={setWorkStatus}><input type="hidden" name="workId" value={work.id} /><button name="status" value={work.status === "PUBLISHED" ? "OFF_SHELF" : "PUBLISHED"} type="submit">{work.status === "PUBLISHED" ? "下架" : "发布"}</button></form>}</div>)}</div></div>;
}
