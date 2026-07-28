"use server";

import { UserRole, UserStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { registerSchema } from "@/lib/validation/auth";
import { requireRole } from "@/server/current-user";

export async function createContentAdmin(formData: FormData) {
  await requireRole([UserRole.SUPER_ADMIN]);
  const parsed = registerSchema.safeParse({
    wechatId: formData.get("wechatId"),
    displayName: formData.get("displayName"),
    password: formData.get("password"),
  });
  if (!parsed.success) redirect("/admin/admins?error=invalid");

  const data = parsed.data;
  const existingUser = await db.user.findUnique({
    where: { wechatId: data.wechatId },
    select: { id: true },
  });
  if (existingUser) redirect("/admin/admins?error=duplicate");

  await db.user.create({
    data: {
      wechatId: data.wechatId,
      displayName: data.displayName,
      passwordHash: await hashPassword(data.password),
      role: UserRole.CONTENT_ADMIN,
      mustChangePassword: true,
    },
  });
  revalidatePath("/admin/admins");
  redirect("/admin/admins?created=1");
}

export async function setContentAdminStatus(formData: FormData) {
  await requireRole([UserRole.SUPER_ADMIN]);
  const userId = String(formData.get("userId") ?? "");
  const status = formData.get("status") === UserStatus.ACTIVE ? UserStatus.ACTIVE : UserStatus.SUSPENDED;
  const target = await db.user.findUniqueOrThrow({ where: { id: userId } });
  if (target.role !== UserRole.CONTENT_ADMIN) throw new Error("INVALID_ADMIN");
  await db.user.update({
    where: { id: target.id },
    data: { status, sessionVersion: { increment: 1 } },
  });
  revalidatePath("/admin/admins");
}
