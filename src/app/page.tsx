import Link from "next/link";
import { AuthorCard } from "@/components/author-card";
import { MobileNav } from "@/components/mobile-nav";
import { SiteHeader } from "@/components/site-header";
import { WorkCard } from "@/components/work-card";
import { getAuthors, getLatestWorks } from "@/server/public-queries";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [authors, latest] = await Promise.all([getAuthors(6), getLatestWorks()]); const featured = authors[0];
  return <><SiteHeader /><main className="mx-auto max-w-6xl px-5 pb-28 pt-8 sm:px-8 sm:pt-12">{featured ? <section className="relative overflow-hidden rounded-[32px] bg-[#ddd9e3] p-7 text-[#17171a] sm:min-h-80 sm:p-12"><p className="text-sm">精选作者</p><h1 className="mt-3 text-4xl font-semibold sm:text-6xl">{featured.name}</h1><p className="mt-4 max-w-lg leading-7">{featured.bio}</p><Link className="mt-7 inline-flex min-h-11 items-center rounded-full bg-[#17171a] px-5 text-sm font-medium text-white" href={`/authors/${featured.slug}`}>进入合集</Link></section> : <section><h1 className="text-4xl font-semibold">发现作者与她们的作品</h1></section>}<section className="mt-9"><Link className="flex min-h-14 items-center rounded-2xl border border-border bg-surface px-5 text-muted" href="/works">搜索作品或作者</Link><div className="mt-3 flex gap-2"><span className="rounded-full bg-[#ebe7f2] px-4 py-2 text-sm text-[#655777]">全部</span><span className="rounded-full border border-border px-4 py-2 text-sm">LAB</span><span className="rounded-full border border-border px-4 py-2 text-sm">WCGlass</span></div></section><SectionTitle title="作者合集" href="/authors" /><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{authors.map((author) => <AuthorCard author={author} key={author.slug} />)}</div><SectionTitle title="最新作品" href="/works" /><div className="space-y-7">{latest.map((item) => <WorkCard {...item} key={item.work.id} />)}</div></main><MobileNav /></>;
}

function SectionTitle({ title, href }: { title: string; href: string }) { return <div className="mb-5 mt-14 flex items-end justify-between"><h2 className="text-2xl font-semibold">{title}</h2><Link className="text-sm text-muted" href={href}>查看全部</Link></div>; }
