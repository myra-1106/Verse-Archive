"use client";

import { useState } from "react";
import {
  normalizeWorkFieldOrder,
  WORK_FIELD_LABELS,
  type WorkFieldKey,
} from "@/lib/work-field-order";

export function FieldOrderEditor({
  initialOrder,
  order: controlledOrder,
  onChange,
}: {
  initialOrder?: unknown;
  order?: WorkFieldKey[];
  onChange?: (order: WorkFieldKey[]) => void;
}) {
  const [localOrder, setLocalOrder] = useState(() => normalizeWorkFieldOrder(initialOrder));
  const normalized = normalizeWorkFieldOrder(controlledOrder ?? localOrder);

  function move(index: number, offset: -1 | 1) {
    const target = index + offset;
    if (target < 0 || target >= normalized.length) return;
    const next = [...normalized];
    [next[index], next[target]] = [next[target], next[index]];
    if (onChange) onChange(next);
    else setLocalOrder(next);
  }

  return <fieldset>
    <legend className="text-sm font-medium">卡片显示顺序</legend>
    <p className="mt-1 text-xs text-muted">空内容会自动隐藏。套用模板后仍可单独调整。</p>
    <div className="mt-3 space-y-2">
      {normalized.map((field, index) => <div className="flex items-center gap-2 rounded-xl border border-border px-3 py-2" key={field}>
        <input name="fieldOrder" type="hidden" value={field} />
        <span className="min-w-0 flex-1 text-sm">{WORK_FIELD_LABELS[field]}</span>
        <button aria-label={`上移${WORK_FIELD_LABELS[field]}`} disabled={index === 0} onClick={() => move(index, -1)} type="button">↑</button>
        <button aria-label={`下移${WORK_FIELD_LABELS[field]}`} disabled={index === normalized.length - 1} onClick={() => move(index, 1)} type="button">↓</button>
      </div>)}
    </div>
  </fieldset>;
}
