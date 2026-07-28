"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { uploadAuthorImage } from "@/server/upload-actions";
import { prepareImageInput } from "@/lib/client-image";

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
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function upload(input: HTMLInputElement, kind: ImageKind) {
    try {
      setBusy(true); setError(""); setStatus("正在处理并上传…");
      await prepareImageInput(input);
      const file = input.files?.[0];
      if (!file) return;
      const data = new FormData(); data.set("authorId", authorId); data.set("kind", kind); data.set("image", file);
      await uploadAuthorImage(data);
      setStatus("上传成功，已应用到公开页面");
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "图片处理失败，请换一张重试");
      setStatus("");
    } finally {
      setBusy(false); input.value = "";
    }
  }

  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold">作者图片</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {fields.map(({ kind, label }) => (
          <div className="rounded-2xl border border-border p-4" key={kind}>
            <div className="aspect-square overflow-hidden rounded-xl bg-background">
              {images[kind] ? <img alt={label} className="h-full w-full object-contain" src={images[kind]!} /> : null}
            </div>
            <label className="mt-3 block text-sm font-medium">{label}<input accept="image/*,.heic,.heif" className="mt-2 block w-full text-xs" disabled={busy} name="image" onChange={(event) => void upload(event.currentTarget, kind)} required type="file" /></label>
            <p className="mt-2 text-xs text-muted">从相册或文件选择后自动上传并应用</p>
          </div>
        ))}
      </div>
      {error ? <p className="mt-3 text-sm text-red-600" role="alert">{error}</p> : null}
      {status ? <p className="mt-3 text-sm text-green-600" aria-live="polite">{status}</p> : null}
    </section>
  );
}
