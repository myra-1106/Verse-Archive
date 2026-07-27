import { AuthorCard } from "@/components/author-card";
import { MobileNav } from "@/components/mobile-nav";
import { SiteHeader } from "@/components/site-header";
import { getAuthors } from "@/server/public-queries";
export const dynamic = "force-dynamic";
export default async function AuthorsPage() { const authors = await getAuthors(); return <><SiteHeader /><main className="mx-auto max-w-6xl px-5 pb-28 pt-10 sm:px-8"><h1 className="text-4xl font-semibold">全部作者</h1><p className="mt-3 text-muted">按作者进入她们自己的作品合集。</p><div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{authors.map((author) => <AuthorCard author={author} key={author.slug} />)}</div></main><MobileNav /></>; }
