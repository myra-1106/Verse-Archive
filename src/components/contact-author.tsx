"use client";

import { useRef, useState } from "react";
import Image from "next/image";

export function ContactAuthor({ authorName, wechatId, qrUrl }: { authorName: string; wechatId: string; qrUrl: string | null }) {
  const dialog = useRef<HTMLDialogElement>(null); const [copied, setCopied] = useState(false);
  async function copy() { try { await navigator.clipboard.writeText(wechatId); setCopied(true); } catch { setCopied(false); } }
  return <><button className="primary-button w-full" type="button" onClick={() => dialog.current?.showModal()}>联系作者购买</button><dialog ref={dialog} className="m-auto w-[min(90vw,380px)] rounded-[26px] border border-border bg-surface p-6 text-foreground backdrop:bg-black/50"><div className="flex justify-between"><h3 className="text-xl font-semibold">联系{authorName}</h3><button aria-label="关闭" onClick={() => dialog.current?.close()}>×</button></div>{qrUrl ? <Image className="mx-auto mt-5 aspect-square w-48 rounded-2xl object-cover" src={qrUrl} width={384} height={384} alt={`${authorName}的微信二维码`} /> : null}<p className="mt-5 text-center text-sm text-muted">微信 ID</p><p className="mt-1 select-all text-center text-lg font-medium">{wechatId}</p><button className="mt-4 min-h-11 w-full rounded-full border border-border" type="button" onClick={copy}>{copied ? "已复制" : "复制微信 ID"}</button></dialog></>;
}
