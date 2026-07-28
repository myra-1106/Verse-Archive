"use client";

import type { Asset, WorkImage } from "@prisma/client";
import { useState } from "react";
import {
  deleteWorkPreviewImage,
  moveWorkPreviewImage,
  uploadWorkMainImage,
  uploadWorkPreviewImages,
} from "@/server/upload-actions";
import { assetUrl } from "@/lib/assets";
import { prepareImageInput } from "@/lib/client-image";

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

  async function upload(input: HTMLInputElement, maxFiles = 1) {
    try {
      setError("");
      await prepareImageInput(input, maxFiles);
      input.form?.requestSubmit();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "图片处理失败，请重新选择");
    }
  }

  return (
    <section className="mt-10 space-y-7">
      <div>
        <h2 className="text-lg font-semibold">作品主图</h2>
        <form action={uploadWorkMainImage} className="mt-3 rounded-2xl border border-border p-4">
          <input name="workId" type="hidden" value={workId} />
          {mainImageUrl ? <img alt="当前作品主图" className="mb-4 aspect-[4/3] w-full max-w-sm rounded-xl object-cover" src={mainImageUrl} /> : null}
          <input accept="image/*,.heic,.heif" name="image" onChange={(event) => void upload(event.currentTarget)} required type="file" />
          <p className="mt-2 text-xs text-muted">选择后自动上传并应用</p>
        </form>
      </div>
      <div>
        <h2 className="text-lg font-semibold">上机预览图</h2>
        <form action={uploadWorkPreviewImages} className="mt-3 rounded-2xl border border-border p-4">
          <input name="workId" type="hidden" value={workId} />
          <input accept="image/*,.heic,.heif" multiple name="images" onChange={(event) => void upload(event.currentTarget, 5)} required type="file" />
          <p className="mt-2 text-xs text-muted">可从相册或文件多选，选择后自动上传</p>
        </form>
        <ol className="mt-4 space-y-3">
          {previews.map((preview, index) => (
            <li className="flex items-center gap-3 rounded-2xl border border-border p-3" key={preview.id}>
              <img alt={preview.asset.altText} className="h-20 w-24 rounded-xl object-cover" src={assetUrl(preview.asset.storageKey)!} />
              <span className="min-w-0 flex-1 text-sm text-muted">预览图 {index + 1}</span>
              <form action={moveWorkPreviewImage}><input name="imageId" type="hidden" value={preview.id} /><button aria-label={`上移预览图${index + 1}`} disabled={index === 0} name="direction" value="up">↑</button></form>
              <form action={moveWorkPreviewImage}><input name="imageId" type="hidden" value={preview.id} /><button aria-label={`下移预览图${index + 1}`} disabled={index === previews.length - 1} name="direction" value="down">↓</button></form>
              <form action={deleteWorkPreviewImage}><input name="imageId" type="hidden" value={preview.id} /><button className="text-sm text-red-600" type="submit">删除</button></form>
            </li>
          ))}
        </ol>
      </div>
      {error ? <p className="text-sm text-red-600" role="alert">{error}</p> : null}
    </section>
  );
}
