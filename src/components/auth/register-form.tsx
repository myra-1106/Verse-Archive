"use client";

import { useActionState } from "react";
import { registerAction } from "@/server/auth-actions";

const initialState = { error: null };

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, initialState);

  return (
    <form action={action} className="space-y-5">
      <Field label="微信 ID" name="wechatId" autoComplete="username" />
      <Field label="昵称" name="displayName" autoComplete="nickname" />
      <Field
        label="密码"
        name="password"
        type="password"
        autoComplete="new-password"
      />
      <p className="text-sm leading-6 text-muted">
        微信 ID 是唯一登录账号，注册后需要联系管理员才能修改。
      </p>
      {state.error ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      ) : null}
      <button className="primary-button w-full" disabled={pending} type="submit">
        {pending ? "正在注册…" : "注册"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete: string;
}) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <input
        className="field-input mt-2"
        name={name}
        type={type}
        autoComplete={autoComplete}
        required
      />
    </label>
  );
}
