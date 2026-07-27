import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="text-sm font-medium text-accent">建立账号</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">注册</h1>
        <div className="mt-8">
          <RegisterForm />
        </div>
        <p className="mt-7 text-center text-sm text-muted">
          已有账号？<Link className="text-foreground underline" href="/login">登录</Link>
        </p>
      </section>
    </main>
  );
}
