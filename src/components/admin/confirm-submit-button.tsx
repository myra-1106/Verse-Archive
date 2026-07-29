"use client";

import type { ButtonHTMLAttributes } from "react";
import { SubmitButton } from "@/components/admin/submit-button";

export function ConfirmSubmitButton({
  confirmMessage,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { confirmMessage: string; pendingText?: string }) {
  return <SubmitButton {...props} onClick={(event) => {
    if (!window.confirm(confirmMessage)) event.preventDefault();
  }} />;
}
