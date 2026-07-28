import { describe, expect, it } from "vitest";
import { isHeicFile } from "@/lib/client-image";

describe("client image preparation", () => {
  it("recognizes Apple HEIC and HEIF photos by MIME type or extension", () => {
    expect(isHeicFile({ name: "photo.HEIC", type: "" })).toBe(true);
    expect(isHeicFile({ name: "photo", type: "image/heif" })).toBe(true);
    expect(isHeicFile({ name: "photo.jpg", type: "image/jpeg" })).toBe(false);
  });
});
