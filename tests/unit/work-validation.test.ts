import { describe, expect, it } from "vitest";
import { workSchema } from "@/lib/validation/work";

const valid = {
  name: "春日来信",
  slug: "spring-letter",
  authorCategoryId: "",
  directPriceYuan: "28",
  repostPriceYuan: "18",
  supportsLab: true,
  supportsWcglass: true,
  features: "歌词与封面配色。",
  repostRequirements: "公开转发。",
  purchaseNotes: "添加作者微信。",
};

describe("workSchema", () => {
  it("converts yuan prices to integer cents", () => {
    const result = workSchema.parse(valid);
    expect(result.directPriceCents).toBe(2800);
    expect(result.authorCategoryId).toBeNull();
  });

  it("requires at least one supported environment", () => {
    expect(workSchema.safeParse({ ...valid, supportsLab: false, supportsWcglass: false }).success).toBe(false);
  });

  it("rejects negative or over-precise prices", () => {
    expect(workSchema.safeParse({ ...valid, directPriceYuan: "-1" }).success).toBe(false);
    expect(workSchema.safeParse({ ...valid, directPriceYuan: "28.001" }).success).toBe(false);
  });
});
