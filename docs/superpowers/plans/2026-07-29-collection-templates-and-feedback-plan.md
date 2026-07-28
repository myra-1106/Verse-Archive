# Verse Archive 合集、模板与操作反馈改版 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在保留现有数据和权限的前提下，交付可配置环境、作者私有模板、紧凑合集与详情页、无限预览图直传和统一操作反馈。

**Architecture:** PostgreSQL/Prisma 保存环境、模板、分类和图片顺序；Server Actions 负责授权后的业务写入；预览图通过受控上传令牌直传 Vercel Blob；前台查询拆分为摘要与详情两种数据形态。

**Tech Stack:** Next.js 15、TypeScript、React 19、Tailwind CSS、Prisma、PostgreSQL、Auth.js、Vercel Blob、Zod、Vitest。

## Global Constraints

- 不删除或覆盖现有作者、作品、图片和账号数据。
- 后台导航只有作品管理、作者管理、模板管理、返回前台。
- 模板按作者账号隔离。
- 单个作品预览图总量与单次选择数量不限。
- 完整展示图片必须保持比例，不裁剪、不拉伸。
- 手机端优先。
- 每完成一个完整功能后只执行一次必要测试；阶段完成执行一次 `next build`。

---

### Task 1: 数据模型与兼容迁移

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20260729_collection_templates/migration.sql`
- Modify: `tests/unit/schema-contract.test.ts`

**Interfaces:**
- Produces: `Environment`、`WorkEnvironment`、`AuthorTemplate`、`TemplateEnvironment` 模型；`Work.usageRequirements`、`Work.acquisitionMethod`、`Work.contactDetails`、`Work.featured` 字段。

- [ ] 编写 schema contract 失败测试，检查环境关系、模板归属、模板排序和新增作品字段。
- [ ] 运行该测试并确认因字段不存在而失败。
- [ ] 更新 Prisma schema。
- [ ] 编写兼容迁移：创建 LAB/WCGlass 环境、迁移现有布尔支持字段、为未分类作品创建作者级“其他作品”并关联。
- [ ] 生成 Prisma Client，运行 schema contract 测试。
- [ ] 提交数据模型。

### Task 2: 环境、分类与模板服务端权限

**Files:**
- Create: `src/lib/validation/template.ts`
- Create: `src/server/template-actions.ts`
- Create: `src/server/environment-actions.ts`
- Modify: `src/server/author-actions.ts`
- Modify: `src/server/work-actions.ts`
- Test: `tests/unit/template-validation.test.ts`
- Test: `tests/unit/permissions.test.ts`

**Interfaces:**
- Produces: `createTemplate`、`updateTemplate`、`copyTemplate`、`deleteTemplate`、`moveTemplate`、`createEnvironment`。
- Consumes: `requireAuthorAccess(authorId)` 和当前账号的 `author.id`。

- [ ] 编写模板字段与作者隔离验证测试。
- [ ] 实现模板 Zod schema。
- [ ] 实现模板 CRUD、复制和排序；所有查询和写入带 `authorId` 条件。
- [ ] 实现环境新增并去重。
- [ ] 将分类设为作品必填；有作品的分类禁止删除；增加分类重命名。
- [ ] 更新作品写入以保存环境关系和新增说明字段。
- [ ] 运行相关单元测试并提交。

### Task 3: 统一操作状态与固定后台导航

**Files:**
- Create: `src/components/action-button.tsx`
- Create: `src/components/action-toast.tsx`
- Create: `src/components/pending-link.tsx`
- Modify: `src/components/admin/sidebar.tsx`
- Modify: `src/app/admin/layout.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Produces: 可复用的 pending/success/error 按钮、Toast 和跳转状态。

- [ ] 编写 ActionButton 渲染和防重复提交测试。
- [ ] 使用 `useFormStatus` 实现处理中禁用与状态文字。
- [ ] 增加页面级成功/失败反馈容器。
- [ ] 后台导航固定为作品管理、作者管理、模板管理、返回前台。
- [ ] 为导航和操作链接增加跳转中反馈。
- [ ] 运行组件测试并提交。

### Task 4: 作者私有模板后台

**Files:**
- Create: `src/app/admin/templates/page.tsx`
- Create: `src/app/admin/templates/new/page.tsx`
- Create: `src/app/admin/templates/[id]/edit/page.tsx`
- Create: `src/components/admin/template-form.tsx`
- Create: `src/components/admin/template-list.tsx`
- Modify: `src/components/admin/work-form.tsx`
- Modify: `src/app/admin/works/new/page.tsx`
- Modify: `src/app/admin/works/[id]/edit/page.tsx`

