import Link from "next/link";
import { AuthorCard } from "@/components/author-card";
import { MobileNav } from "@/components/mobile-nav";
import { SiteHeader } from "@/components/site-header";
import { WorkCard } from "@/components/work-card";
import { getAuthors, getLatestWorks } from "@/server/public-queries";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [authors, latest] = await Promise.all([getAuthors(6), getLatestWorks()]);
  return <><SiteHeader /><main className="mx-auto max-w-6xl px-5 pb-28 pt-8 sm:px-8 sm:pt-12"><h1 className="text-3xl font-semibold sm:text-4xl">作者作品合集</h1><section className="mt-7"><Link className="flex min-h-14 items-center rounded-2xl border border-border bg-surface px-5 text-muted" href="/works">搜索作品或作者</Link></section><SectionTitle title="作者合集" href="/authors" /><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{authors.map((author) => <AuthorCard author={author} key={author.slug} />)}</div><SectionTitle title="最新作品" href="/works" /><div className="space-y-4">{latest.map((item) => <WorkCard {...item} compact key={item.work.id} />)}</div></main><MobileNav /></>;
}

function SectionTitle({ title, href }: { title: string; href: string }) { return <div className="mb-5 mt-14 flex items-end justify-between"><h2 className="text-2xl font-semibold">{title}</h2><Link className="text-sm text-muted" href={href}>查看全部</Link></div>; }
