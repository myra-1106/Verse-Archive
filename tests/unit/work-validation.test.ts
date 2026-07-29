import { describe, expect, it } from "vitest";
import { workSchema } from "@/lib/validation/work";

const valid = {
  name: "春日来信",
  slug: "spring-letter",
  authorCategoryId: "category-1",
  directPriceYuan: "28",
  repostPriceYuan: "18",
  features: "歌词与封面配色。",
  repostRequirements: "公开转发。",
  purchaseNotes: "添加作者微信。",
};

describe("workSchema", () => {
  it("converts yuan prices to integer cents", () => {
    const result = workSchema.parse(valid);
    expect(result.directPriceCents).toBe(2800);
    expect(result.authorCategoryId).toBe("category-1");
  });

  it("requires a category", () => {
    expect(workSchema.safeParse({ ...valid, authorCategoryId: "" }).success).toBe(false);
  });

  it("rejects negative or over-precise prices", () => {
    expect(workSchema.safeParse({ ...valid, directPriceYuan: "-1" }).success).toBe(false);
    expect(workSchema.safeParse({ ...valid, directPriceYuan: "28.001" }).success).toBe(false);
  });

  it("accepts optional card information as empty", () => {
    const result = workSchema.safeParse({
      ...valid,
      directPriceYuan: "",
      repostPriceYuan: "",
      features: "",
      repostRequirements: "",
      purchaseNotes: "",
    });
    expect(result.success).toBe(true);
  });
});
