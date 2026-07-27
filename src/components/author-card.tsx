import Link from "next/link";

export type AuthorCardData = { slug: string; name: string; bio: string; workCount: number; avatarUrl: string | null; coverUrl: string | null };

export function AuthorCard({ author }: { author: AuthorCardData }) {
  return <article className="overflow-hidden rounded-[26px] border border-border bg-surface"><div className="aspect-[16/10] bg-[#ddd9e3] bg-cover bg-center" style={author.coverUrl ? { backgroundImage: `url(${author.coverUrl})` } : undefined} /><div className="p-5"><div className="flex items-center gap-3"><div className="h-11 w-11 rounded-full bg-[#e7e4ec] bg-cover" style={author.avatarUrl ? { backgroundImage: `url(${author.avatarUrl})` } : undefined} /><div><h2 className="font-semibold">{author.name}</h2><p className="text-sm text-muted">{author.workCount} 件作品</p></div></div><p className="mt-4 line-clamp-2 min-h-12 text-sm leading-6 text-muted">{author.bio}</p><Link className="mt-5 inline-flex min-h-11 items-center rounded-full border border-border px-4 text-sm font-medium" href={`/authors/${author.slug}`}>进入合集</Link></div></article>;
}
