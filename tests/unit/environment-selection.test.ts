import { describe, expect, it } from "vitest";
import { legacyEnvironmentFlags } from "@/lib/environment-selection";

describe("legacy environment flags", () => {
  it("does not restore LAB or WCGlass after both are unchecked", () => {
    expect(legacyEnvironmentFlags(["XOS", "白衣"])).toEqual({
      supportsLab: false,
      supportsWcglass: false,
    });
  });

  it("keeps legacy flags aligned with the environments actually selected", () => {
    expect(legacyEnvironmentFlags(["LAB", "气泡盒子"])).toEqual({
      supportsLab: true,
      supportsWcglass: false,
    });
    expect(legacyEnvironmentFlags(["WCGlass"])).toEqual({
      supportsLab: false,
      supportsWcglass: true,
    });
  });
});
