# 精简功能 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 完成公开搜索筛选、作品图片灯箱、作者专属账号流程和微信笔记智能填表。

**Architecture:** 搜索状态保存在 URL 并由服务端 Prisma 查询；灯箱和智能填表使用小型客户端组件；作者权限继续复用现有服务端归属校验。笔记识别只使用本地规则，不接入第三方服务。

**Tech Stack:** Next.js App Router、TypeScript、React、Tailwind CSS、Prisma、Auth.js、Zod、Vitest

## Global Constraints

- 不做收藏、关注、通知、统计、操作日志或版本更新日志。
- 不提供普通用户作者申请。
- 不接入新的第三方服务。
- 作者只能管理自己绑定的合集。
- 图片仍由作者手动上传。
- 每项改动保持最小且匹配现有项目风格。

---

### Task 1: 搜索与筛选

**Files:**
- Modify: `src/server/public-queries.ts`
- Modify: `src/app/(public)/works/page.tsx`
- Create: `src/components/work-filters.tsx`
- Test: `tests/unit/work-search.test.ts`

**Interfaces:**
- Produces: `getFilteredWorks(filters)`，返回作品及作者信息。
- Consumes: URL 参数 `q`、`author`、`category`、`environment`、`sort`。

- [ ] 写失败测试，覆盖搜索作品名、作者名和环境筛选参数规范化。
- [ ] 运行该测试并确认因过滤函数不存在而失败。
- [ ] 实现最小过滤参数解析与 Prisma 查询。
- [ ] 在全部作品页加入搜索框、作者、分类、环境和排序控件。
- [ ] 运行必要测试并确认通过。

### Task 2: 图片灯箱

**Files:**
- Create: `src/components/image-lightbox.tsx`
- Modify: `src/components/work-card.tsx`
- Test: `tests/unit/image-lightbox.test.tsx`

**Interfaces:**
- Produces: `ImageLightbox({ images, initialIndex, onClose })`。
- Consumes: 作品主图和预览图 URL、替代文本。

- [ ] 写失败测试，覆盖打开、关闭、左右切换和 Escape。
- [ ] 运行测试并确认灯箱尚不存在。
- [ ] 实现最小客户端灯箱和背景滚动锁定。
- [ ] 将作品卡图片点击行为接入灯箱。
- [ ] 运行必要测试并确认通过。

### Task 3: 作者账号流程收口

**Files:**
- Modify: `src/app/admin/authors/new/page.tsx`
- Modify: `src/server/author-actions.ts`
- Modify: `src/components/admin/sidebar.tsx`
- Modify: `src/app/(account)/settings/page.tsx`
- Test: `tests/unit/permissions.test.ts`

**Interfaces:**
- Consumes: 现有 `createAuthorWithAccount(formData)` 和 `requireAuthorAccess(authorId)`。
- Produces: 超级管理员创建作者、作者首次修改密码、作者专属后台导航。

- [ ] 补充权限测试，证明作者不能管理其他作者资源。
- [ ] 精简作者创建文案并移除所有申请入口。
- [ ] 确认初始密码强制修改流程可访问。
- [ ] 运行权限测试。

### Task 4: 微信笔记智能填表

**Files:**
- Create: `src/lib/parse-wechat-note.ts`
- Create: `src/components/admin/wechat-note-importer.tsx`
- Modify: `src/components/admin/work-form.tsx`
- Modify: `src/app/admin/works/new/page.tsx`
- Modify: `src/server/work-actions.ts`
- Test: `tests/unit/parse-wechat-note.test.ts`

**Interfaces:**
- Produces: `parseWechatNote(text): ParsedWechatNote`。
- Produces: 客户端识别器将结果填入作品表单。
- Consumes: 作者粘贴的纯文本。

- [ ] 写失败测试，覆盖名称、两种价格、环境和多段说明。
- [ ] 运行测试并确认解析器不存在。
- [ ] 实现按字段标题和人民币金额识别的纯函数。
- [ ] 将新建作品表单改为客户端可填充表单，并保留手动修改。
- [ ] 保存按钮支持“保存草稿”和“直接发布”，发布仍执行服务端归属校验。
- [ ] 运行解析测试、一次 `next build`；若确认是既有 Node/jsdom 环境问题则记录并停止重试。
