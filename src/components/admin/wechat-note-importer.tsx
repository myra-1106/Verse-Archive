"use client";

import { useState } from "react";
import { parseWechatNote } from "@/lib/parse-wechat-note";

function setValue(form: HTMLFormElement, name: string, value: string | boolean) {
  const field = form.elements.namedItem(name);
  if (field instanceof HTMLInputElement && field.type === "checkbox") {
    field.checked = Boolean(value);
  } else if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
    field.value = String(value);
  }
}

export function WechatNoteImporter() {
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");

  const parse = (button: HTMLButtonElement) => {
    const form = button.closest("form");
    if (!form || !note.trim()) {
      setMessage("请先粘贴笔记文字");
      return;
    }
    const result = parseWechatNote(note);
    for (const [name, value] of Object.entries(result)) setValue(form, name, value);
    const missing = [
      !result.name && "作品名称",
      !result.directPriceYuan && "直购价",
      !result.repostPriceYuan && "转发价",
      !result.features && "功能说明",
    ].filter(Boolean);
    setMessage(missing.length ? `已填入识别结果，请补充：${missing.join("、")}` : "识别完成，请检查内容后保存");
  };

  return (
    <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <h2 className="font-semibold">粘贴微信笔记智能填表</h2>
      <p className="mt-2 text-sm text-muted">识别作品名称、直购价、转发价、功能说明、转发要求和购买须知。图片仍需手动上传。</p>
      <textarea className="field-input mt-4 min-h-40 py-3" value={note} onChange={(event) => setNote(event.target.value)} placeholder="粘贴微信笔记内容…" />
      <div className="mt-3 flex items-center gap-4">
        <button className="primary-button" type="button" onClick={(event) => parse(event.currentTarget)}>识别并填表</button>
        {message ? <p aria-live="polite" className="text-sm text-muted">{message}</p> : null}
      </div>
    </section>
  );
}
