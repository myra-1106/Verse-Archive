import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { MobileNav } from "@/components/mobile-nav";
import { WorkCard } from "@/components/work-card";
import { getAuthorCategory } from "@/server/public-queries";

export const dynamic = "force-dynamic";

export default async function AuthorCategoryPage({ params }: { params: Promise<{ slug: string; categoryId: string }> }) {
  const { slug, categoryId } = await params;
  const result = await getAuthorCategory(slug, categoryId);
  if (!result) notFound();
  const contact = { name: result.author.name, publicWechatId: result.author.publicWechatId, qrUrl: result.author.qrUrl };
  return <><SiteHeader/><main className="mx-auto max-w-5xl px-5 pb-28 pt-9 sm:px-8"><p className="text-sm text-muted">{result.author.name}</p><h1 className="mt-2 text-3xl font-semibold">{result.category.name}</h1><div className="mt-7 space-y-4">{result.category.works.map((work) => <WorkCard author={contact} compact key={work.id} work={work}/>)}</div></main><MobileNav/></>;
}
