import { requireUser } from "@/server/current-user";

export default async function AdminPage() {
  const user = await requireUser();

  return (
    <div>
      <p className="text-sm text-accent">内容后台</p>
      <h1 className="mt-2 text-3xl font-semibold">你好，{user.displayName}</h1>
      <p className="mt-4 text-muted">从左侧选择作者资料、分类或作品开始管理。</p>
    </div>
  );
}
