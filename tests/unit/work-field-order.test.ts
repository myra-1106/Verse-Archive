import { describe, expect, it } from "vitest";
import {
  DEFAULT_WORK_FIELD_ORDER,
  normalizeWorkFieldOrder,
} from "@/lib/work-field-order";

describe("normalizeWorkFieldOrder", () => {
  it("keeps a valid custom order and appends missing fields", () => {
    const result = normalizeWorkFieldOrder(["purchaseNotes", "features"]);
    expect(result.slice(0, 2)).toEqual(["purchaseNotes", "features"]);
    expect(result).toHaveLength(DEFAULT_WORK_FIELD_ORDER.length);
  });

  it("removes duplicates and unknown fields", () => {
    const result = normalizeWorkFieldOrder(["features", "unknown", "features"]);
    expect(result.filter((field) => field === "features")).toHaveLength(1);
    expect(result).not.toContain("unknown");
  });

  it("uses the default order for missing data", () => {
    expect(normalizeWorkFieldOrder(null)).toEqual(DEFAULT_WORK_FIELD_ORDER);
  });
});
