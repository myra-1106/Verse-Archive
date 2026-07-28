import { UserRole, UserStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { createContentAdmin, setContentAdminStatus } from "@/server/admin-actions";
import { requireRole } from "@/server/current-user";

export default async function AdminAccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; error?: string }>;
}) {
  await requireRole([UserRole.SUPER_ADMIN]);
  const query = await searchParams;
  const admins = await db.user.findMany({
    where: { role: UserRole.CONTENT_ADMIN },
    orderBy: { createdAt: "asc" },
  });
  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-semibold">管理员账号</h1>
      <p className="mt-3 text-muted">内容管理员可以管理作者、作品、分类和图片，不能创建其他管理员。</p>
      {query.created === "1" ? <p className="mt-5 text-sm text-green-700">管理员账号已创建。</p> : null}
      {query.error === "invalid" ? <p className="mt-5 text-sm text-red-600">请检查填写内容，初始密码至少需要 8 个字符。</p> : null}
      {query.error === "duplicate" ? <p className="mt-5 text-sm text-red-600">这个微信 ID 已经存在，请更换后重试。</p> : null}
      <form action={createContentAdmin} className="mt-7 grid gap-4 rounded-2xl border border-border bg-surface p-5 sm:grid-cols-2">
        <Field label="管理员昵称" name="displayName" />
        <Field label="登录微信 ID" name="wechatId" />
        <Field label="初始密码（至少 8 位）" minLength={8} name="password" type="password" />
        <div className="flex items-end"><button className="primary-button" type="submit">创建内容管理员</button></div>
      </form>
      <div className="mt-7 space-y-3">
        {admins.map((admin) => (
          <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-5" key={admin.id}>
            <div className="min-w-0 flex-1"><strong>{admin.displayName}</strong><p className="text-sm text-muted">{admin.wechatId}</p></div>
            <span className="text-sm text-muted">{admin.status === UserStatus.ACTIVE ? "已启用" : "已停用"}</span>
            <form action={setContentAdminStatus}>
              <input name="userId" type="hidden" value={admin.id} />
              <button className="text-sm underline" name="status" value={admin.status === UserStatus.ACTIVE ? UserStatus.SUSPENDED : UserStatus.ACTIVE} type="submit">{admin.status === UserStatus.ACTIVE ? "停用" : "恢复"}</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({ label, minLength, name, type = "text" }: { label: string; minLength?: number; name: string; type?: string }) {
  return <label className="block text-sm font-medium">{label}<input className="field-input mt-2" minLength={minLength} name={name} required type={type} /></label>;
}
