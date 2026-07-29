"use client";

import type { Asset, WorkImage } from "@prisma/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  deleteWorkPreviewImage,
  moveWorkPreviewImage,
  uploadWorkMainImage,
  uploadWorkPreviewImages,
} from "@/server/upload-actions";
import { assetUrl } from "@/lib/assets";
import { prepareImageInput } from "@/lib/client-image";
import { SubmitButton } from "@/components/admin/submit-button";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";

type Preview = WorkImage & { asset: Asset };

export function WorkImages({
  workId,
  mainImageUrl,
  previews,
}: {
  workId: string;
  mainImageUrl: string | null;
  previews: Preview[];
}) {
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function uploadMain(input: HTMLInputElement) {
    try {
      setBusy(true);
      setError("");
      setStatus("正在处理并上传…");
      await prepareImageInput(input);
      const file = input.files?.[0];
      if (!file) return;
      const data = new FormData(); data.set("workId", workId); data.set("image", file);
      await uploadWorkMainImage(data);
      setStatus("主图已上传并应用");
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "图片处理失败，请重新选择");
      setStatus("");
    } finally {
      setBusy(false); input.value = "";
    }
  }

  async function uploadPreviews(input: HTMLInputElement) {
    let uploaded = 0;
    try {
      setBusy(true); setError(""); setStatus("正在处理图片…");
      await prepareImageInput(input);
      const files = Array.from(input.files ?? []);
      for (const [index, file] of files.entries()) {
        setStatus(`正在上传 ${index + 1}/${files.length}…`);
        const data = new FormData(); data.set("workId", workId); data.append("images", file);
        await uploadWorkPreviewImages(data);
        uploaded += 1;
      }
      setStatus(`${files.length} 张预览图已上传`);
      router.refresh();
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "上传失败，请重新选择";
      setError(uploaded ? `已成功上传 ${uploaded} 张，后续图片失败：${message}` : message);
      setStatus("");
      if (uploaded) router.refresh();
    } finally {
      setBusy(false); input.value = "";
    }
  }

  return (
    <section className="mt-10 space-y-7">
      <div>
        <h2 className="text-lg font-semibold">作品主图</h2>
        <div className="mt-3 rounded-2xl border border-border p-4">
          {mainImageUrl ? <img alt="当前作品主图" className="mb-4 aspect-[4/3] w-full max-w-sm rounded-xl object-contain" src={mainImageUrl} /> : null}
          <input accept="image/*,.heic,.heif" disabled={busy} name="image" onChange={(event) => void uploadMain(event.currentTarget)} required type="file" />
          <p className="mt-2 text-xs text-muted">选择后自动上传并应用</p>
        </div>
      </div>
      <div>
        <h2 className="text-lg font-semibold">上机预览图</h2>
        <div className="mt-3 rounded-2xl border border-border p-4"><input accept="image/*,.heic,.heif" disabled={busy} multiple name="images" onChange={(event) => void uploadPreviews(event.currentTarget)} required type="file" /><p className="mt-2 text-xs text-muted">可一次选择任意数量，也可继续追加；选择后自动上传</p></div>
        <ol className="mt-4 space-y-3">
          {previews.map((preview, index) => (
            <li className="flex items-center gap-3 rounded-2xl border border-border p-3" key={preview.id}>
              <img alt={preview.asset.altText} className="h-20 w-24 rounded-xl object-contain" src={assetUrl(preview.asset.storageKey)!} />
              <span className="min-w-0 flex-1 text-sm text-muted">预览图 {index + 1}</span>
              <form action={moveWorkPreviewImage}><input name="imageId" type="hidden" value={preview.id} /><SubmitButton aria-label={`上移预览图${index + 1}`} className="" disabled={index === 0} name="direction" value="up">↑</SubmitButton></form>
              <form action={moveWorkPreviewImage}><input name="imageId" type="hidden" value={preview.id} /><SubmitButton aria-label={`下移预览图${index + 1}`} className="" disabled={index === previews.length - 1} name="direction" value="down">↓</SubmitButton></form>
              <form action={deleteWorkPreviewImage}><input name="imageId" type="hidden" value={preview.id} /><ConfirmSubmitButton className="text-sm text-red-600" confirmMessage={`确定删除预览图 ${index + 1} 吗？`} pendingText="删除中…">删除</ConfirmSubmitButton></form>
            </li>
          ))}
        </ol>
      </div>
      {error ? <p className="text-sm text-red-600" role="alert">{error}</p> : null}
      {status ? <p className="text-sm text-green-600" aria-live="polite">{status}</p> : null}
    </section>
  );
}
