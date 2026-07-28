import { describe, expect, it } from "vitest";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { saveImage, validateImageInput } from "@/lib/storage";

const ONE_PIXEL_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);

describe("image uploads", () => {
  it("accepts supported images under 10 MiB", () => {
    expect(() => validateImageInput({ type: "image/webp", size: 1024 })).not.toThrow();
  });

  it("rejects unsupported types and oversized files", () => {
    expect(() => validateImageInput({ type: "image/svg+xml", size: 1024 })).toThrow("请选择照片");
    expect(() => validateImageInput({ type: "image/png", size: 10 * 1024 * 1024 + 1 })).toThrow("10 MB");
  });

  it("rejects a file whose bytes do not match its declared image type", async () => {
    const file = new File(["not an image"], "fake.png", { type: "image/png" });
    await expect(saveImage(file, await mkdtemp(path.join(tmpdir(), "collection-upload-")))).rejects.toThrow(
      "无法识别",
    );
  });

  it("normalizes a verified image to WebP under a generated date path", async () => {
    const directory = await mkdtemp(path.join(tmpdir(), "collection-upload-"));
    const file = new File([ONE_PIXEL_PNG], "author portrait.png", { type: "image/png" });

    const saved = await saveImage(file, directory, new Date("2026-07-28T00:00:00Z"));

    expect(saved).toMatchObject({
      mimeType: "image/webp",
      width: 1,
      height: 1,
    });
    expect(saved.key).toMatch(/^uploads\/2026\/07\/[0-9a-f-]+\.webp$/);
    expect((await readFile(path.join(directory, saved.key))).length).toBeGreaterThan(0);
  });
});
