"use client";

import { ContactAuthor } from "@/components/contact-author";
import { ImageLightbox } from "@/components/image-lightbox";
import Image from "next/image";
import { useMemo, useState } from "react";

export type PublicWork = { id: string; name: string; status: "PUBLISHED" | "OFF_SHELF"; supportsLab: boolean; supportsWcglass: boolean; environments?: string[]; directPriceCents: number; repostPriceCents: number; features: string; usageRequirements?: string; acquisitionMethod?: string; repostRequirements: string; purchaseNotes: string; contactDetails?: string; otherNotes?: string; mainImageUrl: string | null; mainImageWidth?: number; mainImageHeight?: number; images: { id: string; url: string; alt: string }[]; version: string; updatedAt: Date };
export type PublicWorkAuthor = { name: string; publicWechatId: string; qrUrl: string | null };

export function formatCny(cents: number) { const value = cents / 100; return new Intl.NumberFormat("zh-CN", { style: "currency", currency: "CNY", minimumFractionDigits: cents % 100 ? 2 : 0 }).format(value).replace("CN¥", "¥"); }

export function WorkCard({ work, author, compact = false }: { work: PublicWork; author: PublicWorkAuthor; compact?: boolean }) {
  const offShelf = work.status === "OFF_SHELF";
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const lightboxImages = useMemo(() => [
    ...(work.mainImageUrl ? [{ url: work.mainImageUrl, alt: `${work.name}主预览图` }] : []),
    ...work.images.map((image) => ({ url: image.url, alt: image.alt })),
  ], [work.images, work.mainImageUrl, work.name]);
  const previewOffset = work.mainImageUrl ? 1 : 0;
  const environmentNames = work.environments?.length ? work.environments : [work.supportsLab ? "LAB" : "", work.supportsWcglass ? "WCGlass" : ""].filter(Boolean);
  if (compact) {
    const mainWidth = work.mainImageWidth || 4;
    const mainHeight = work.mainImageHeight || 3;
    return <article className="relative overflow-hidden rounded-[24px] border border-border bg-surface p-3" data-testid="compact-work-card">
      <a aria-label={`查看${work.name}详情`} className="absolute inset-0 z-10" href={`/works/${work.id}`} />
      <div className="flex w-[42%] items-center justify-center overflow-hidden rounded-[18px] bg-[#e7e4ec] sm:w-60" data-testid="compact-main-media" style={{ aspectRatio: `${mainWidth} / ${mainHeight}` }}>
        {work.mainImageUrl ? <Image className="h-full w-full object-contain" src={work.mainImageUrl} width={mainWidth} height={mainHeight} alt={`${work.name}主预览图`}/> : <span className="text-xs text-muted">暂无主图</span>}
      </div>
      <div className="absolute inset-y-3 right-3 left-[calc(42%+1.5rem)] flex min-h-0 flex-col overflow-hidden py-0.5 sm:left-[264px]">
        <div className="shrink-0 space-y-1 overflow-hidden">
          <div className="flex min-w-0 items-baseline gap-2"><p className="shrink-0 text-[10px] text-muted sm:text-xs">{author.name}</p><h2 className="truncate text-sm font-semibold sm:text-base">{work.name}</h2></div>
          <div className="flex gap-1 overflow-x-auto whitespace-nowrap">{environmentNames.map((name) => <Tag key={name}>{name}</Tag>)}</div>
          <div className="flex gap-3 text-xs"><span><span className="text-muted">直购 </span><strong>{formatCny(work.directPriceCents)}</strong></span><span><span className="text-muted">转发 </span><strong>{formatCny(work.repostPriceCents)}</strong></span></div>
        </div>
        {work.images.length ? <div className="relative z-20 mt-1.5 flex min-h-0 flex-1 snap-x gap-2 overflow-x-auto">
          {work.images.map((image, index) => <button aria-label={`放大${image.alt}`} className="h-full min-w-14 snap-start overflow-hidden rounded-lg bg-background sm:min-w-20" key={image.id} onClick={() => setLightboxIndex(index + previewOffset)} type="button"><Image alt={image.alt} className="h-full w-full object-contain" height={120} src={image.url} width={160}/></button>)}
        </div> : <div className="min-h-0 flex-1" />}
      </div>
      {lightboxIndex !== null ? <ImageLightbox images={lightboxImages} index={lightboxIndex} onChange={setLightboxIndex} onClose={() => setLightboxIndex(null)} /> : null}
    </article>;
  }
  return <article className="rounded-[28px] border border-border bg-surface p-3 sm:p-5"><div className="grid gap-6 md:grid-cols-[1.1fr_.9fr]"><div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[22px] bg-[#ddd9e3] text-sm text-muted">{work.mainImageUrl ? <button className="h-full w-full cursor-zoom-in" type="button" onClick={() => setLightboxIndex(0)}><Image className="h-full w-full object-contain" src={work.mainImageUrl} width={960} height={720} alt={`${work.name}主预览图`} /></button> : "作品主预览图"}</div><div className="p-2"><div className="flex items-start justify-between gap-3"><div><p className="text-sm text-muted">{author.name}</p><h2 className="mt-1 text-2xl font-semibold tracking-tight">{work.name}</h2></div>{offShelf ? <span className="rounded-full bg-background px-3 py-1 text-sm">已下架</span> : null}</div><div className="mt-3 flex flex-wrap gap-2">{environmentNames.map((name) => <Tag key={name}>{name}</Tag>)}</div><div className="mt-6 grid grid-cols-2 gap-4"><Price label="直购价" value={formatCny(work.directPriceCents)} /><Price label="转发价" value={formatCny(work.repostPriceCents)} /></div><Info title="功能说明">{work.features}</Info>{work.usageRequirements ? <Info title="使用要求">{work.usageRequirements}</Info> : null}{work.acquisitionMethod ? <Info title="获取方式">{work.acquisitionMethod}</Info> : null}<details className="mt-4 border-t border-border pt-4 text-sm"><summary className="cursor-pointer font-medium">转发要求与购买须知</summary><div className="mt-3 space-y-3 text-muted"><p>{work.repostRequirements}</p><p>{work.purchaseNotes}</p></div></details><p className="my-5 text-xs text-muted">v{work.version} · 更新于 {new Intl.DateTimeFormat("zh-CN").format(work.updatedAt)}</p>{offShelf ? null : <ContactAuthor authorName={author.name} wechatId={author.publicWechatId} qrUrl={author.qrUrl} />}</div></div>{work.images.length ? <div className="mt-4 flex snap-x gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:overflow-visible">{work.images.map((image, index) => <button className="min-w-48 snap-start cursor-zoom-in md:min-w-0" type="button" onClick={() => setLightboxIndex(index + previewOffset)} key={image.id}><Image className="aspect-[4/3] w-full rounded-2xl object-contain" src={image.url} width={640} height={480} alt={image.alt} /></button>)}</div> : null}{lightboxIndex !== null ? <ImageLightbox images={lightboxImages} index={lightboxIndex} onChange={setLightboxIndex} onClose={() => setLightboxIndex(null)} /> : null}</article>;
}

function Tag({ children }: { children: React.ReactNode }) { return <span className="rounded-full bg-background px-3 py-1 text-xs">{children}</span>; }
function Price({ label, value }: { label: string; value: string }) { return <div><p className="text-xs text-muted">{label}</p><p className="mt-1 text-lg font-semibold">{value}</p></div>; }
function Info({ title, children }: { title: string; children: React.ReactNode }) { return <div className="mt-5 text-sm leading-6"><strong>{title}</strong><p className="mt-1 text-muted">{children}</p></div>; }
