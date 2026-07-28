import { describe, expect, it } from "vitest";
import {
  authorProfileSchema,
  categorySchema,
  reorderCategoriesSchema,
} from "@/lib/validation/author";

describe("author validation", () => {
  it("accepts a concise public author profile", () => {
    const result = authorProfileSchema.parse({
      name: " 南枝 ",
      bio: "温柔、克制的播放器作品。",
      publicWechatId: "nanzhi_2026",
      seoTitle: "",
      seoDescription: "",
    });

    expect(result.name).toBe("南枝");
    expect(result.seoTitle).toBeNull();
  });

  it("allows an author to keep the public WeChat number empty", () => {
    const result = authorProfileSchema.parse({
      name: "南枝",
      bio: "",
      publicWechatId: "",
      seoTitle: "",
      seoDescription: "",
    });

    expect(result.publicWechatId).toBe("");
  });

  it("limits custom category names to 20 characters", () => {
    expect(categorySchema.safeParse({ name: "主题" }).success).toBe(true);
    expect(categorySchema.safeParse({ name: "a".repeat(21) }).success).toBe(false);
  });

  it("rejects repeated category ids when reordering", () => {
    expect(reorderCategoriesSchema.safeParse({ ids: ["a", "a"] }).success).toBe(false);
  });
});
