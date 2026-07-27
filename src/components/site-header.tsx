import Link from "next/link";

export function SiteHeader() { return <header className="sticky top-0 z-20 border-b border-border bg-background/95"><div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between px-5 sm:px-8"><Link className="font-semibold tracking-tight" href="/">Verse Archive</Link><nav className="hidden gap-6 text-sm sm:flex"><Link href="/authors">作者</Link><Link href="/works">全部作品</Link><Link href="/login">登录</Link></nav></div></header>; }
