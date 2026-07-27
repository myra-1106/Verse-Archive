import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="text-sm font-medium text-accent">欢迎回来</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">登录</h1>
        <div className="mt-8">
          <LoginForm />
        </div>
        <p className="mt-7 text-center text-sm text-muted">
          还没有账号？<Link className="text-foreground underline" href="/register">注册</Link>
        </p>
      </section>
    </main>
  );
}
