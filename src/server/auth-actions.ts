"use server";

import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { registerSchema } from "@/lib/validation/auth";

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
