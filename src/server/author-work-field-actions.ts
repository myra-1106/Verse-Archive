"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { normalizeHiddenWorkFields, OPTIONAL_WORK_FIELDS, type OptionalWorkField } from "@/lib/author-work-fields";
import { requireAuthorAccess } from "@/server/current-user";

export async function setAuthorWorkFieldHidden(authorId: string, field: OptionalWorkField, hidden: boolean) {
  await requireAuthorAccess(authorId);
  if (!OPTIONAL_WORK_FIELDS.includes(field)) throw new Error("INVALID_WORK_FIELD");
  const author = await db.author.findUniqueOrThrow({ where: { id: authorId }, select: { hiddenWorkFields: true } });
  const current = normalizeHiddenWorkFields(author.hiddenWorkFields);
  const next = hidden ? [...new Set([...current, field])] : current.filter((item) => item !== field);
  await db.author.update({ where: { id: authorId }, data: { hiddenWorkFields: next } });
  revalidatePath("/admin/works/new");
  revalidatePath("/admin/works/[id]/edit", "page");
}
