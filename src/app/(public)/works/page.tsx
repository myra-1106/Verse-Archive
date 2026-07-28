import { MobileNav } from "@/components/mobile-nav";
import { SiteHeader } from "@/components/site-header";
import { WorkCard } from "@/components/work-card";
import { WorkFilters } from "@/components/work-filters";
import { normalizeWorkFilters } from "@/lib/work-filters";
import { getFilteredWorks, getWorkFilterOptions } from "@/server/public-queries";
export const dynamic = "force-dynamic";
export default async function WorksPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const filters = normalizeWorkFilters(await searchParams);
  const [works, options] = await Promise.all([getFilteredWorks(filters), getWorkFilterOptions()]);
  return <><SiteHeader /><main className="mx-auto max-w-6xl px-5 pb-28 pt-10 sm:px-8"><h1 className="text-4xl font-semibold">全部作品</h1><p className="mt-3 text-muted">搜索作品、作者，或按环境和分类筛选。</p><WorkFilters filters={filters} authors={options.authors} categories={options.categories} environments={options.environments} /><p className="mt-7 text-sm text-muted">共 {works.length} 件作品</p><div className="mt-4 space-y-4">{works.map((item) => <WorkCard {...item} compact key={item.work.id} />)}{works.length === 0 ? <div className="rounded-2xl border border-border bg-surface p-8 text-center text-muted">没有找到符合条件的作品</div> : null}</div></main><MobileNav /></>;
}
