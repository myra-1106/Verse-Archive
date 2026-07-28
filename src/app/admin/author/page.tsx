import { updateOwnAuthorProfile } from "@/server/author-actions";
import { requireUser } from "@/server/current-user";
import { db } from "@/lib/db";
import { AuthorImages } from "@/components/admin/author-images";
import { assetUrl } from "@/lib/assets";

export default async function AuthorProfilePage() {
  const user = await requireUser();
  if (!user.author) return <p>当前账号尚未绑定作者资料。</p>;
  const author = await db.author.findUniqueOrThrow({
    where: { id: user.author.id },
    include: { avatarAsset: true, coverAsset: true, wechatQrAsset: true },
  });

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-semibold">作者资料</h1>
      <form action={updateOwnAuthorProfile} className="mt-8 space-y-5">
        <Field label="作者名称" name="name" defaultValue={author.name} />
        <label className="block text-sm font-medium">作者简介<textarea className="field-input mt-2 min-h-28 py-3" name="bio" defaultValue={author.bio} /></label>
        <Field label="公开微信 ID" name="publicWechatId" defaultValue={author.publicWechatId} />
        <Field label="SEO 标题（可选）" name="seoTitle" defaultValue={author.seoTitle ?? ""} />
        <label className="block text-sm font-medium">SEO 描述（可选）<textarea className="field-input mt-2 min-h-24 py-3" name="seoDescription" defaultValue={author.seoDescription ?? ""} /></label>
        <button className="primary-button" type="submit">保存资料</button>
      </form>
      <AuthorImages
        authorId={author.id}
        images={{
          avatar: assetUrl(author.avatarAsset?.storageKey),
          cover: assetUrl(author.coverAsset?.storageKey),
          wechatQr: assetUrl(author.wechatQrAsset?.storageKey),
        }}
      />
    </div>
  );
}

function Field({ label, name, defaultValue }: { label: string; name: string; defaultValue: string }) {
  return <label className="block text-sm font-medium">{label}<input className="field-input mt-2" name={name} defaultValue={defaultValue} required={name !== "seoTitle"} /></label>;
}
