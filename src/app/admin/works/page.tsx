import Link from "next/link";
import { UserRole } from "@prisma/client";
import { db } from "@/lib/db";
import { requireUser } from "@/server/current-user";
import { restoreWork, setWorkStatus } from "@/server/work-actions";
import { SubmitButton } from "@/components/admin/submit-button";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";

export default async function WorksAdminPage({ searchParams }: { searchParams: Promise<{ mine?: string; changed?: string; deleted?: string }> }) {
  const user = await requireUser();
  const query = await searchParams;
  const mine = user.role === UserRole.AUTHOR || query.mine === "1";
  const deleted = query.deleted === "1";
  const works = await db.work.findMany({ where: { ...(mine ? { authorId: user.author?.id } : {}), status: deleted ? "DELETED" : { not: "DELETED" } }, include: { author: true }, orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }] });
  const baseQuery = mine && user.role !== UserRole.AUTHOR ? "&mine=1" : "";
  return <div><div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-3xl font-semibold">{deleted ? "已删除作品" : mine ? "我的作品" : "全部作品"}</h1><div className="mt-3 flex gap-3 text-sm"><Link className={!deleted ? "font-semibold" : "text-muted"} href={`/admin/works${mine && user.role !== UserRole.AUTHOR ? "?mine=1" : ""}`}>现有作品</Link><Link className={deleted ? "font-semibold" : "text-muted"} href={`/admin/works?deleted=1${baseQuery}`}>已删除</Link></div></div>{deleted ? null : <div className="flex gap-2"><Link className="primary-button" href="/admin/works/new">{user.author ? "上传到我的合集" : "新建作品"}</Link>{!mine && user.role !== UserRole.AUTHOR ? <Link className="rounded-full border border-border px-4 py-2 text-sm" href="/admin/works/new?choose=1">为其他作者新建</Link> : null}</div>}</div>{query.changed ? <p className="mt-3 text-sm text-green-600">作品状态已更新</p> : null}<div className="mt-7 space-y-3">{works.length ? works.map((work) => <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface p-5" key={work.id}><Link className="min-w-0 flex-1" href={`/admin/works/${work.id}/edit`}><strong>{work.name}</strong><p className="text-sm text-muted">{work.author.name} · {work.status}</p></Link>{work.status === "DELETED" && user.role === UserRole.SUPER_ADMIN ? <form action={restoreWork}><input name="workId" type="hidden" value={work.id}/><SubmitButton pendingText="恢复中…">恢复</SubmitButton></form> : <><form action={setWorkStatus}><input name="workId" type="hidden" value={work.id}/><SubmitButton pendingText="处理中…">{work.status === "PUBLISHED" ? "下架" : "发布"}<input name="status" type="hidden" value={work.status === "PUBLISHED" ? "OFF_SHELF" : "PUBLISHED"}/></SubmitButton></form><form action={setWorkStatus}><input name="workId" type="hidden" value={work.id}/><input name="status" type="hidden" value="DELETED"/><ConfirmSubmitButton className="text-sm text-red-600" confirmMessage={`确定删除作品“${work.name}”吗？`} pendingText="删除中…">删除</ConfirmSubmitButton></form></>}</div>) : <p className="text-sm text-muted">这里还没有作品。</p>}</div></div>;
}
