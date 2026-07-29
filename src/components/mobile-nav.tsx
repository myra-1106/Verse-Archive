"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const items = [
  { href: "/", label: "首页", icon: HomeIcon },
  { href: "/authors", label: "合集", icon: CollectionIcon },
  { href: "/settings", label: "我的", icon: UserIcon },
];

function matches(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    items.forEach(({ href }) => router.prefetch(href));
  }, [router]);

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  return <nav aria-label="手机导航" className="mobile-nav-shell sm:hidden">
    {items.map(({ href, label, icon: Icon }) => {
      const active = pendingHref ? pendingHref === href : matches(pathname, href);
      return <Link
        aria-current={active ? "page" : undefined}
        className="mobile-nav-item"
        data-active={active}
        href={href}
        key={href}
        onClick={(event) => {
          if (matches(pathname, href)) {
            event.preventDefault();
            setPendingHref(null);
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
          }
          setPendingHref(href);
        }}
        onPointerDown={() => {
          router.prefetch(href);
          if (!matches(pathname, href)) setPendingHref(href);
        }}
      >
        <span className="mobile-nav-item-content">
          <Icon />
          <span>{label}</span>
          <span aria-hidden className="mobile-nav-indicator" />
        </span>
      </Link>;
    })}
  </nav>;
}

function HomeIcon() {
  return <svg aria-hidden fill="none" height="20" viewBox="0 0 24 24" width="20"><path d="M3.5 10.5 12 3l8.5 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-5v-6h-4v6H5a1.5 1.5 0 0 1-1.5-1.5v-9Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"/></svg>;
}

function CollectionIcon() {
  return <svg aria-hidden fill="none" height="20" viewBox="0 0 24 24" width="20"><rect height="14" rx="2" stroke="currentColor" strokeWidth="1.8" width="15" x="5.5" y="6.5"/><path d="M8.5 3.5h7M2.5 9.5v8" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8"/></svg>;
}

function UserIcon() {
  return <svg aria-hidden fill="none" height="20" viewBox="0 0 24 24" width="20"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8"/><path d="M4.5 21c.7-4.2 3.2-6.3 7.5-6.3s6.8 2.1 7.5 6.3" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8"/></svg>;
}
