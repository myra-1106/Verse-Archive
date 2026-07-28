const HEIC_TYPES = new Set(["image/heic", "image/heif", "image/heic-sequence", "image/heif-sequence"]);
const MAX_SIDE = 1800;
const MAX_OUTPUT_BYTES = 700 * 1024;

export function isHeicFile(file: { name: string; type: string }) {
  return HEIC_TYPES.has(file.type.toLowerCase()) || /\.(heic|heif)$/i.test(file.name);
}

async function loadImage(blob: Blob) {
  const url = URL.createObjectURL(blob);
  try {
    const image = new Image();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("无法读取这张照片"));
      image.src = url;
    });
    return image;
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function canvasBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error("照片转换失败")),
      "image/webp",
      quality,
    );
  });
}

async function normalizeImage(file: File) {
  let source: Blob = file;
  if (isHeicFile(file)) {
    const { default: heic2any } = await import("heic2any");
    const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
    source = Array.isArray(converted) ? converted[0] : converted;
  }

  const image = await loadImage(source);
  const scale = Math.min(1, MAX_SIDE / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);

  let quality = 0.82;
  let output = await canvasBlob(canvas, quality);
  while (output.size > MAX_OUTPUT_BYTES && quality > 0.46) {
    quality -= 0.12;
    output = await canvasBlob(canvas, quality);
  }

  return new File([output], file.name.replace(/\.[^.]+$/, "") + ".webp", {
    type: "image/webp",
    lastModified: Date.now(),
  });
}

export async function prepareImageInput(input: HTMLInputElement, maxFiles = 1) {
  const files = Array.from(input.files ?? []);
  if (!files.length) return;
  if (files.length > maxFiles) throw new Error(`每次最多选择 ${maxFiles} 张图片`);

  const transfer = new DataTransfer();
  for (const file of files) transfer.items.add(await normalizeImage(file));
  input.files = transfer.files;
}
