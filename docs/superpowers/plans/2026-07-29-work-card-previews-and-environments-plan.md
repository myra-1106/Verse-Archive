# Work Card Previews and Environments Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 保留六个默认环境，并让紧凑横向作品卡在主图决定的高度内显示完整信息和可滑动预览图。

**Architecture:** 扩展现有默认环境初始化函数，通过幂等 upsert 保留默认项。紧凑作品卡读取图片固有尺寸作为 CSS aspect-ratio，外层整卡跳转，右侧采用受限网格和内部横向预览带。

**Tech Stack:** Next.js 15、React 19、TypeScript、Tailwind CSS、Prisma、PostgreSQL

## Global Constraints

- 默认环境名称和顺序固定为 LAB、WCGlass、XOS、白衣、主题盒子、气泡盒子。
- 图片使用 `object-fit: contain`，禁止裁剪和拉伸。
- 卡片高度只由主图比例决定，右侧内容不得撑高卡片。
- 预览图仍在同一卡片右侧显示并可横向滑动。
- 整张卡片点击进入详情，预览图点击放大且不触发跳转。

---

### Task 1: 默认环境初始化

**Files:**
- Modify: `src/server/environments.ts`
- Test: `tests/unit/default-environments.test.ts`

**Interfaces:**
- Produces: `DEFAULT_ENVIRONMENTS` 常量及 `ensureDefaultEnvironments()` 幂等初始化。

- [ ] 编写默认环境顺序契约测试。
- [ ] 扩展幂等 upsert 到六个环境，保留现有作品关系迁移。
- [ ] 运行目标测试并提交。

### Task 2: 公共作品图片尺寸

**Files:**
- Modify: `src/server/public-queries.ts`
- Modify: `src/components/work-card.tsx`

**Interfaces:**
- Produces: `PublicWork.mainImageWidth`、`mainImageHeight`，供卡片比例计算。

- [ ] 把主图数据库宽高映射到公共作品 DTO。
- [ ] 保留演示数据和无主图回退。
- [ ] 运行类型检查。

### Task 3: 紧凑卡片重新布局

**Files:**
- Modify: `src/components/work-card.tsx`
- Test: `tests/unit/work-card.test.tsx`

**Interfaces:**
- Consumes: `PublicWork` 主图尺寸和预览图数组。
- Produces: 整卡跳转、右侧受限信息区和内部横向预览带。

- [ ] 添加整卡跳转和预览图仍显示的组件测试。
- [ ] 用主图 `aspect-ratio` 决定卡片高度，右侧使用 `min-h-0` 和受限网格。
- [ ] 预览图按钮阻止跳转并打开现有灯箱。
- [ ] 运行目标测试、类型检查和一次构建。

### Task 4: 部署验证

**Files:**
- Modify only if verification finds a scoped defect.

- [ ] 推送 GitHub main。
- [ ] 等待 Vercel 自动部署。
- [ ] 检查首页、全部作品、作者合集、详情页、后台发布表单和环境筛选。
