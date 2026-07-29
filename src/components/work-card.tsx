"use client";

import { ContactAuthor } from "@/components/contact-author";
import { ImageLightbox } from "@/components/image-lightbox";
import Image from "next/image";
import { useMemo, useState } from "react";
import { normalizeWorkFieldOrder, type WorkFieldKey } from "@/lib/work-field-order";

export type PublicWork = { id: string; name: string; status: "PUBLISHED" | "OFF_SHELF"; supportsLab: boolean; supportsWcglass: boolean; environments?: string[]; directPriceCents: number; repostPriceCents: number; features: string; usageRequirements?: string; acquisitionMethod?: string; repostRequirements: string; purchaseNotes: string; contactDetails?: string; otherNotes?: string; fieldOrder?: unknown; mainImageUrl: string | null; mainImageWidth?: number; mainImageHeight?: number; images: { id: string; url: string; alt: string }[]; version: string; updatedAt: Date };
export type PublicWorkAuthor = { name: string; publicWechatId: string; qrUrl: string | null };

export function formatCny(cents: number) { const value = cents / 100; return new Intl.NumberFormat("zh-CN", { style: "currency", currency: "CNY", minimumFractionDigits: cents % 100 ? 2 : 0 }).format(value).replace("CN¥", "¥"); }
function formatDate(value: Date) { return new Intl.DateTimeFormat("zh-CN", { timeZone: "Asia/Shanghai" }).format(value); }

