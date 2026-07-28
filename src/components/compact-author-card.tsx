import Link from "next/link";
import type { AuthorCardData } from "@/components/author-card";

export function CompactAuthorCard({ author }: { author: AuthorCardData }) {
  return <Link
    aria-label={`进入${author.name}合集`}
    className="flex min-h-[104px] items-center gap-4 rounded-[22px] border border-border bg-surface p-4 transition-transform duration-150 active:scale-[0.98]"
    href={`/authors/${author.slug}`}
  >
    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e7e4ec] text-lg font-semibold">
      {author.avatarUrl ? <img alt={`${author.name}头像`} className="h-full w-full object-cover" src={author.avatarUrl}/> : author.name.slice(0, 1)}
    </div>
    <div className="min-w-0 flex-1">
      <h2 className="truncate text-base font-semibold">{author.name}</h2>
      <p className="mt-1 text-xs text-muted">{author.workCount} 件作品</p>
      <p className="mt-1.5 line-clamp-2 text-sm leading-5 text-muted">{author.bio || "暂无简介"}</p>
    </div>
  </Link>;
}
