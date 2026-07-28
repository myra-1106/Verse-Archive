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

  it("stores configurable environments and author-owned templates", () => {
    const schema = readFileSync(
      join(process.cwd(), "prisma/schema.prisma"),
      "utf8",
    );

    expect(schema).toContain("model Environment");
    expect(schema).toContain("model WorkEnvironment");
    expect(schema).toContain("model AuthorTemplate");
    expect(schema).toContain("model TemplateEnvironment");
    expect(schema).toMatch(/usageRequirements\s+String/);
    expect(schema).toMatch(/acquisitionMethod\s+String/);
    expect(schema).toMatch(/contactDetails\s+String/);
    expect(schema).toMatch(/featured\s+Boolean\s+@default\(false\)/);
    expect(schema).toContain("@@unique([authorId, name])");
  });
});
