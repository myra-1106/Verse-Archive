import { MobileNav } from "@/components/mobile-nav";
import { SiteHeader } from "@/components/site-header";
import { requireUser } from "@/server/current-user";
export const dynamic = "force-dynamic";
export default async function FavoritesPage() { await requireUser(); return <><SiteHeader /><main className="mx-auto max-w-4xl px-5 py-12 sm:px-8"><h1 className="text-4xl font-semibold">我的收藏</h1><p className="mt-4 text-muted">收藏功能将在第二阶段启用。</p></main><MobileNav /></>; }
