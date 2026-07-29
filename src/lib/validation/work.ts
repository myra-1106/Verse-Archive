import { z } from "zod";

const yuan = z
  .string()
  .trim()
  .regex(/^(?:\d{1,7}(?:\.\d{1,2})?)?$/, "请输入正确的人民币价格")
  .transform((value) => value ? Math.round(Number(value) * 100) : 0)
  .refine((value) => value <= 1_000_000, "价格不能超过 10000 元");
const checkbox = z.preprocess((value) => value === "on" || value === "true" || value === true, z.boolean());

export const workSchema = z
  .object({
    name: z.string().trim().min(1).max(80),
    slug: z.string().trim().toLowerCase().regex(/^[a-z0-9-]{2,80}$/),
    authorCategoryId: z.string().trim().min(1, "请选择作品分类"),
    directPriceYuan: yuan,
    repostPriceYuan: yuan,
    features: z.string().trim().max(2000).default(""),
    usageRequirements: z.string().trim().max(2000).default(""),
    acquisitionMethod: z.string().trim().max(2000).default(""),
    repostRequirements: z.string().trim().max(2000).default(""),
    purchaseNotes: z.string().trim().max(2000).default(""),
    contactDetails: z.string().trim().max(500).default(""),
    otherNotes: z.string().trim().max(2000).default(""),
    featured: checkbox,
  })
  .transform(({ directPriceYuan, repostPriceYuan, ...rest }) => ({
    ...rest,
    directPriceCents: directPriceYuan,
    repostPriceCents: repostPriceYuan,
  }));
