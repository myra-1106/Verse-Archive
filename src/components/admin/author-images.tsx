"use client";

import { uploadAuthorImage } from "@/server/upload-actions";

type ImageKind = "avatar" | "cover" | "wechatQr";

const fields: { kind: ImageKind; label: string }[] = [
  { kind: "avatar", label: "作者头像" },
  { kind: "cover", label: "代表作品图" },
  { kind: "wechatQr", label: "微信二维码" },
];

export function AuthorImages({
  authorId,
  images,
}: {
  authorId: string;
  images: Record<ImageKind, string | null>;
}) {
  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold">作者图片</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {fields.map(({ kind, label }) => (
          <form action={uploadAuthorImage} className="rounded-2xl border border-border p-4" key={kind}>
            <input name="authorId" type="hidden" value={authorId} />
            <input name="kind" type="hidden" value={kind} />
            <div className="aspect-square overflow-hidden rounded-xl bg-background">
              {images[kind] ? <img alt={label} className="h-full w-full object-cover" src={images[kind]!} /> : null}
            </div>
            <label className="mt-3 block text-sm font-medium">{label}<input accept="image/*" className="mt-2 block w-full text-xs" name="image" onChange={(event) => event.currentTarget.form?.requestSubmit()} required type="file" /></label>
            <p className="mt-2 text-xs text-muted">从相册或文件选择后自动上传并应用</p>
          </form>
        ))}
      </div>
    </section>
  );
}
