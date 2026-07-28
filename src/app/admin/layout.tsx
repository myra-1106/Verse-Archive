import type { ReactNode } from "react";
import { UserRole } from "@prisma/client";
import { AdminSidebar } from "@/components/admin/sidebar";
import { requireRole } from "@/server/current-user";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireRole([
    UserRole.AUTHOR,
    UserRole.CONTENT_ADMIN,
    UserRole.SUPER_ADMIN,
  ]);

  return (
    <div className="min-h-screen md:flex">
      <AdminSidebar hasAuthor={Boolean(user.author)} role={user.role} />
      <main className="min-w-0 flex-1 p-5 sm:p-8">{children}</main>
    </div>
  );
}
