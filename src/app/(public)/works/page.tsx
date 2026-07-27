import { MobileNav } from "@/components/mobile-nav";
import { SiteHeader } from "@/components/site-header";
import { WorkCard } from "@/components/work-card";
import { getLatestWorks } from "@/server/public-queries";
export const dynamic = "force-dynamic";
export default async function WorksPage() { const works = await getLatestWorks(100); return <><SiteHeader /><main className="mx-auto max-w-6xl px-5 pb-28 pt-10 sm:px-8"><h1 className="text-4xl font-semibold">全部作品</h1><p className="mt-3 text-muted">搜索和环境筛选将在第二阶段启用。</p><div className="mt-8 space-y-7">{works.map((item) => <WorkCard {...item} key={item.work.id} />)}</div></main><MobileNav /></>; }
