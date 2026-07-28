import { describe, expect, it } from "vitest";
import { normalizeWorkFilters } from "@/lib/work-filters";

describe("work filters", () => {
  it("normalizes supported query parameters", () => {
    expect(normalizeWorkFilters({
      q: "  南枝  ",
      author: "author-1",
      category: "category-1",
      environment: "lab",
      sort: "updated",
    })).toEqual({
      q: "南枝",
      author: "author-1",
      category: "category-1",
      environment: "lab",
      sort: "updated",
    });
  });

  it("drops unsupported values", () => {
    expect(normalizeWorkFilters({ environment: "", sort: "popular" })).toEqual({
      q: "",
      author: "",
      category: "",
      environment: "",
      sort: "latest",
    });
  });
});