export function WorkCard({ work, author, compact = false }: { work: PublicWork; author: PublicWorkAuthor; compact?: boolean }) {
  const offShelf = work.status === "OFF_SHELF";
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const lightboxImages = useMemo(() => [
    ...(work.mainImageUrl ? [{ url: work.mainImageUrl, alt: `${work.name}主预览图` }] : []),
    ...work.images.map((image) => ({ url: image.url, alt: image.alt })),
  ], [work.images, work.mainImageUrl, work.name]);
  const previewOffset = work.mainImageUrl ? 1 : 0;
  const environmentNames = work.environments?.length ? work.environments : [work.supportsLab ? "LAB" : "", work.supportsWcglass ? "WCGlass" : ""].filter(Boolean);
  const fieldOrder = normalizeWorkFieldOrder(work.fieldOrder);
  const compactField = (field: WorkFieldKey) => {
    if (field === "identity") return <div className="flex min-w-0 items-baseline gap-2"><p className="shrink-0 text-[10px] text-muted sm:text-xs">{author.name}</p><h2 className="truncate text-sm font-semibold sm:text-base">{work.name}</h2></div>;
    if (field === "environments") return environmentNames.length ? <div className="flex gap-1 overflow-x-auto whitespace-nowrap">{environmentNames.map((name) => <Tag key={name}>{name}</Tag>)}</div> : null;
    if (field === "directPrice") return work.directPriceCents ? <CompactInfo label="直购">{formatCny(work.directPriceCents)}</CompactInfo> : null;
    if (field === "repostPrice") return work.repostPriceCents ? <CompactInfo label="转发">{formatCny(work.repostPriceCents)}</CompactInfo> : null;
    if (field === "features") return work.features ? <CompactInfo label="功能说明">{work.features}</CompactInfo> : null;
    if (field === "usageRequirements") return work.usageRequirements ? <CompactInfo label="使用要求">{work.usageRequirements}</CompactInfo> : null;
    if (field === "acquisitionMethod") return work.acquisitionMethod ? <CompactInfo label="获取方式">{work.acquisitionMethod}</CompactInfo> : null;
    if (field === "repostRequirements") return work.repostRequirements ? <CompactInfo label="转发要求">{work.repostRequirements}</CompactInfo> : null;
    if (field === "purchaseNotes") return work.purchaseNotes ? <CompactInfo label="购买须知">{work.purchaseNotes}</CompactInfo> : null;
    if (field === "contactDetails") return work.contactDetails ? <CompactInfo label="联系方式">{work.contactDetails}</CompactInfo> : null;
    if (field === "otherNotes") return work.otherNotes ? <CompactInfo label="其他说明">{work.otherNotes}</CompactInfo> : null;
    if (field === "version") return <p className="text-muted">版本 {work.version} · {formatDate(work.updatedAt)}</p>;
    if (field === "previews") return work.images.length ? <div className="relative z-20 flex h-20 shrink-0 snap-x gap-2 overflow-x-auto py-1" data-testid="compact-preview-strip">
      {work.images.map((image, index) => <button aria-label={`放大${image.alt}`} className="h-full min-w-14 snap-start overflow-hidden rounded-lg bg-background sm:min-w-20" key={image.id} onClick={() => setLightboxIndex(index + previewOffset)} type="button"><Image alt={image.alt} className="h-full w-full object-contain" height={120} src={image.url} width={160}/></button>)}
    </div> : null;
    return null;
  };
  if (compact) {
    const mainWidth = work.mainImageWidth || 4;
    const mainHeight = work.mainImageHeight || 3;
    return <article className="relative overflow-hidden rounded-[24px] border border-border bg-surface p-3" data-testid="compact-work-card">
      <a aria-label={`查看${work.name}详情`} className="absolute inset-0 z-10" href={`/works/${work.id}`} />
      <div className="flex w-[42%] items-center justify-center overflow-hidden rounded-[18px] bg-[#e7e4ec] sm:w-60" data-testid="compact-main-media" style={{ aspectRatio: `${mainWidth} / ${mainHeight}` }}>
        {work.mainImageUrl ? <Image className="h-full w-full object-contain" src={work.mainImageUrl} width={mainWidth} height={mainHeight} alt={`${work.name}主预览图`}/> : <span className="text-xs text-muted">暂无主图</span>}
      </div>
      <div className="absolute inset-y-3 right-3 left-[calc(42%+1.5rem)] flex min-h-0 flex-col overflow-hidden py-0.5 sm:left-[264px]">
        <div className="relative z-20 min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain pr-1 text-[10px] leading-[1.35] sm:text-xs">
          {fieldOrder.map((field) => <div key={field}>{compactField(field)}</div>)}
        </div>
      </div>
      {lightboxIndex !== null ? <ImageLightbox images={lightboxImages} index={lightboxIndex} onChange={setLightboxIndex} onClose={() => setLightboxIndex(null)} /> : null}
    </article>;
  }
  const fullField = (field: WorkFieldKey) => {
    if (field === "identity") return <div className="flex items-start justify-between gap-3"><div><p className="text-sm text-muted">{author.name}</p><h2 className="mt-1 text-2xl font-semibold tracking-tight">{work.name}</h2></div>{offShelf ? <span className="rounded-full bg-background px-3 py-1 text-sm">已下架</span> : null}</div>;
    if (field === "environments") return environmentNames.length ? <div className="mt-3 flex flex-wrap gap-2">{environmentNames.map((name) => <Tag key={name}>{name}</Tag>)}</div> : null;
    if (field === "directPrice") return work.directPriceCents ? <Price label="直购价" value={formatCny(work.directPriceCents)} /> : null;
    if (field === "repostPrice") return work.repostPriceCents ? <Price label="转发价" value={formatCny(work.repostPriceCents)} /> : null;
    if (field === "features") return work.features ? <Info title="功能说明">{work.features}</Info> : null;
    if (field === "usageRequirements") return work.usageRequirements ? <Info title="使用要求">{work.usageRequirements}</Info> : null;
    if (field === "acquisitionMethod") return work.acquisitionMethod ? <Info title="获取方式">{work.acquisitionMethod}</Info> : null;
    if (field === "repostRequirements") return work.repostRequirements ? <Info title="转发要求">{work.repostRequirements}</Info> : null;
    if (field === "purchaseNotes") return work.purchaseNotes ? <Info title="购买须知">{work.purchaseNotes}</Info> : null;
    if (field === "contactDetails") return work.contactDetails ? <Info title="联系方式">{work.contactDetails}</Info> : null;
    if (field === "otherNotes") return work.otherNotes ? <Info title="其他说明">{work.otherNotes}</Info> : null;
    if (field === "version") return <p className="my-5 text-xs text-muted">v{work.version} · 更新于 {formatDate(work.updatedAt)}</p>;
    if (field === "previews") return work.images.length ? <div className="mt-4 flex snap-x gap-3 overflow-x-auto pb-2">{work.images.map((image, index) => <button className="min-w-40 snap-start cursor-zoom-in" type="button" onClick={() => setLightboxIndex(index + previewOffset)} key={image.id}><Image className="aspect-[4/3] w-full rounded-2xl object-contain" src={image.url} width={640} height={480} alt={image.alt} /></button>)}</div> : null;
    return null;
  };
  return <article className="rounded-[28px] border border-border bg-surface p-3 sm:p-5"><div className="grid gap-6 md:grid-cols-[1.1fr_.9fr]"><div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[22px] bg-[#ddd9e3] text-sm text-muted">{work.mainImageUrl ? <button className="h-full w-full cursor-zoom-in" type="button" onClick={() => setLightboxIndex(0)}><Image className="h-full w-full object-contain" src={work.mainImageUrl} width={960} height={720} alt={`${work.name}主预览图`} /></button> : "作品主预览图"}</div><div className="p-2">{fieldOrder.map((field) => <div key={field}>{fullField(field)}</div>)}{offShelf ? null : <ContactAuthor authorName={author.name} wechatId={author.publicWechatId} qrUrl={author.qrUrl} />}</div></div>{lightboxIndex !== null ? <ImageLightbox images={lightboxImages} index={lightboxIndex} onChange={setLightboxIndex} onClose={() => setLightboxIndex(null)} /> : null}</article>;
}

function Tag({ children }: { children: React.ReactNode }) { return <span className="rounded-full bg-background px-3 py-1 text-xs">{children}</span>; }
function Price({ label, value }: { label: string; value: string }) { return <div><p className="text-xs text-muted">{label}</p><p className="mt-1 text-lg font-semibold">{value}</p></div>; }
function Info({ title, children }: { title: string; children: React.ReactNode }) { return <div className="mt-5 text-sm leading-6"><strong>{title}</strong><p className="mt-1 text-muted">{children}</p></div>; }
function CompactInfo({ label, children }: { label: string; children: React.ReactNode }) { return <p><strong>{label}：</strong><span className="text-muted">{children}</span></p>; }
