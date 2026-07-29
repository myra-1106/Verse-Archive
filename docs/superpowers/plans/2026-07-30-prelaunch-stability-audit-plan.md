# Prelaunch Stability Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 完成 Verse Archive 正式上线前的全站稳定性验收，并修复所有可复现的核心缺陷。

**Architecture:** 先建立可重复的自动化基线，再按模板/作品、上传、权限、错误处理和浏览器回归分批修复。所有数据变更测试使用专用 QA 记录；生产验证只执行可恢复操作。

**Tech Stack:** Next.js 15、React 19、TypeScript、Prisma、PostgreSQL、Auth.js/NextAuth、Vercel Blob、Vitest、Playwright

## Global Constraints

- 不新增业务功能，不删除现有功能。
- 不修改真实作者现有内容。
- 不修改 OpenAI、ChatGPT、Codex、API Key、代理或 `~/.codex` 配置。
- 每个缺陷先复现并记录根因，再做最小修复。
- 完整测试只在功能批次完成后执行一次，已确认的本地环境兼容问题不重复循环。

---

### Task 1: 基线与模板保存失败

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `src/lib/work-field-order.ts`
- Create: `src/components/admin/field-order-editor.tsx`
- Modify: `src/server/template-actions.ts`
- Modify: `src/server/work-actions.ts`
- Modify: `src/components/admin/work-form.tsx`
- Modify: `src/components/work-card.tsx`
- Test: `tests/unit/template-work-flow.test.ts`

- [ ] 建立当前测试、类型和构建基线。
- [ ] 用模板只填写部分字段、无环境和空价格复现作品保存失败。
- [ ] 模板除名称外全部选填，作品卡片空字段可正常保存并自动隐藏。
- [ ] 套用模板只覆盖已填写字段，不清空作品表单已有内容。
- [ ] 模板和作品分别保存字段显示顺序；套用时复制，之后互不影响。
- [ ] 将字段错误返回到表单而不是抛出未处理异常。
- [ ] 验证套用模板、保存、刷新和重新打开。

### Task 2: 服务端动作、权限与数据库

**Files:**
- Modify only affected files under `src/server/`, `src/lib/validation/`, `prisma/`.
- Test: add focused permission and action tests under `tests/unit/`.

- [ ] 审计所有服务端动作的身份、作者归属、记录存在和输入验证。
- [ ] 覆盖作者隔离、管理员权限、无效 ID、重复记录和删除约束。
- [ ] 检查 Prisma 关系、唯一约束和迁移兼容。
- [ ] 修复越权、未捕获异常和数据丢失风险。

### Task 3: 上传、图片和资源释放

**Files:**
- Modify only affected upload and image files.
- Test: extend storage and client-image tests.

- [ ] 验证头像、封面、二维码、主图和多预览图。
- [ ] 覆盖类型伪造、超大文件、HEIC 转换、网络失败和部分上传失败。
- [ ] 验证追加、排序、删除和刷新持久化。
- [ ] 确保对象 URL、Canvas 和图片临时资源及时释放。

### Task 4: 全局错误与表单保护

**Files:**
- Create: scoped error boundary files only where required.
- Modify: form components and shared feedback components.
- Test: add focused component tests.

- [ ] 为用户操作建立统一的可理解错误映射。
- [ ] 补齐处理中、成功、失败和防重复提交。
- [ ] 必填项即时高亮并显示具体原因。
- [ ] 编辑表单增加脏数据离开确认，保存成功后清除。
- [ ] 验证错误不会导致页面白屏或输入丢失。

### Task 5: 页面、交互与浏览器回归

**Files:**
- Create/update Playwright tests under `tests/e2e/`.
- Modify production files only for confirmed defects.

- [ ] 游客遍历首页、作者、分类、作品、搜索、筛选、404、登录。
- [ ] 作者遍历资料、分类、模板、作品和图片完整流程。
- [ ] 管理员遍历作者、作品、账号状态和权限边界。
- [ ] 验证弹窗、复制、灯箱、底栏、刷新、返回和重新登录。
- [ ] 执行 Chromium 和 WebKit；记录 Edge/真实 Safari 限制。

### Task 6: 生产验收与交付

**Files:**
- Create: `docs/audits/2026-07-30-prelaunch-acceptance-report.md`

- [ ] 运行目标测试、类型检查和一次生产构建。
- [ ] 推送并等待 Vercel 部署。
- [ ] 检查生产错误、关键路径和专用 QA 流程。
- [ ] 清理专用 QA 数据。
- [ ] 输出问题、根因、修改文件、验证方式、已知限制和腾讯云/COS/HTTPS 迁移清单。
