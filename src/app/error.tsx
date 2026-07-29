"use client";

import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 text-center">
    <h1 className="text-2xl font-semibold">页面暂时无法完成操作</h1>
    <p className="mt-3 text-sm text-muted">{friendlyMessage(error.message)}</p>
    <div className="mt-6 flex gap-3">
      <button className="primary-button" onClick={reset} type="button">重新尝试</button>
      <Link className="rounded-full border border-border px-5 py-3 text-sm" href="/">返回首页</Link>
    </div>
  </main>;
}

function friendlyMessage(message: string) {
  if (message.includes("FORBIDDEN")) return "你没有权限操作这项内容。";
  if (message.includes("NOT_FOUND") || message.includes("Record to update not found")) return "这项内容不存在或已被删除。";
  return "请检查网络后重试。已经填写的内容请先不要关闭页面。";
}
