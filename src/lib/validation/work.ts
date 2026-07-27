import { z } from "zod";

const checkbox = z.preprocess(
  (value) => value === true || value === "on" || value === "true",
  z.boolean(),
);

const yuan = z
  .string()
  .trim()
  .regex(/^\d{1,7}(?:\.\d{1,2})?$/, "请输入正确的人民币价格")
  .transform((value) => Math.round(Number(value) * 100))
  .refine((value) => value <= 1_000_000, "价格不能超过 10000 元");

export const workSchema = z
  .object({
    name: z.string().trim().min(1).max(80),
    slug: z.string().trim().toLowerCase().regex(/^[a-z0-9-]{2,80}$/),
    authorCategoryId: z.string().trim().transform((value) => value || null),
    directPriceYuan: yuan,
    repostPriceYuan: yuan,
    supportsLab: checkbox,
    supportsWcglass: checkbox,
    features: z.string().trim().min(1).max(2000),
    repostRequirements: z.string().trim().min(1).max(2000),
    purchaseNotes: z.string().trim().min(1).max(2000),
  })
  .refine((value) => value.supportsLab || value.supportsWcglass, {
    message: "至少选择一个支持环境",
    path: ["supportsLab"],
  })
  .transform(({ directPriceYuan, repostPriceYuan, ...rest }) => ({
    ...rest,
    directPriceCents: directPriceYuan,
    repostPriceCents: repostPriceYuan,
  }));
