import Link from "next/link";

export function AdminSidebar() {
  return (
    <aside className="border-b border-border bg-surface px-5 py-4 md:min-h-screen md:w-56 md:border-r md:border-b-0">
      <Link className="text-lg font-semibold" href="/admin">
        内容后台
      </Link>
      <nav aria-label="后台导航" className="mt-5 flex gap-4 overflow-x-auto md:flex-col">
        <Link className="whitespace-nowrap text-sm text-muted hover:text-foreground" href="/admin/works">作品管理</Link>
        <Link className="whitespace-nowrap text-sm text-muted hover:text-foreground" href="/admin/authors">作者管理</Link>
        <Link className="whitespace-nowrap text-sm text-muted hover:text-foreground" href="/admin/templates">模板管理</Link>
        <Link className="whitespace-nowrap text-sm text-muted hover:text-foreground" href="/">返回前台</Link>
      </nav>
    </aside>
  );
}
