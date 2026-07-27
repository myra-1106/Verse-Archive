import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

export function validateImageInput(file: { type: string; size: number }) {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("图片格式只支持 JPEG、PNG、WebP 和 AVIF");
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("单张图片不能超过 10 MB");
  }
}

const FORMAT_DETAILS = {
  jpeg: { mimeType: "image/jpeg", extension: "jpg" },
  png: { mimeType: "image/png", extension: "png" },
  webp: { mimeType: "image/webp", extension: "webp" },
  avif: { mimeType: "image/avif", extension: "avif" },
} as const;

export async function saveImage(
  file: File,
  uploadDirectory = path.resolve(process.env.LOCAL_UPLOAD_DIR ?? "public/uploads"),
  now = new Date(),
) {
  validateImageInput(file);
  const bytes = Buffer.from(await file.arrayBuffer());
  const metadata = await sharp(bytes).metadata().catch(() => null);
  const details = metadata?.format ? FORMAT_DETAILS[metadata.format as keyof typeof FORMAT_DETAILS] : undefined;

  if (!details || !metadata?.width || !metadata.height || details.mimeType !== file.type) {
    throw new Error("无法识别图片内容，或图片格式与文件不一致");
  }

  const year = String(now.getUTCFullYear());
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const key = `${year}/${month}/${randomUUID()}.${details.extension}`;
  const destination = path.join(uploadDirectory, key);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, bytes);

  return {
    key,
    mimeType: details.mimeType,
    width: metadata.width,
    height: metadata.height,
    sizeBytes: bytes.length,
  };
}
