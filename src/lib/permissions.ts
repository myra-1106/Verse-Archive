import { UserRole, UserStatus } from "@prisma/client";

export type Actor = {
  id: string;
  role: UserRole;
  status: UserStatus;
};

type AuthorResource = { accountUserId: string | null };
type WorkResource = { author: AuthorResource };

function isActive(actor: Actor) {
  return actor.status === UserStatus.ACTIVE;
}

export function canManageAuthor(actor: Actor, author: AuthorResource) {
  if (!isActive(actor)) return false;
  if (actor.role === UserRole.SUPER_ADMIN || actor.role === UserRole.CONTENT_ADMIN) {
    return true;
  }
  return actor.role === UserRole.AUTHOR && author.accountUserId === actor.id;
}

export function canManageWork(actor: Actor, work: WorkResource) {
  return canManageAuthor(actor, work.author);
}

export function canManageUsers(actor: Actor) {
  return isActive(actor) && actor.role === UserRole.SUPER_ADMIN;
}

export function canRestoreWork(actor: Actor) {
  return canManageUsers(actor);
}
