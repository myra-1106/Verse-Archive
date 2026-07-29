# Author Work Fields Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add per-author removable/restorable work form fields, preserve line breaks, separate deleted works, and remove WeChat note import.

**Architecture:** Store hidden optional field keys on `Author`, update them through an author-scoped server action, and render only active fields in `WorkForm`. Preserve hidden values during work updates. Keep existing public work data independent from author form preferences.

**Tech Stack:** Next.js App Router, React, TypeScript, Prisma, PostgreSQL, Tailwind CSS.

## Global Constraints

- Existing work content must never be erased by hiding a form field.
- Author settings must be isolated by author ID and protected by existing author access checks.
- Do not change unrelated pages or visual styles.

---

### Task 1: Persist and manage author fields

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `src/lib/author-work-fields.ts`
- Create: `src/server/author-work-field-actions.ts`
- Test: `tests/unit/author-work-fields.test.ts`

- [ ] Define allowed optional fields and normalization.
- [ ] Store hidden fields per author.
- [ ] Add permission-protected hide/show actions.

### Task 2: Update work forms safely

**Files:**
- Modify: `src/components/admin/work-form.tsx`
- Modify: `src/app/admin/works/new/page.tsx`
- Modify: `src/app/admin/works/[id]/edit/page.tsx`
- Modify: `src/server/work-actions.ts`

- [ ] Render only active fields with remove buttons and an add-back area.
- [ ] Preserve hidden values when editing an existing work.
- [ ] Replace field order arrows with a long-press vertical drag handle.
- [ ] Remove the WeChat note importer and unused implementation.

### Task 3: Update lists and public formatting

**Files:**
- Modify: `src/app/admin/works/page.tsx`
- Modify: `src/components/work-card.tsx`

- [ ] Separate deleted works from the default list.
- [ ] Preserve author-entered line breaks in all work card text.
- [ ] Build once in Vercel and verify author isolation, form behavior, public text, and deleted list.
