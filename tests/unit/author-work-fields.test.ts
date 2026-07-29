import { describe, expect, it } from "vitest";
import { normalizeHiddenWorkFields } from "@/lib/author-work-fields";

describe("author work fields", () => {
  it("keeps only supported unique field keys", () => {
    expect(normalizeHiddenWorkFields(["features", "unknown", "features", "acquisitionMethod"]))
      .toEqual(["features", "acquisitionMethod"]);
  });

  it("uses no hidden fields for missing settings", () => {
    expect(normalizeHiddenWorkFields(null)).toEqual([]);
  });
});
