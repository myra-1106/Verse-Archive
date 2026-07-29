"use client";

import { useRef, useState } from "react";
import {
  normalizeWorkFieldOrder,
  WORK_FIELD_LABELS,
  type WorkFieldKey,
} from "@/lib/work-field-order";

export function FieldOrderEditor({
  initialOrder,
  order: controlledOrder,
  onChange,
  hiddenFields = [],
}: {
  initialOrder?: unknown;
  order?: WorkFieldKey[];
  onChange?: (order: WorkFieldKey[]) => void;
  hiddenFields?: WorkFieldKey[];
}) {
  const [localOrder, setLocalOrder] = useState(() => normalizeWorkFieldOrder(initialOrder));
  const [dragging, setDragging] = useState<WorkFieldKey | null>(null);
  const draggingRef = useRef<WorkFieldKey | null>(null);
  const normalized = normalizeWorkFieldOrder(controlledOrder ?? localOrder);
  const visible = normalized.filter((field) => !hiddenFields.includes(field));

  function moveTo(field: WorkFieldKey, targetField: WorkFieldKey) {
    const index = normalized.indexOf(field);
    const target = normalized.indexOf(targetField);
    if (index < 0 || target < 0 || index === target) return;
    const next = [...normalized];
    next.splice(index, 1);
    next.splice(target, 0, field);
    if (onChange) onChange(next);
    else setLocalOrder(next);
  }

  function stopDragging() {
    draggingRef.current = null;
    setDragging(null);
  }

  return <fieldset>
    <legend className="text-sm font-medium">卡片显示顺序</legend>
    <p className="mt-1 text-xs text-muted">空内容会自动隐藏。套用模板后仍可单独调整。</p>
    {normalized.map((field) => <input name="fieldOrder" type="hidden" value={field} key={`value-${field}`} />)}
    <div className="mt-3 space-y-2">
      {visible.map((field) => <div className={`flex items-center gap-2 rounded-xl border border-border px-3 py-2 ${dragging === field ? "bg-background" : ""}`} data-work-field={field} key={field}>
        <span className="min-w-0 flex-1 text-sm">{WORK_FIELD_LABELS[field]}</span>
        <button
          aria-label={`拖动调整${WORK_FIELD_LABELS[field]}位置`}
          className="cursor-grab touch-none rounded-lg px-2 py-2 text-muted active:cursor-grabbing"
          onPointerCancel={stopDragging}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            draggingRef.current = field;
            setDragging(field);
          }}
          onPointerMove={(event) => {
            const active = draggingRef.current;
            if (!active) return;
            const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>("[data-work-field]")?.dataset.workField as WorkFieldKey | undefined;
            if (target && target !== active && visible.includes(target)) moveTo(active, target);
          }}
          onPointerUp={stopDragging}
          type="button"
        ><span aria-hidden className="block text-lg leading-none">☰</span></button>
      </div>)}
    </div>
  </fieldset>;
}
