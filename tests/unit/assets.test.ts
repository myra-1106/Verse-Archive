import { describe, expect, it } from "vitest";
import { assetUrl } from "@/lib/assets";

describe("asset URLs", () => {
  it("keeps public cloud URLs unchanged", () => {
    expect(assetUrl("https://store.public.blob.vercel-storage.com/image.png"))
      .toBe("https://store.public.blob.vercel-storage.com/image.png");
  });

  it("turns local storage keys into public paths", () => {
    expect(assetUrl("uploads/2026/07/image.png")).toBe("/uploads/2026/07/image.png");
  });
});
