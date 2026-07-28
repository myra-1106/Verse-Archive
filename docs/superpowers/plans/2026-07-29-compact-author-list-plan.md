# Compact Author List Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将全部作者页改为紧凑横向作者列表，同时保持首页卡片不变。

**Architecture:** 新增独立 `CompactAuthorCard`，复用现有作者数据结构；仅在 `/authors` 页面替换组件。

**Tech Stack:** Next.js、React、TypeScript、Tailwind CSS

## Global Constraints

- 不修改首页作者卡片。
- 横向卡片全宽、低高度、整卡可点击。
- 头像完整显示，简介最多两行。

---

### Task 1: 紧凑作者卡

**Files:**
- Create: `src/components/compact-author-card.tsx`
- Create: `tests/unit/compact-author-card.test.tsx`
- Modify: `src/app/(public)/authors/page.tsx`

- [ ] 编写横向结构与跳转测试并确认失败。
- [ ] 实现紧凑作者卡。
- [ ] 仅替换全部作者页组件。
- [ ] 运行测试、类型检查和生产构建。
- [ ] 推送并验证线上页面。
