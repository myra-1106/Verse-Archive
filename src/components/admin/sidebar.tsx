import type { UserRole } from "@prisma/client";
import Link from "next/link";

const contentLinks = [
  { href: "/admin/author", label: "作者资料" },
  { href: "/admin/author/categories", label: "分类" },
  { href: "/admin/works", label: "作品" },
];

export function AdminSidebar({ role }: { role: UserRole }) {
  return (
    <aside className="border-b border-border bg-surface px-5 py-4 md:min-h-screen md:w-56 md:border-r md:border-b-0">
      <Link className="text-lg font-semibold" href="/admin">
        内容后台
      </Link>
      <nav aria-label="后台导航" className="mt-5 flex gap-4 overflow-x-auto md:flex-col">
        {contentLinks.map((link) => (
          <Link className="whitespace-nowrap text-sm text-muted hover:text-foreground" href={link.href} key={link.href}>
            {link.label}
          </Link>
        ))}
        {role === "CONTENT_ADMIN" || role === "SUPER_ADMIN" ? (
          <Link className="whitespace-nowrap text-sm text-muted hover:text-foreground" href="/admin/authors">全部作者</Link>
        ) : null}
        {role === "SUPER_ADMIN" ? (
          <Link className="whitespace-nowrap text-sm text-muted hover:text-foreground" href="/admin/users">账号管理</Link>
        ) : null}
      </nav>
    </aside>
  );
}
