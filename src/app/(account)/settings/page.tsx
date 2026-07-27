import { MobileNav } from "@/components/mobile-nav";
import { SiteHeader } from "@/components/site-header";
import { requireUser } from "@/server/current-user";
export const dynamic = "force-dynamic";
export default async function SettingsPage() { const user = await requireUser(); return <><SiteHeader /><main className="mx-auto max-w-2xl px-5 py-12 sm:px-8"><p className="text-sm text-accent">我的账号</p><h1 className="mt-2 text-4xl font-semibold">{user.displayName}</h1><p className="mt-4 text-muted">昵称、头像和修改密码功能将在账号设置完善时启用。</p></main><MobileNav /></>; }
