"use client";

import Image from "next/image";
import { useEffect } from "react";

export type LightboxImage = { url: string; alt: string };

export function ImageLightbox({
  images,
  index,
  onChange,
  onClose,
}: {
  images: LightboxImage[];
  index: number;
  onChange: (index: number) => void;
  onClose: () => void;
}) {
  const previous = () => onChange((index - 1 + images.length) % images.length);
  const next = () => onChange((index + 1) % images.length);

  useEffect(() => {
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft" && images.length > 1) previous();
      if (event.key === "ArrowRight" && images.length > 1) next();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = oldOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  });

  const image = images[index];
  if (!image) return null;
  return (
    <div aria-label="图片预览" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" role="dialog" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <button aria-label="关闭图片预览" className="absolute right-4 top-4 min-h-11 min-w-11 rounded-full bg-white/15 text-2xl text-white" onClick={onClose}>×</button>
      {images.length > 1 ? <button aria-label="上一张图片" className="absolute left-3 min-h-12 min-w-12 rounded-full bg-white/15 text-2xl text-white" onClick={previous}>‹</button> : null}
      <Image className="max-h-[88vh] w-auto max-w-[92vw] object-contain" src={image.url} width={1600} height={1200} alt={image.alt} priority />
      {images.length > 1 ? <button aria-label="下一张图片" className="absolute right-3 min-h-12 min-w-12 rounded-full bg-white/15 text-2xl text-white" onClick={next}>›</button> : null}
      <span className="absolute bottom-4 rounded-full bg-black/50 px-3 py-1 text-sm text-white">{index + 1} / {images.length}</span>
    </div>
  );
}
