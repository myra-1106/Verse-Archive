"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <html lang="zh-CN"><body><main style={{ alignItems: "center", display: "flex", flexDirection: "column", justifyContent: "center", minHeight: "100vh", padding: 24, textAlign: "center" }}>
    <h1>Verse Archive 暂时无法打开</h1>
    <p>请检查网络后重新尝试，或稍后再回来。</p>
    <button onClick={reset} style={{ border: 0, borderRadius: 999, marginTop: 16, padding: "12px 20px" }} type="button">重新尝试</button>
  </main></body></html>;
}
