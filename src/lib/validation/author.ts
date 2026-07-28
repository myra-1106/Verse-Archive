import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => value || null);

export const authorProfileSchema = z.object({
  name: z.string().trim().min(1, "请输入作者名称").max(30),
  bio: z.string().trim().max(500),
  publicWechatId: z.string().trim().max(64),
  seoTitle: optionalText(70),
  seoDescription: optionalText(160),
});

export const categorySchema = z.object({
  name: z.string().trim().min(1, "请输入分类名称").max(20, "分类名称不能超过 20 个字符"),
});

export const reorderCategoriesSchema = z
  .object({ ids: z.array(z.string().min(1)).max(50) })
  .refine(({ ids }) => new Set(ids).size === ids.length, "分类不能重复");
