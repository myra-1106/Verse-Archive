import { z } from "zod";

export const registerSchema = z.object({
  wechatId: z
    .string()
    .trim()
    .min(2, "微信 ID 至少需要 2 个字符")
    .max(32, "微信 ID 不能超过 32 个字符")
    .regex(/^[A-Za-z0-9_-]+$/, "微信 ID 只能包含字母、数字、下划线和短横线"),
  displayName: z
    .string()
    .trim()
    .min(1, "请输入昵称")
    .max(30, "昵称不能超过 30 个字符"),
  password: z
    .string()
    .min(8, "密码至少需要 8 个字符")
    .max(72, "密码不能超过 72 个字符")
    .regex(/[A-Za-z]/, "密码必须包含字母")
    .regex(/[0-9]/, "密码必须包含数字"),
});

export const loginSchema = z.object({
  wechatId: z.string().trim().min(1, "请输入微信 ID"),
  password: z.string().min(1, "请输入密码"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
