import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("database schema contract", () => {
  it("enforces account, author, favorite, and category constraints", () => {
    const schema = readFileSync(
      join(process.cwd(), "prisma/schema.prisma"),
      "utf8",
    );

    expect(schema).toMatch(/wechatId\s+String\s+@unique/);
    expect(schema).toMatch(/accountUserId\s+String\?\s+@unique/);
    expect(schema).toContain("@@unique([userId, workId])");
    expect(schema).toMatch(/authorCategoryId\s+String\?/);
    expect(schema).toMatch(/displayOrder\s+Int\s+@default\(0\)/);
  });
});
