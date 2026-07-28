"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({ children, pendingText = "处理中…" }: { children: React.ReactNode; pendingText?: string }) {
  const { pending } = useFormStatus();
  return <button className="primary-button disabled:cursor-wait disabled:opacity-60" disabled={pending} type="submit">{pending ? pendingText : children}</button>;
}
