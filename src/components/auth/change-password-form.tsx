"use client";

import { useActionState } from "react";
import { changePassword } from "@/server/auth-actions";

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changePassword, { error: null });
  return <form action={action} className="mt-5 space-y-4">
    <label className="block text-sm font-medium">当前密码<input autoComplete="current-password" className="field-input mt-2" name="currentPassword" required type="password" /></label>
    <label className="block text-sm font-medium">新密码<input autoComplete="new-password" className="field-input mt-2" minLength={8} name="newPassword" required type="password" /></label>
    {state.error ? <p className="text-sm text-red-600" role="alert">{state.error}</p> : null}
    <button className="primary-button disabled:cursor-wait disabled:opacity-60" disabled={pending} type="submit">{pending ? "保存中…" : "保存新密码"}</button>
  </form>;
}
