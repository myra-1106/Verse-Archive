import Link from "next/link";

export type AuthorCardData = { slug: string; name: string; bio: string; workCount: number; avatarUrl: string | null; coverUrl: string | null };

export function AuthorCard({ author }: { author: AuthorCardData }) {
  const href = `/authors/${author.slug}`;
  return <article className="group relative overflow-hidden rounded-[26px] border border-border bg-surface">
    <Link aria-hidden className="absolute inset-0 z-10" href={href} tabIndex={-1} />
    <div className="relative aspect-[16/10] overflow-hidden bg-[#e7e4ec]">{author.coverUrl ? <><img alt="" aria-hidden className="absolute inset-0 h-full w-full scale-110 object-cover opacity-20 blur-2xl" src={author.coverUrl}/><img alt={`${author.name}合集预览`} className="relative h-full w-full object-contain" src={author.coverUrl}/></> : null}</div>
    <div className="p-5"><div className="flex items-center gap-3"><div className="h-11 w-11 rounded-full bg-[#e7e4ec] bg-cover" style={author.avatarUrl ? { backgroundImage: `url(${author.avatarUrl})` } : undefined}/><div><h2 className="font-semibold">{author.name}</h2><p className="text-sm text-muted">{author.workCount} 件作品</p></div></div><p className="mt-4 line-clamp-2 min-h-12 text-sm leading-6 text-muted">{author.bio}</p><Link className="relative z-20 mt-5 inline-flex min-h-11 items-center rounded-full border border-border px-4 text-sm font-medium" href={href}>进入合集</Link></div>
  </article>;
}
