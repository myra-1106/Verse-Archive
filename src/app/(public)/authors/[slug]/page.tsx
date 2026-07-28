import Link from "next/link";
import { notFound } from "next/navigation";
import { MobileNav } from "@/components/mobile-nav";
import { SiteHeader } from "@/components/site-header";
import { WorkCard, type PublicWork } from "@/components/work-card";
import { ContactAuthor } from "@/components/contact-author";
import { getAuthorCollection } from "@/server/public-queries";

export const dynamic = "force-dynamic";

export default async function AuthorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const author = await getAuthorCollection(slug);
  if (!author) notFound();
  const contact = { name: author.name, publicWechatId: author.publicWechatId, qrUrl: author.qrUrl };
  return <><SiteHeader /><main className="mx-auto max-w-6xl px-5 pb-28 pt-8 sm:px-8">
    <section className="rounded-[28px] border border-border bg-surface p-6 sm:p-9"><div className="flex items-center gap-4"><div className="h-20 w-20 rounded-full bg-[#ddd9e3] bg-cover" style={author.avatarUrl ? { backgroundImage: `url(${author.avatarUrl})` } : undefined} /><div><h1 className="text-3xl font-semibold">{author.name}</h1>{author.publicWechatId ? <div className="mt-2"><ContactAuthor authorName={author.name} wechatId={author.publicWechatId} qrUrl={author.qrUrl} /></div> : null}</div></div><p className="mt-5 max-w-2xl leading-7 text-muted">{author.bio}</p></section>
    {author.categories.map((category) => <section className="mt-10" key={category.id}><div className="mb-4 flex items-center justify-between"><h2 className="text-2xl font-semibold">{category.name}</h2><Link className="text-sm text-muted" href={`/authors/${author.slug}/categories/${category.id}`}>查看更多</Link></div><div className="space-y-4">{(category.works as PublicWork[]).map((work) => <WorkCard author={contact} compact key={work.id} work={work}/>)}</div></section>)}
  </main><MobileNav /></>;
}
