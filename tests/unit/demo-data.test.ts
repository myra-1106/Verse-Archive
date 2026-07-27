import { describe, expect, it } from "vitest";
import { demoAuthors, demoCollection, demoWorks } from "@/server/demo-data";

describe("local demo data", () => {
  it("provides authors, custom categories, and complete works", () => {
    expect(demoAuthors.length).toBeGreaterThanOrEqual(3);
    expect(demoCollection.categories.map((category) => category.name)).toEqual(["卡片", "主题", "气泡"]);
    expect(demoWorks[0].work.directPriceCents).toBeGreaterThan(0);
  });
});
