import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { put } from "@vercel/blob";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

export function validateImageInput(file: { type: string; size: number }) {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
    throw new Error("请选择照片或图片文件");
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("单张图片不能超过 10 MB");
  }
}

export async function saveImage(
  file: File,
  uploadDirectory = path.resolve(process.env.LOCAL_UPLOAD_DIR ?? "public"),
  now = new Date(),
) {
  validateImageInput(file);
  const bytes = Buffer.from(await file.arrayBuffer());
  const image = sharp(bytes, { failOn: "error" });
  const metadata = await image.metadata().catch(() => null);
  if (!metadata?.width || !metadata.height) {
    throw new Error("无法识别这张图片，请换一张照片重试");
  }
  const normalized = await image.rotate().webp({ quality: 88 }).toBuffer();

  const year = String(now.getUTCFullYear());
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const key = `uploads/${year}/${month}/${randomUUID()}.webp`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(key, normalized, {
      access: "public",
      addRandomSuffix: false,
      contentType: "image/webp",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return {
      key: blob.url,
      mimeType: "image/webp",
      width: metadata.width,
      height: metadata.height,
      sizeBytes: normalized.length,
    };
  }

  const destination = path.join(uploadDirectory, key);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, normalized);

  return {
    key,
    mimeType: "image/webp",
    width: metadata.width,
    height: metadata.height,
    sizeBytes: normalized.length,
  };
}
