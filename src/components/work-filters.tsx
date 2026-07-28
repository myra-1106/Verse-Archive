import type { WorkFilters as FilterValues } from "@/lib/work-filters";
import Link from "next/link";

type Option = { id: string; name: string };
type CategoryOption = Option & { authorId: string; authorName: string };

export function WorkFilters({
  filters,
  authors,
  categories,
  environments,
}: {
  filters: FilterValues;
  authors: Option[];
  categories: CategoryOption[];
  environments: Option[];
}) {
  const visibleCategories = filters.author ? categories.filter((category) => category.authorId === filters.author) : categories;
  return (
    <form className="mt-7 grid gap-3 rounded-2xl border border-border bg-surface p-4 sm:grid-cols-2 lg:grid-cols-6">
      <input className="field-input sm:col-span-2" defaultValue={filters.q} name="q" placeholder="搜索作品或作者" />
      <select className="field-input" defaultValue={filters.author} name="author">
        <option value="">全部作者</option>
        {authors.map((author) => <option key={author.id} value={author.id}>{author.name}</option>)}
      </select>
      <select className="field-input" defaultValue={filters.category} name="category">
        <option value="">全部分类</option>
        {visibleCategories.map((category) => <option key={category.id} value={category.id}>{filters.author ? category.name : `${category.authorName} · ${category.name}`}</option>)}
      </select>
      <select className="field-input" defaultValue={filters.environment} name="environment">
        <option value="">全部环境</option>
        {environments.map((environment) => <option key={environment.id} value={environment.id}>{environment.name}</option>)}
      </select>
      <select className="field-input" defaultValue={filters.sort} name="sort">
        <option value="latest">最新发布</option>
        <option value="updated">最近更新</option>
      </select>
      <div className="flex gap-3 sm:col-span-2 lg:col-span-6">
        <button className="primary-button" type="submit">搜索</button>
        <Link className="inline-flex min-h-11 items-center px-3 text-sm text-muted" href="/works">清除筛选</Link>
      </div>
    </form>
  );
}
