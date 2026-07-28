import Link from "next/link";
import { UserRole } from "@prisma/client";
import { db } from "@/lib/db";
import { requireUser } from "@/server/current-user";
import { restoreWork, setWorkStatus } from "@/server/work-actions";

export default async function WorksAdminPage({ searchParams }: { searchParams: Promise<{ mine?: string }> }) {
  const user = await requireUser();
  const query = await searchParams;
  const mine = user.role === UserRole.AUTHOR || query.mine === "1";
  const works = await db.work.findMany({ where: mine ? { authorId: user.author?.id } : {}, include: { author: true }, orderBy: { updatedAt: "desc" } });
  return <div><div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-3xl font-semibold">{mine ? "我的作品" : "全部作品"}</h1><div className="flex gap-2"><Link className="primary-button" href="/admin/works/new">{user.author ? "上传到我的合集" : "新建作品"}</Link>{!mine && user.role !== UserRole.AUTHOR ? <Link className="rounded-full border border-border px-4 py-2 text-sm" href="/admin/works/new?choose=1">为其他作者新建</Link> : null}</div></div><div className="mt-7 space-y-3">{works.map((work) => <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface p-5" key={work.id}><Link className="min-w-0 flex-1" href={`/admin/works/${work.id}/edit`}><strong>{work.name}</strong><p className="text-sm text-muted">{work.author.name} · {work.status}</p></Link>{work.status === "DELETED" && user.role === UserRole.SUPER_ADMIN ? <form action={restoreWork}><input type="hidden" name="workId" value={work.id} /><button type="submit">恢复</button></form> : <form action={setWorkStatus}><input type="hidden" name="workId" value={work.id} /><button name="status" value={work.status === "PUBLISHED" ? "OFF_SHELF" : "PUBLISHED"} type="submit">{work.status === "PUBLISHED" ? "下架" : "发布"}</button></form>}</div>)}</div></div>;
}
