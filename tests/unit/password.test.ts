import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/password";

describe("password hashing", () => {
  it("stores an Argon2id hash and verifies the original password", async () => {
    const hash = await hashPassword("Collection123!");

    expect(hash).toMatch(/^\$argon2id\$/);
    await expect(verifyPassword(hash, "Collection123!")).resolves.toBe(true);
    await expect(verifyPassword(hash, "Wrong123!")).resolves.toBe(false);
  });
});
