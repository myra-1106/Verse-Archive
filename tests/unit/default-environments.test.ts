import { describe, expect, it } from "vitest";
import { DEFAULT_ENVIRONMENTS } from "@/server/environments";

describe("default environments", () => {
  it("keeps every required environment in its fixed order", () => {
    expect(DEFAULT_ENVIRONMENTS).toEqual([
      "LAB",
      "WCGlass",
      "XOS",
      "白衣",
      "主题盒子",
      "气泡盒子",
    ]);
  });
});
