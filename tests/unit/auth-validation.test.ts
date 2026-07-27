import { describe, expect, it } from "vitest";
import { registerSchema } from "@/lib/validation/auth";

describe("registerSchema", () => {
  it.each([
    { wechatId: "a", displayName: "小孟", password: "Collection123!" },
    { wechatId: "myra 微信", displayName: "小孟", password: "Collection123!" },
    { wechatId: "myra_2026", displayName: "", password: "Collection123!" },
    { wechatId: "myra_2026", displayName: "小孟", password: "short" },
    { wechatId: "myra_2026", displayName: "小孟", password: "12345678" },
  ])("rejects invalid registration input %#", (input) => {
    expect(registerSchema.safeParse(input).success).toBe(false);
  });

  it("normalizes valid registration input", () => {
    const result = registerSchema.parse({
      wechatId: "  myra_2026  ",
      displayName: "  小孟  ",
      password: "Collection123!",
    });

    expect(result).toEqual({
      wechatId: "myra_2026",
      displayName: "小孟",
      password: "Collection123!",
    });
  });
});
