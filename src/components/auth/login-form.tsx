"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(formData: FormData) {
    setPending(true);
    setError(null);
    try {
      const result = await signIn("credentials", {
        wechatId: formData.get("wechatId"),
        password: formData.get("password"),
        redirect: false,
        callbackUrl: "/",
      });
      if (!result?.ok) {
        setError("微信 ID 或密码不正确");
        return;
      }
      window.location.assign(result.url ?? "/");
    } catch {
      setError("网络连接失败，请稍后重试");
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={submit} className="space-y-5">
      <label className="block text-sm font-medium">
        微信 ID
        <input
          className="field-input mt-2"
          name="wechatId"
          autoComplete="username"
          required
        />
      </label>
      <label className="block text-sm font-medium">
        密码
        <input
          className="field-input mt-2"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </label>
      {error ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}
      <button className="primary-button w-full" disabled={pending} type="submit">
        {pending ? "正在登录…" : "登录"}
      </button>
      <p className="text-center text-sm text-muted">忘记密码请联系管理员。</p>
    </form>
  );
}
