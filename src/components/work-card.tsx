"use client";

import { ContactAuthor } from "@/components/contact-author";
import { ImageLightbox } from "@/components/image-lightbox";
import Image from "next/image";
import { useMemo, useState } from "react";

export type PublicWork = { id: string; name: string; status: "PUBLISHED" | "OFF_SHELF"; supportsLab: boolean; supportsWcglass: boolean; directPriceCents: number; repostPriceCents: number; features: string; repostRequirements: string; purchaseNotes: string; mainImageUrl: string | null; images: { id: string; url: string; alt: string }[]; version: string; updatedAt: Date };
export type PublicWorkAuthor = { name: string; publicWechatId: string; qrUrl: string | null };

export function formatCny(cents: number) { const value = cents / 100; return new Intl.NumberFormat("zh-CN", { style: "currency", currency: "CNY", minimumFractionDigits: cents % 100 ? 2 : 0 }).format(value).replace("CN¥", "¥"); }

export function WorkCard({ work, author }: { work: PublicWork; author: PublicWorkAuthor }) {
  const offShelf = work.status === "OFF_SHELF";
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const lightboxImages = useMemo(() => [
    ...(work.mainImageUrl ? [{ url: work.mainImageUrl, alt: `${work.name}主预览图` }] : []),
    ...work.images.map((image) => ({ url: image.url, alt: image.alt })),
  ], [work.images, work.mainImageUrl, work.name]);
  const previewOffset = work.mainImageUrl ? 1 : 0;
  return <article className="rounded-[28px] border border-border bg-surface p-3 sm:p-5"><div className="grid gap-6 md:grid-cols-[1.1fr_.9fr]"><div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[22px] bg-[#ddd9e3] text-sm text-muted">{work.mainImageUrl ? <button className="h-full w-full cursor-zoom-in" type="button" onClick={() => setLightboxIndex(0)}><Image className="h-full w-full object-cover" src={work.mainImageUrl} width={960} height={720} alt={`${work.name}主预览图`} /></button> : "作品主预览图"}</div><div className="p-2"><div className="flex items-start justify-between gap-3"><div><p className="text-sm text-muted">{author.name}</p><h2 className="mt-1 text-2xl font-semibold tracking-tight">{work.name}</h2></div>{offShelf ? <span className="rounded-full bg-background px-3 py-1 text-sm">已下架</span> : null}</div><div className="mt-3 flex gap-2">{work.supportsLab ? <Tag>LAB</Tag> : null}{work.supportsWcglass ? <Tag>WCGlass</Tag> : null}</div><div className="mt-6 grid grid-cols-2 gap-4"><Price label="直购价" value={formatCny(work.directPriceCents)} /><Price label="转发价" value={formatCny(work.repostPriceCents)} /></div><Info title="功能说明">{work.features}</Info><details className="mt-4 border-t border-border pt-4 text-sm"><summary className="cursor-pointer font-medium">转发要求与购买须知</summary><div className="mt-3 space-y-3 text-muted"><p>{work.repostRequirements}</p><p>{work.purchaseNotes}</p></div></details><p className="my-5 text-xs text-muted">v{work.version} · 更新于 {new Intl.DateTimeFormat("zh-CN").format(work.updatedAt)}</p>{offShelf ? null : <ContactAuthor authorName={author.name} wechatId={author.publicWechatId} qrUrl={author.qrUrl} />}</div></div>{work.images.length ? <div className="mt-4 flex snap-x gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:overflow-visible">{work.images.map((image, index) => <button className="min-w-48 snap-start cursor-zoom-in md:min-w-0" type="button" onClick={() => setLightboxIndex(index + previewOffset)} key={image.id}><Image className="aspect-[4/3] w-full rounded-2xl object-cover" src={image.url} width={640} height={480} alt={image.alt} /></button>)}</div> : null}{lightboxIndex !== null ? <ImageLightbox images={lightboxImages} index={lightboxIndex} onChange={setLightboxIndex} onClose={() => setLightboxIndex(null)} /> : null}</article>;
}

function Tag({ children }: { children: React.ReactNode }) { return <span className="rounded-full bg-background px-3 py-1 text-xs">{children}</span>; }
function Price({ label, value }: { label: string; value: string }) { return <div><p className="text-xs text-muted">{label}</p><p className="mt-1 text-lg font-semibold">{value}</p></div>; }
function Info({ title, children }: { title: string; children: React.ReactNode }) { return <div className="mt-5 text-sm leading-6"><strong>{title}</strong><p className="mt-1 text-muted">{children}</p></div>; }
