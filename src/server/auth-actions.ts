"use server";

import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { registerSchema } from "@/lib/validation/auth";
import { verifyPassword } from "@/lib/password";
import { requireUser } from "@/server/current-user";

export type RegisterState = { error: string | null };

export async function registerAction(
  _state: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const parsed = registerSchema.safeParse({
    wechatId: formData.get("wechatId"),
    displayName: formData.get("displayName"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "注册信息不正确" };
  }

  try {
    await db.user.create({
      data: {
        wechatId: parsed.data.wechatId,
        displayName: parsed.data.displayName,
        passwordHash: await hashPassword(parsed.data.password),
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { error: "该微信 ID 已注册" };
    }
    return { error: "暂时无法注册，请稍后重试" };
  }

  redirect("/login?registered=1");
}

export async function changePassword(formData: FormData) {
  const user = await requireUser();
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const account = await db.user.findUniqueOrThrow({ where: { id: user.id } });
  if (!(await verifyPassword(account.passwordHash, currentPassword))) throw new Error("当前密码不正确");
  const parsed = registerSchema.shape.password.safeParse(newPassword);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "新密码不符合要求");
  await db.user.update({
    where: { id: user.id },
    data: {
      passwordHash: await hashPassword(parsed.data),
      mustChangePassword: false,
      sessionVersion: { increment: 1 },
    },
  });
  redirect("/login?passwordChanged=1");
}
