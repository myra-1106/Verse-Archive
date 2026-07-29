"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({ children, className = "primary-button", pendingText = "处理中…", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { pendingText?: string }) {
  const { pending } = useFormStatus();
  return <button {...props} className={`${className} disabled:cursor-wait disabled:opacity-60`} disabled={pending || props.disabled} type="submit">{pending ? pendingText : children}</button>;
}
