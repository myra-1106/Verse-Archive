import { UserRole } from "@prisma/client";
import { createAuthorWithAccount } from "@/server/author-actions";
import { requireRole } from "@/server/current-user";

export default async function NewAuthorPage() {
  await requireRole([UserRole.SUPER_ADMIN]);
  return <div className="max-w-2xl"><h1 className="text-3xl font-semibold">新增作者与账号</h1><form action={createAuthorWithAccount} className="mt-8 space-y-5"><Input label="作者名称" name="name" /><Input label="地址标识（英文小写）" name="slug" /><Input label="微信号（公开，访客可复制）" name="publicWechatId" required={false} /><Input label="登录微信 ID（仅后台可见）" name="accountWechatId" /><Input label="初始密码" name="password" type="password" /><button className="primary-button" type="submit">创建作者</button></form></div>;
}

function Input({ label, name, type = "text", required = true }: { label: string; name: string; type?: string; required?: boolean }) {
  return <label className="block text-sm font-medium">{label}<input className="field-input mt-2" name={name} type={type} required={required} /></label>;
}
