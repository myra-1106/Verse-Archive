"use client";

import { useRef, useState } from "react";
import Image from "next/image";

export function ContactAuthor({ authorName, wechatId, qrUrl }: { authorName: string; wechatId: string; qrUrl: string | null }) {
  const dialog = useRef<HTMLDialogElement>(null); const [copyStatus, setCopyStatus] = useState("");
  async function copy() { setCopyStatus("复制中…"); try { await navigator.clipboard.writeText(wechatId); setCopyStatus("复制成功"); } catch { setCopyStatus("复制失败，请长按微信号复制"); } }
  if (!wechatId && !qrUrl) return null;
  return <><button className="primary-button w-full" type="button" onClick={() => dialog.current?.showModal()}>联系作者购买</button><dialog ref={dialog} className="m-auto w-[min(90vw,380px)] rounded-[26px] border border-border bg-surface p-6 text-foreground backdrop:bg-black/50"><div className="flex justify-between"><h3 className="text-xl font-semibold">联系{authorName}</h3><button aria-label="关闭" onClick={() => dialog.current?.close()}>×</button></div>{qrUrl ? <Image className="mx-auto mt-5 aspect-square w-48 rounded-2xl object-contain" src={qrUrl} width={384} height={384} alt={`${authorName}的微信二维码`} /> : null}{wechatId ? <><p className="mt-5 text-center text-sm text-muted">微信号</p><p className="mt-1 select-all text-center text-lg font-medium">{wechatId}</p><button className="mt-4 min-h-11 w-full rounded-full border border-border" type="button" onClick={copy}>{copyStatus || "复制微信号"}</button></> : null}</dialog></>;
}