**Interfaces:**
- 模板表单读写 Task 2 的模板动作。
- 作品表单接收 `templates` 和 `environments`，套用时只更新本地输入值。

- [ ] 建立仅查询当前作者模板的列表页。
- [ ] 实现新增、编辑、复制、删除和上下移动。
- [ ] 作品表单加入手动填写/套用模板选择。
- [ ] 套用模板复制字段与环境选择，不提交模板 ID，不修改原模板。
- [ ] 加入已有环境多选和新环境输入。
- [ ] 为所有动作接入统一状态反馈。
- [ ] 运行模板隔离和表单测试并提交。

### Task 5: 无限预览图直传与排序

**Files:**
- Create: `src/app/api/uploads/token/route.ts`
- Create: `src/server/asset-actions.ts`
- Modify: `src/lib/client-image.ts`
- Modify: `src/components/admin/work-images.tsx`
- Modify: `src/server/upload-actions.ts`
- Test: `tests/unit/client-image.test.ts`

**Interfaces:**
- 浏览器调用 Vercel Blob client upload。
- 上传完成后调用 `attachWorkPreviewAsset({ workId, blob, sortOrder })` 保存 Asset 与 WorkImage。

- [ ] 为 HEIC 转换、任意数量文件队列和顺序保持编写测试。
- [ ] 实现受登录和作者权限保护的 Blob 客户端上传令牌。
- [ ] 以有限并发处理用户选择的全部文件，不限制总数和单次选择数。
- [ ] 每张图片展示等待、转换、上传、成功或失败状态。
- [ ] 成功项立即写入数据库，失败项支持单独重试。
- [ ] 保留继续追加、删除、上移和下移，排序持久化。
- [ ] 主图、作者头像、合集封面和二维码接入明确上传状态。
- [ ] 运行上传测试并提交。

### Task 6: 首页和作者合集卡片

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/server/public-queries.ts`
- Modify: `src/components/author-card.tsx`
- Test: `tests/unit/author-card.test.tsx`

**Interfaces:**
- `getAuthors()` 返回头像、封面、作者名、作品数量。
- `AuthorCard` 整卡链接且保留“进入合集”按钮。

- [ ] 更新测试，要求头像、名称、数量、按钮和整卡链接存在。
- [ ] 删除首页精选作者模块及专用查询逻辑。
- [ ] 保留作者合集入口和最新作品。
- [ ] 封面固定区域使用模糊浅色背景与前景 `object-contain`。
- [ ] 运行作者卡片测试并提交。

### Task 7: 紧凑作品卡、分类页与作品详情

**Files:**
- Create: `src/components/compact-work-card.tsx`
- Create: `src/app/(public)/authors/[slug]/categories/[categoryId]/page.tsx`
- Create: `src/app/(public)/works/[slug]/page.tsx`
- Modify: `src/app/(public)/authors/[slug]/page.tsx`
- Modify: `src/server/public-queries.ts`
- Modify: `src/components/contact-author.tsx`
- Modify: `src/components/work-card.tsx`
- Test: `tests/unit/compact-work-card.test.tsx`

**Interfaces:**
- `getAuthorCollection` 每类返回精选优先并由最新补足的 1～3 个摘要。
- `getAuthorCategory` 返回分类全部作品。
- `getWorkDetail` 返回详情字段和全部排序预览图。

- [ ] 编写紧凑卡片字段与微信复制入口测试。
- [ ] 实现紧凑横向卡：完整主图、名称、环境、两种价格、详情按钮、复制微信。
- [ ] 合集页按手动分类顺序展示 1～3 个精选或最新作品。
- [ ] 隐藏空分类并增加“查看更多”。
- [ ] 实现分类全部作品页，发布时间倒序。
- [ ] 实现作品详情页并将完整说明和全部预览图移入详情。
- [ ] 全部完整图片改用 `object-contain`。
- [ ] 运行前台组件与查询测试并提交。

### Task 8: 数据迁移、全链路验证与部署

**Files:**
- Modify only files required by verification failures.

- [ ] 在本地数据库应用迁移并核对作者、作品、分类和图片数量。
- [ ] 运行一次必要测试；如确认 Vitest/jsdom 环境兼容问题，记录并停止重试。
- [ ] 执行一次 `pnpm build`。
- [ ] 将迁移应用到生产数据库。
- [ ] 推送 `main`，等待 Vercel Production Ready。
- [ ] 检查游客端：首页、作者列表、合集、分类、详情与复制。
- [ ] 检查作者端：模板隔离、环境新增、分类必选、上传追加和排序。
- [ ] 检查管理员端：固定导航、跨作者管理和权限。
- [ ] 检查 Vercel 运行日志无新增服务端错误。

