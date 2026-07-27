import { UserRole } from "@prisma/client";
import { db } from "@/lib/db";
import { setAuthorAccountStatus, updateManagedAuthor } from "@/server/author-actions";
import { requireRole } from "@/server/current-user";
import { AuthorImages } from "@/components/admin/author-images";

export default async function EditAuthorPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole([UserRole.CONTENT_ADMIN, UserRole.SUPER_ADMIN]);
  const { id } = await params;
  const author = await db.author.findUniqueOrThrow({ where: { id }, include: { accountUser: true, avatarAsset: true, coverAsset: true, wechatQrAsset: true } });
  return <div className="max-w-3xl"><h1 className="text-3xl font-semibold">编辑作者</h1><form action={updateManagedAuthor} className="mt-8 space-y-5"><input type="hidden" name="authorId" value={author.id} /><Input label="作者名称" name="name" value={author.name} /><label className="block text-sm font-medium">作者简介<textarea className="field-input mt-2 min-h-28 py-3" name="bio" defaultValue={author.bio} /></label><Input label="公开微信 ID" name="publicWechatId" value={author.publicWechatId} /><Input label="SEO 标题" name="seoTitle" value={author.seoTitle ?? ""} required={false} /><label className="block text-sm font-medium">SEO 描述<textarea className="field-input mt-2 min-h-24 py-3" name="seoDescription" defaultValue={author.seoDescription ?? ""} /></label><button className="primary-button" type="submit">保存</button></form><AuthorImages authorId={author.id} images={{ avatar: author.avatarAsset ? `/${author.avatarAsset.storageKey}` : null, cover: author.coverAsset ? `/${author.coverAsset.storageKey}` : null, wechatQr: author.wechatQrAsset ? `/${author.wechatQrAsset.storageKey}` : null }} />{user.role === UserRole.SUPER_ADMIN && author.accountUser ? <form action={setAuthorAccountStatus} className="mt-8"><input type="hidden" name="authorId" value={author.id} /><input type="hidden" name="status" value={author.accountUser.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE"} /><button className="text-sm underline" type="submit">{author.accountUser.status === "ACTIVE" ? "停用作者账号" : "恢复作者账号"}</button></form> : null}</div>;
}

function Input({ label, name, value, required = true }: { label: string; name: string; value: string; required?: boolean }) {
  return <label className="block text-sm font-medium">{label}<input className="field-input mt-2" name={name} defaultValue={value} required={required} /></label>;
}
