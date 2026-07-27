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
