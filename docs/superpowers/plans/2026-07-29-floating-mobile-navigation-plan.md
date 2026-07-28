# Floating Mobile Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将手机底部导航改为黑白灰实色悬浮导航，并保留全部路径、选中和回顶交互。

**Architecture:** `MobileNav` 改为客户端组件，通过 `usePathname` 计算当前项；当前项重复点击时阻止导航并调用平滑回顶。动画和主题颜色使用组件类名与全局 CSS 变量，不引入依赖。

**Tech Stack:** Next.js、React、TypeScript、Tailwind CSS

## Global Constraints

- 只修改底部导航及其测试和样式。
- 背景完全不透明，不使用毛玻璃、背景模糊或 `backdrop-filter`。
- 三个入口固定为首页、合集、我的。
- 适配安全区，动画短且不阻塞点击。

---

### Task 1: 导航行为测试

**Files:**
- Create: `tests/unit/mobile-nav.test.tsx`
- Modify: `src/components/mobile-nav.tsx`

- [ ] 测试三个入口、路径选中和当前项重复点击回顶。
- [ ] 运行测试确认现有组件失败。
- [ ] 实现路径匹配和回顶逻辑。

### Task 2: 实色悬浮视觉与动画

**Files:**
- Modify: `src/components/mobile-nav.tsx`
- Modify: `src/app/globals.css`

- [ ] 添加图标、实色选中块、悬浮间距、安全区和短动画。
- [ ] 确认无透明背景、模糊或 `backdrop-filter`。
- [ ] 运行目标测试、类型检查和生产构建。
- [ ] 推送并验证线上导航。
