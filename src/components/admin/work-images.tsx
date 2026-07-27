import type { Asset, WorkImage } from "@prisma/client";
import {
  deleteWorkPreviewImage,
  moveWorkPreviewImage,
  uploadWorkMainImage,
  uploadWorkPreviewImages,
} from "@/server/upload-actions";

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
  return (
    <section className="mt-10 space-y-7">
      <div>
        <h2 className="text-lg font-semibold">作品主图</h2>
        <form action={uploadWorkMainImage} className="mt-3 rounded-2xl border border-border p-4">
          <input name="workId" type="hidden" value={workId} />
          {mainImageUrl ? <img alt="当前作品主图" className="mb-4 aspect-[4/3] w-full max-w-sm rounded-xl object-cover" src={mainImageUrl} /> : null}
          <input accept="image/jpeg,image/png,image/webp,image/avif" name="image" required type="file" />
          <button className="primary-button ml-3" type="submit">上传主图</button>
        </form>
      </div>
      <div>
        <h2 className="text-lg font-semibold">上机预览图</h2>
        <form action={uploadWorkPreviewImages} className="mt-3 rounded-2xl border border-border p-4">
          <input name="workId" type="hidden" value={workId} />
          <input accept="image/jpeg,image/png,image/webp,image/avif" multiple name="images" required type="file" />
          <button className="primary-button ml-3" type="submit">批量上传</button>
        </form>
        <ol className="mt-4 space-y-3">
          {previews.map((preview, index) => (
            <li className="flex items-center gap-3 rounded-2xl border border-border p-3" key={preview.id}>
              <img alt={preview.asset.altText} className="h-20 w-24 rounded-xl object-cover" src={`/${preview.asset.storageKey}`} />
              <span className="min-w-0 flex-1 text-sm text-muted">预览图 {index + 1}</span>
              <form action={moveWorkPreviewImage}><input name="imageId" type="hidden" value={preview.id} /><button aria-label={`上移预览图${index + 1}`} disabled={index === 0} name="direction" value="up">↑</button></form>
              <form action={moveWorkPreviewImage}><input name="imageId" type="hidden" value={preview.id} /><button aria-label={`下移预览图${index + 1}`} disabled={index === previews.length - 1} name="direction" value="down">↓</button></form>
              <form action={deleteWorkPreviewImage}><input name="imageId" type="hidden" value={preview.id} /><button className="text-sm text-red-600" type="submit">删除</button></form>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
