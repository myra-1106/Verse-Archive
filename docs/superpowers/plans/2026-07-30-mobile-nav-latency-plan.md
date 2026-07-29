# Mobile Navigation Latency Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the mobile bottom navigation react immediately and reduce first-navigation waiting time.

**Architecture:** Keep the existing Next.js `Link` navigation and visual styles. Add route prefetching and a temporary optimistic active state inside the existing mobile navigation component, then verify the three navigation paths in production.

**Tech Stack:** Next.js App Router, React, TypeScript, CSS.

## Global Constraints

- Do not change the current black, white and gray design.
- Preserve current-route scroll-to-top behavior, animations and accessibility state.
- Do not change other pages.

---

### Task 1: Optimize mobile navigation

**Files:**
- Modify: `src/components/mobile-nav.tsx`
- Test: `tests/unit/mobile-nav.test.tsx`

**Interfaces:**
- Consumes: Next.js `usePathname`, `useRouter`, and existing route definitions.
- Produces: preloaded routes and immediate optimistic selected state.

- [ ] Add a test that verifies all target routes are prefetched and a pressed destination becomes selected immediately.
- [ ] Run the targeted test once.
- [ ] Add mount and pointer-down prefetching, optimistic selection, and duplicate-navigation protection.
- [ ] Run the targeted test once.
- [ ] Verify homepage, collection, settings and current-item scroll-to-top in a mobile production viewport.
- [ ] Commit and deploy.
