"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";

export function ProtectedForm({
  action,
  children,
  className,
}: {
  action: (data: FormData) => void | Promise<void>;
  children: ReactNode;
  className?: string;
}) {
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!dirty) return;
    const message = "还有未保存的内容，确定离开吗？";
    const beforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = message;
    };
    const linkClick = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (link && !window.confirm(message)) event.preventDefault();
    };
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", linkClick);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", linkClick);
    };
  }, [dirty]);

  function submit(_event: FormEvent<HTMLFormElement>) {
    setDirty(false);
  }

  return <form action={action} className={className} onChangeCapture={() => setDirty(true)} onSubmit={submit}>{children}</form>;
}
