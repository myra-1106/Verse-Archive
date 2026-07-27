import { UserRole, UserStatus } from "@prisma/client";
import { describe, expect, it } from "vitest";
import {
  canManageAuthor,
  canManageUsers,
  canManageWork,
  canRestoreWork,
} from "@/lib/permissions";

const actor = (
  id: string,
  role: UserRole,
  status: UserStatus = UserStatus.ACTIVE,
) => ({
  id,
  role,
  status,
});

describe("resource permissions", () => {
  it("only lets an author manage their bound author and works", () => {
    const authorUser = actor("user-a", UserRole.AUTHOR);

    expect(canManageAuthor(authorUser, { accountUserId: "user-a" })).toBe(true);
    expect(canManageAuthor(authorUser, { accountUserId: "user-b" })).toBe(false);
    expect(canManageWork(authorUser, { author: { accountUserId: "user-a" } })).toBe(true);
    expect(canManageWork(authorUser, { author: { accountUserId: "user-b" } })).toBe(false);
  });

  it("lets content administrators manage content but not users or restoration", () => {
    const admin = actor("content", UserRole.CONTENT_ADMIN);

    expect(canManageAuthor(admin, { accountUserId: null })).toBe(true);
    expect(canManageWork(admin, { author: { accountUserId: null } })).toBe(true);
    expect(canManageUsers(admin)).toBe(false);
    expect(canRestoreWork(admin)).toBe(false);
  });

  it("reserves account management and restoration for super administrators", () => {
    const admin = actor("super", UserRole.SUPER_ADMIN);

    expect(canManageUsers(admin)).toBe(true);
    expect(canRestoreWork(admin)).toBe(true);
  });

  it("denies every protected action to suspended users", () => {
    const admin = actor("super", UserRole.SUPER_ADMIN, UserStatus.SUSPENDED);

    expect(canManageUsers(admin)).toBe(false);
    expect(canManageAuthor(admin, { accountUserId: null })).toBe(false);
    expect(canManageWork(admin, { author: { accountUserId: null } })).toBe(false);
    expect(canRestoreWork(admin)).toBe(false);
  });
});
