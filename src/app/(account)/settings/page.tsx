import { MobileNav } from "@/components/mobile-nav";
import { SiteHeader } from "@/components/site-header";
import { requireUser } from "@/server/current-user";
import { changePassword } from "@/server/auth-actions";
import { SubmitButton } from "@/components/admin/submit-button";
export const dynamic = "force-dynamic";
export default async function SettingsPage() {
  const user = await requireUser();
  return <><SiteHeader /><main className="mx-auto max-w-2xl px-5 py-12 sm:px-8"><p className="text-sm text-accent">我的账号</p><h1 className="mt-2 text-4xl font-semibold">{user.displayName}</h1><section className="mt-8 rounded-2xl border border-border bg-surface p-5"><h2 className="text-lg font-semibold">修改密码</h2><p className="mt-2 text-sm text-muted">作者首次登录后请修改管理员提供的初始密码。</p><form action={changePassword} className="mt-5 space-y-4"><label className="block text-sm font-medium">当前密码<input autoComplete="current-password" className="field-input mt-2" name="currentPassword" required type="password" /></label><label className="block text-sm font-medium">新密码<input autoComplete="new-password" className="field-input mt-2" minLength={8} name="newPassword" required type="password" /></label><SubmitButton pendingText="保存中…">保存新密码</SubmitButton></form></section>{user.author ? <a className="mt-6 inline-flex text-sm underline" href="/admin">进入我的作品后台</a> : null}</main><MobileNav /></>;
}
