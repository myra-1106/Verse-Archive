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
        <p className="mt-7 text-center text-sm text-muted">作者账号由管理员创建。</p>
      </section>
    </main>
  );
}
