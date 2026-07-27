import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/auth";
import { db } from "@/lib/db";
import { UserRole, UserStatus } from "@prisma/client";

export async function requireUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      displayName: true,
      role: true,
      status: true,
      sessionVersion: true,
      author: { select: { id: true } },
    },
  });

  if (
    !user ||
    user.status !== UserStatus.ACTIVE ||
    user.sessionVersion !== session.user.sessionVersion
  ) {
    redirect("/login?expired=1");
  }

  return user;
}

export async function requireRole(roles: UserRole[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect("/");
  return user;
}

export async function requireAuthorAccess(authorId: string) {
  const user = await requireUser();
  if (
    user.role !== UserRole.SUPER_ADMIN &&
    user.role !== UserRole.CONTENT_ADMIN &&
    user.author?.id !== authorId
  ) {
    throw new Error("FORBIDDEN");
  }
  return user;
}
