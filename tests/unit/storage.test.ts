import { describe, expect, it } from "vitest";
import { validateImageInput } from "@/lib/storage";

describe("image uploads", () => {
  it("accepts supported images under 10 MiB", () => {
    expect(() => validateImageInput({ type: "image/webp", size: 1024 })).not.toThrow();
  });

  it("rejects unsupported types and oversized files", () => {
    expect(() => validateImageInput({ type: "image/svg+xml", size: 1024 })).toThrow("图片格式");
    expect(() => validateImageInput({ type: "image/png", size: 10 * 1024 * 1024 + 1 })).toThrow("10 MB");
  });
});
