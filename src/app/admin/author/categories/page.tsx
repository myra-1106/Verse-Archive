import { db } from "@/lib/db";
import { createOwnCategory, deleteOwnCategory, moveOwnCategory, renameOwnCategory } from "@/server/author-actions";
import { SubmitButton } from "@/components/admin/submit-button";
import { requireUser } from "@/server/current-user";

export default async function CategoriesPage() {
  const user = await requireUser();
  if (!user.author) return <p>当前账号尚未绑定作者资料。</p>;
  const categories = await db.authorCategory.findMany({
    where: { authorId: user.author.id },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
    include: { _count: { select: { works: true } } },
  });

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-semibold">作品分类</h1>
      <p className="mt-3 text-muted">作者可创建“卡片、主题、气泡”等自己的小分类。</p>
      <form action={createOwnCategory} className="mt-7 flex gap-3">
        <input className="field-input" name="name" maxLength={20} placeholder="新分类名称" required />
        <SubmitButton pendingText="添加中…">添加</SubmitButton>
      </form>
      <ul className="mt-6 space-y-3">
        {categories.map((category, index) => (
          <li className="flex items-center gap-2 rounded-2xl border border-border bg-surface p-4" key={category.id}>
            <form action={renameOwnCategory} className="flex min-w-0 flex-1 gap-2"><input name="categoryId" type="hidden" value={category.id}/><input className="field-input" defaultValue={category.name} name="name" required/><button type="submit">保存</button></form><span className="text-sm text-muted">{category._count.works} 件</span>
            <form action={moveOwnCategory}><input type="hidden" name="categoryId" value={category.id} /><button name="direction" value="up" disabled={index === 0} aria-label={`上移${category.name}`}>↑</button></form>
            <form action={moveOwnCategory}><input type="hidden" name="categoryId" value={category.id} /><button name="direction" value="down" disabled={index === categories.length - 1} aria-label={`下移${category.name}`}>↓</button></form>
            <form action={deleteOwnCategory}><input type="hidden" name="categoryId" value={category.id} /><button className="text-sm text-red-600" disabled={category._count.works > 0} title={category._count.works ? "请先移动分类内作品" : ""} type="submit">删除</button></form>
          </li>
        ))}
      </ul>
    </div>
  );
}
