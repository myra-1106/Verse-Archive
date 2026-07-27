# 多作者作品合集网站第一阶段实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 交付一个可本地运行的第一阶段网站，管理员与作者可以管理内容，游客可以浏览首页、作者合集和完整作品胶囊卡并联系作者。

**Architecture:** 前台、后台、认证和接口位于同一个 Next.js App Router 项目中。PostgreSQL 保存账号与内容，Prisma 负责数据库访问；服务端操作统一执行 Zod 校验、会话检查和资源归属检查。首期图片使用本地存储适配器，业务层只依赖最小的 `ImageStorage` 接口，以便部署时替换为腾讯云 COS。

**Tech Stack:** Next.js 15.5.22、React 19.1.9、TypeScript、Tailwind CSS 4、PostgreSQL、Prisma 6.19.3、Auth.js 4.24.15、Argon2、Zod 4、Vitest、Testing Library、Playwright

## Global Constraints

- 手机端优先，同时适配桌面端。
- 视觉简单、清楚、克制，以作品预览图为主体。
- 自动适配浅色和深色模式。
- 不提供支付、订单、购买验证、文件下载、关注作者或通知功能。
- 每位作者只能绑定一个用户账号，不设协作者。
- 每件作品只属于一个作者自定义分类；未分类作品显示在“其他作品”。
- 作者只能修改自己绑定作者的资料、分类和作品。
- 微信 ID 仅本人和管理员可见；作者公开购买微信 ID 除外。
- 密码只保存 Argon2id 哈希。
- 说明文本不接受任意 HTML。
- 所有删除均为可恢复的软删除。
- 不做与第一阶段目标无关的抽象、重构或功能。

---

## 文件职责

```text
prisma/schema.prisma               数据表、枚举、索引与约束
prisma/seed.ts                     可重复执行的演示管理员、作者和作品
src/auth.ts                        Auth.js 配置与 Credentials 验证
src/middleware.ts                  登录页和后台入口保护
src/lib/db.ts                      Prisma 单例
src/lib/permissions.ts             纯函数角色与作者归属判断
src/lib/storage.ts                 本地图片存储的最小接口
src/lib/validation/*.ts            用户、作者、分类、作品表单 Schema
src/server/auth-actions.ts         注册、登录辅助与密码修改
src/server/author-actions.ts       作者资料和分类写操作
src/server/work-actions.ts         作品、版本和状态写操作
src/server/upload-actions.ts       图片校验与保存
src/components/author-card.tsx     首页作者入口卡
src/components/work-card.tsx       完整作品胶囊卡
src/components/contact-author.tsx  微信 ID 复制与二维码弹层
src/components/admin/*             简单后台表单和列表
src/app/(public)/*                 公开页面
src/app/(auth)/*                   登录注册页面
src/app/admin/*                    管理员与作者后台
tests/unit/*                       校验、权限和展示逻辑测试
tests/e2e/*                        关键浏览与权限流程
```

## Task 1：项目骨架与可运行基线

**Files:**
- Create: `package.json`
- Create: `pnpm-lock.yaml`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `postcss.config.mjs`
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`
- Create: `compose.yaml`
- Create: `.env.example`
- Create: `src/app/layout.tsx`
- Create: `src/app/globals.css`
- Create: `src/app/page.tsx`
- Create: `tests/unit/smoke.test.ts`

**Interfaces:**
- Produces: 可执行的 `pnpm dev`、`pnpm test`、`pnpm typecheck`、`pnpm build` 命令。

- [ ] **Step 1: 使用固定版本初始化 Next.js 项目**

在临时目录运行创建器，再把生成文件精准移动到仓库根目录，不能覆盖现有 `.gitignore`、`docs` 或 `.git`：

```bash
pnpm dlx create-next-app@15.5.22 scaffold --ts --tailwind --eslint --app --src-dir --use-pnpm --import-alias '@/*'
```

依赖固定为：

```json
{
  "dependencies": {
    "@auth/prisma-adapter": "2.11.1",
    "@prisma/client": "6.19.3",
    "argon2": "0.45.1",
    "next": "15.5.22",
    "next-auth": "4.24.15",
    "react": "19.1.9",
    "react-dom": "19.1.9",
    "zod": "4.4.3"
  },
  "devDependencies": {
    "@playwright/test": "1.62.0",
    "@testing-library/jest-dom": "6.9.1",
    "@testing-library/react": "16.3.2",
    "@types/node": "24.10.1",
    "@types/react": "19.2.2",
    "@types/react-dom": "19.2.2",
    "eslint": "9.39.1",
    "eslint-config-next": "15.5.22",
    "jsdom": "27.2.0",
    "prisma": "6.19.3",
    "tailwindcss": "4.3.3",
    "typescript": "5.9.3",
    "vitest": "4.1.10"
  }
}
```

- [ ] **Step 2: 先写冒烟测试**

```ts
// tests/unit/smoke.test.ts
import { describe, expect, it } from "vitest";

describe("project baseline", () => {
  it("runs the test suite", () => {
    expect(true).toBe(true);
  });
});
```

- [ ] **Step 3: 配置测试和开发数据库**

`compose.yaml` 只提供一个 PostgreSQL 16 服务，数据库名、用户和密码均为 `collection`，端口映射为 `5432:5432`。`.env.example` 包含：

```dotenv
DATABASE_URL="postgresql://collection:collection@localhost:5432/collection?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-at-least-32-random-characters"
LOCAL_UPLOAD_DIR="public/uploads"
```

- [ ] **Step 4: 建立最小页面和主题变量**

`src/app/page.tsx` 只渲染标题“作者作品合集”和说明“发现作者与她们的作品”；`globals.css` 定义浅色和 `prefers-color-scheme: dark` 两组黑、白、灰、浅紫变量，不增加动画。

- [ ] **Step 5: 运行基线验证**

Run:

```bash
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

Expected: 四条命令全部退出码为 0，测试输出包含 `1 passed`。

- [ ] **Step 6: 提交**

```bash
git add package.json pnpm-lock.yaml next.config.ts tsconfig.json postcss.config.mjs vitest.config.ts playwright.config.ts compose.yaml .env.example src tests
git commit -m "chore: scaffold collection website"
```

## Task 2：数据库模型、迁移与种子数据

**Files:**
- Create: `prisma/schema.prisma`
- Create: `prisma/seed.ts`
- Create: `src/lib/db.ts`
- Create: `tests/unit/schema-contract.test.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `prisma.user`、`prisma.author`、`prisma.authorCategory`、`prisma.work`、`prisma.workImage`、`prisma.workVersion`、`prisma.asset` 数据访问接口。
- Produces: `UserRole = USER | AUTHOR | CONTENT_ADMIN | SUPER_ADMIN`。
- Produces: `WorkStatus = DRAFT | PUBLISHED | OFF_SHELF | DELETED`。

- [ ] **Step 1: 写数据库约束测试**

`tests/unit/schema-contract.test.ts` 读取 `prisma/schema.prisma`，断言存在：

```ts
expect(schema).toContain("wechatId       String     @unique");
expect(schema).toContain("accountUserId  String?    @unique");
expect(schema).toContain("@@unique([userId, workId])");
expect(schema).toContain("authorCategoryId String?");
expect(schema).toContain("displayOrder     Int        @default(0)");
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm vitest run tests/unit/schema-contract.test.ts`

Expected: FAIL，原因是 `prisma/schema.prisma` 不存在。

- [ ] **Step 3: 实现 Prisma Schema**

创建以下模型及关系：

```text
User 1---0..1 Author(accountUser)
Author 1---* AuthorCategory
Author 1---* Work
AuthorCategory 1---* Work (optional)
Work 1---* WorkImage
Work 1---* WorkVersion
User *---* Work through Favorite
Asset referenced by User/Author/Work/WorkImage
```

`Work` 包含 `directPriceCents`、`repostPriceCents`、`supportsLab`、`supportsWcglass`、三个说明文本、`viewCount`、`favoriteCount`、`contactClickCount`、`publishedAt` 和 `deletedAt`。金额字段使用非负整数，由应用层校验。

- [ ] **Step 4: 生成迁移并验证约束测试**

Run:

```bash
docker compose up -d db
pnpm prisma migrate dev --name init
pnpm vitest run tests/unit/schema-contract.test.ts
```

Expected: 迁移成功，约束测试 PASS。

- [ ] **Step 5: 创建可重复执行的种子数据**

`prisma/seed.ts` 使用 `upsert` 创建：

- 一个超级管理员账号 `admin_demo`，开发密码 `ChangeMe123!` 的 Argon2id 哈希。
- 两位演示作者“南枝”和“山茶”。
- 每位作者的“卡片”“主题”分类。
- 至少三件已发布作品，默认同时支持 LAB 和 WCGlass。

运行 seed 时明确打印开发账号，且 README 提醒生产环境禁止执行演示 seed。

- [ ] **Step 6: 验证数据库与提交**

Run:

```bash
pnpm prisma validate
pnpm prisma migrate reset --force
pnpm prisma db seed
pnpm test
```

Expected: Schema 有效、迁移可从空库执行、seed 可连续执行两次、测试全绿。

```bash
git add prisma src/lib/db.ts tests/unit/schema-contract.test.ts package.json pnpm-lock.yaml
git commit -m "feat: add collection data model"
```

## Task 3：账号注册登录与会话撤销

**Files:**
- Create: `src/auth.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`
- Create: `src/lib/validation/auth.ts`
- Create: `src/server/auth-actions.ts`
- Create: `src/app/(auth)/login/page.tsx`
- Create: `src/app/(auth)/register/page.tsx`
- Create: `src/components/auth/login-form.tsx`
- Create: `src/components/auth/register-form.tsx`
- Create: `tests/unit/auth-validation.test.ts`
- Create: `tests/integration/register.test.ts`

**Interfaces:**
- Produces: `authOptions: NextAuthOptions`。
- Produces: `register(input: RegisterInput): Promise<ActionResult>`。
- Produces: 会话字段 `user.id`、`user.role`、`user.sessionVersion`。

- [ ] **Step 1: 写注册校验失败测试**

测试以下输入必须失败：少于 2 个字符的微信 ID、少于 8 个字符或不同时含字母和数字的密码、空昵称。合法输入：

```ts
const valid = {
  wechatId: "myra_2026",
  displayName: "小孟",
  password: "Collection123!",
};
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm vitest run tests/unit/auth-validation.test.ts`

Expected: FAIL，模块 `@/lib/validation/auth` 不存在。

- [ ] **Step 3: 实现校验与注册**

`registerSchema` 对微信 ID 执行 `trim()`、长度 2–32、字符集 `[A-Za-z0-9_-]`；昵称 1–30；密码 8–72 且含字母与数字。`register` 在服务端再次校验、检查唯一微信 ID、使用 `argon2.hash(..., { type: argon2.argon2id })`，创建 `USER`。

- [ ] **Step 4: 实现 Auth.js Credentials**

`authorize` 仅按微信 ID 查询活跃用户，使用 `argon2.verify` 比较哈希。JWT 写入 `id`、`role`、`sessionVersion`；session callback 暴露同名非敏感字段。每次需要高权限的服务端操作仍重新查询用户状态和版本。

- [ ] **Step 5: 实现登录与注册页面**

页面使用原生表单和明确错误文案。密码字段不得回显。登录成功跳转首页；注册成功跳转登录页。页面不提供邮箱或短信找回入口，显示“忘记密码请联系管理员”。

- [ ] **Step 6: 验证并提交**

Run:

```bash
pnpm vitest run tests/unit/auth-validation.test.ts tests/integration/register.test.ts
pnpm typecheck
pnpm build
```

Expected: 非法注册被拒绝，重复微信 ID 返回明确错误，数据库密码值以 `$argon2id$` 开头，构建成功。

```bash
git add src/auth.ts src/app/api src/app/'(auth)' src/components/auth src/lib/validation/auth.ts src/server/auth-actions.ts tests
git commit -m "feat: add secure account authentication"
```

## Task 4：权限边界与后台外壳

**Files:**
- Create: `src/lib/permissions.ts`
- Create: `src/server/current-user.ts`
- Create: `src/middleware.ts`
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/admin/page.tsx`
- Create: `src/components/admin/sidebar.tsx`
- Create: `tests/unit/permissions.test.ts`

**Interfaces:**
- Produces: `requireUser()`、`requireRole(roles)`、`requireAuthorAccess(authorId)`。
- Produces: `canManageAuthor(actor, author): boolean` 和 `canManageWork(actor, work): boolean` 纯函数。

- [ ] **Step 1: 写权限矩阵测试**

至少覆盖：普通用户不能编辑作者；作者能编辑绑定作者；作者不能编辑其他作者；内容管理员能编辑任意作者和作品；只有超级管理员能管理账号和恢复删除内容；停用账号一律拒绝。

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm vitest run tests/unit/permissions.test.ts`

Expected: FAIL，权限模块不存在。

- [ ] **Step 3: 实现最小权限函数**

权限函数只接受当前用户的 `id/role/status` 与资源的 `accountUserId/authorId`，返回布尔值；抛出未登录或禁止访问错误的逻辑只放在 `current-user.ts`。

- [ ] **Step 4: 建立后台外壳**

作者看到“作者资料、分类、作品”；内容管理员增加“全部作者、全部作品”；超级管理员再增加“账号、删除恢复”。中间件只负责要求登录，具体资源权限仍由页面和 Server Action 校验。

- [ ] **Step 5: 验证并提交**

Run: `pnpm vitest run tests/unit/permissions.test.ts && pnpm typecheck && pnpm build`

Expected: 权限矩阵全绿，未登录访问 `/admin` 跳转 `/login`。

```bash
git add src/lib/permissions.ts src/server/current-user.ts src/middleware.ts src/app/admin src/components/admin tests/unit/permissions.test.ts
git commit -m "feat: enforce admin resource permissions"
```

## Task 5：作者资料与自定义分类管理

**Files:**
- Create: `src/lib/validation/author.ts`
- Create: `src/lib/storage.ts`
- Create: `src/server/author-actions.ts`
- Create: `src/server/upload-actions.ts`
- Create: `src/app/admin/author/page.tsx`
- Create: `src/app/admin/author/categories/page.tsx`
- Create: `src/app/admin/authors/page.tsx`
- Create: `src/app/admin/authors/new/page.tsx`
- Create: `src/app/admin/authors/[id]/edit/page.tsx`
- Create: `src/components/admin/author-form.tsx`
- Create: `src/components/admin/category-list.tsx`
- Create: `tests/unit/author-validation.test.ts`
- Create: `tests/unit/storage.test.ts`
- Create: `tests/integration/author-actions.test.ts`

**Interfaces:**
- Produces: `updateAuthorProfile(input)`。
- Produces: `createAuthorWithAccount(input)`、`setAuthorAccountStatus(input)`。
- Produces: `createCategory(input)`、`renameCategory(input)`、`reorderCategories(ids)`、`deleteCategory(id)`。
- Produces: `ImageStorage.save(file): Promise<{ key, mimeType, width, height, sizeBytes }>`。

- [ ] **Step 1: 写分类行为测试**

测试分类名 1–20 字、同一作者分类名不可重复、作者不能操作其他作者分类、删除分类后作品的 `authorCategoryId` 变为 `null`、排序只接受当前作者全部有效分类 ID。

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm vitest run tests/unit/author-validation.test.ts tests/integration/author-actions.test.ts`

Expected: FAIL，作者操作尚不存在。

- [ ] **Step 3: 实现作者资料与管理员创建账号操作**

允许作者修改名称、简介、公开微信 ID、SEO 标题和描述。作者 ID 必须由当前账号绑定关系得到，不能信任表单提交的作者 ID。内容管理员和超级管理员可显式指定作者。只有超级管理员可以在同一数据库事务中创建作者、创建带 Argon2id 初始密码的作者账号并完成唯一绑定；初始账号首次登录后必须修改密码。超级管理员可停用或恢复作者账号，停用后旧会话立即失效。

- [ ] **Step 4: 实现分类 CRUD 与排序**

删除分类和将所属作品设为未分类必须在同一 Prisma 事务中完成。排序按提交数组依次写入 `displayOrder = index`。

- [ ] **Step 5: 实现图片存储、后台页面和作者图片字段**

先写图片校验测试，再实现本地 `ImageStorage`：只接受 JPEG、PNG、WebP 和 AVIF，单图最大 10 MiB，读取真实 MIME 和尺寸后保存；UUID 文件名写入 `public/uploads/YYYY/MM/`。分类管理使用上移、下移按钮作为可访问的基础交互；拖动排序可在不改变服务端接口的情况下后续增强。空分类允许保留并显示作品数 0。作者表单通过该上传接口保存头像、代表图和二维码。内容管理员可查看全部作者，超级管理员额外看到创建作者账号与启停入口。

- [ ] **Step 6: 验证并提交**

Run: `pnpm vitest run tests/unit/author-validation.test.ts tests/unit/storage.test.ts tests/integration/author-actions.test.ts && pnpm build`

Expected: 删除分类不删除作品，跨作者请求返回禁止访问，构建成功。

```bash
git add src/lib/validation/author.ts src/lib/storage.ts src/server/author-actions.ts src/server/upload-actions.ts src/app/admin/author src/app/admin/authors src/components/admin tests
git commit -m "feat: manage author profiles and categories"
```

## Task 6：作品、版本和本地图片管理

**Files:**
- Create: `src/lib/validation/work.ts`
- Modify: `src/lib/storage.ts`
- Create: `src/server/work-actions.ts`
- Modify: `src/server/upload-actions.ts`
- Create: `src/app/admin/works/page.tsx`
- Create: `src/app/admin/works/new/page.tsx`
- Create: `src/app/admin/works/[id]/edit/page.tsx`
- Create: `src/components/admin/work-form.tsx`
- Create: `src/components/admin/image-order-list.tsx`
- Create: `tests/unit/work-validation.test.ts`
- Modify: `tests/unit/storage.test.ts`
- Create: `tests/integration/work-actions.test.ts`

**Interfaces:**
- Produces: `createWork(input)`、`updateWork(input)`、`setWorkStatus(id, status)`、`restoreWork(id)`。
- Produces: `addVersion(input)`、`reorderWorkImages(workId, ids)`。
- Consumes: `ImageStorage.save(file): Promise<{ key, mimeType, width, height, sizeBytes }>`。

- [ ] **Step 1: 写作品校验和权限测试**

覆盖：名称必填且不超过 80 字；价格为 0–1,000,000 分整数；至少支持一个环境；分类必须属于作品作者；作者不能恢复删除作品；内容管理员不能永久删除；作者不能编辑其他作者作品。

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm vitest run tests/unit/work-validation.test.ts tests/integration/work-actions.test.ts`

Expected: FAIL，作品模块不存在。

- [ ] **Step 3: 实现作品与版本操作**

新作品默认 `DRAFT`。发布时要求主图、当前版本、功能说明和两个价格均存在。`OFF_SHELF` 仍可公开读取，但公开卡片不渲染购买按钮。`DELETED` 默认不出现在任何公开查询中，只有超级管理员可恢复。

- [ ] **Step 4: 扩展图片测试并接入作品图片**

扩展 Task 5 的图片测试，验证主图替换、预览图批量上传、删除和顺序更新。文件名继续由 UUID 生成，不使用用户原始文件名；返回的 key 不包含绝对路径。

- [ ] **Step 5: 实现作品后台表单**

字段完整覆盖设计文档。主图单独选择；预览图支持批量上传、删除、上移和下移。版本区支持新增版本，当前版本由作品记录引用。

- [ ] **Step 6: 验证并提交**

Run:

```bash
pnpm vitest run tests/unit/work-validation.test.ts tests/unit/storage.test.ts tests/integration/work-actions.test.ts
pnpm typecheck
pnpm build
```

Expected: 非图片伪装文件被拒绝；跨作者编辑被拒绝；作品状态流测试通过。

```bash
git add src/lib/validation/work.ts src/lib/storage.ts src/server/work-actions.ts src/server/upload-actions.ts src/app/admin/works src/components/admin tests
git commit -m "feat: manage works versions and images"
```

## Task 7：首页、作者页与作者卡

**Files:**
- Create: `src/server/public-queries.ts`
- Create: `src/components/site-header.tsx`
- Create: `src/components/mobile-nav.tsx`
- Create: `src/components/author-card.tsx`
- Create: `src/app/(public)/authors/page.tsx`
- Create: `src/app/(public)/authors/[slug]/page.tsx`
- Modify: `src/app/page.tsx`
- Create: `tests/unit/public-queries.test.ts`
- Create: `tests/unit/author-card.test.tsx`

**Interfaces:**
- Produces: `getHomePageData()`、`getAuthors()`、`getAuthorCollection(slug)`。
- Consumes: 只读取 `PUBLISHED` 和 `OFF_SHELF` 作品；不读取 `DRAFT` 或 `DELETED`。

- [ ] **Step 1: 写公开查询测试**

断言停用作者不显示，草稿和删除作品不显示，下架作品显示，作者作品数仅统计公开作品，分类按 `displayOrder` 排序，未分类作品最后归入虚拟分类“其他作品”。

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm vitest run tests/unit/public-queries.test.ts`

Expected: FAIL，公开查询模块不存在。

- [ ] **Step 3: 实现查询与作者卡**

首页查询返回一个由管理员顺序最靠前的精选作者、最多六位活跃作者和最多六件最新作品。作者卡必须展示代表图、头像、名称、简介、公开作品数和进入合集链接。

- [ ] **Step 4: 实现首页和作者列表**

首页顺序固定为精选作者、搜索入口占位、作者网格、最新作品、全部作品入口。移动端单列/双列组合，桌面端作者网格三列。此任务不实现真实搜索逻辑，只链接到第二阶段的 `/works`。

- [ ] **Step 5: 实现作者合集页**

页面顶部展示作者资料和联系入口，随后逐分类渲染作品。分类没有作品时公开页不显示；“其他作品”仅在存在未分类作品时显示。

- [ ] **Step 6: 验证并提交**

Run: `pnpm vitest run tests/unit/public-queries.test.ts tests/unit/author-card.test.tsx && pnpm build`

Expected: 页面静态结构测试通过，构建包含首页、作者列表和动态作者路由。

```bash
git add src/server/public-queries.ts src/components src/app/page.tsx src/app/'(public)' tests
git commit -m "feat: add author-first public pages"
```

## Task 8：作品胶囊卡与微信联系弹层

**Files:**
- Create: `src/components/work-card.tsx`
- Create: `src/components/contact-author.tsx`
- Create: `src/components/work-preview-strip.tsx`
- Create: `tests/unit/work-card.test.tsx`
- Create: `tests/unit/contact-author.test.tsx`
- Modify: `src/app/(public)/authors/[slug]/page.tsx`

**Interfaces:**
- Produces: `WorkCard({ work, author })`。
- Produces: `ContactAuthor({ authorName, wechatId, qrUrl, disabled })`。

- [ ] **Step 1: 写作品卡展示测试**

断言作品名称、作者、环境、两个人民币价格、功能说明、版本和日期可见；下架作品显示“已下架”且没有“联系作者购买”；已发布作品显示联系按钮；二维码图片具有包含作者名称的替代文本。

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm vitest run tests/unit/work-card.test.tsx tests/unit/contact-author.test.tsx`

Expected: FAIL，组件不存在。

- [ ] **Step 3: 实现响应式作品胶囊卡**

桌面端 `md:grid-cols-2`，移动端单列。作品主图使用 `next/image` 并声明响应尺寸。购买须知使用原生 `details/summary`，确保无 JavaScript 时仍可操作。价格统一由 `formatCny(cents)` 输出 `¥28` 或 `¥28.50`。

- [ ] **Step 4: 实现联系弹层**

使用原生 `dialog`，打开后显示公开微信 ID、复制按钮和二维码。复制失败时显示可手动选择的微信 ID；Escape 关闭；关闭后焦点回到触发按钮。首期联系次数只预留 Server Action 接口，不在此任务实现统计。

- [ ] **Step 5: 实现预览图条**

手机端 `overflow-x-auto` 横向滑动，桌面端四列。第一阶段点击图片直接在新标签打开图片；完整灯箱留在第二阶段，避免提前扩展范围。

- [ ] **Step 6: 验证并提交**

Run: `pnpm vitest run tests/unit/work-card.test.tsx tests/unit/contact-author.test.tsx && pnpm typecheck && pnpm build`

Expected: 发布和下架状态展示正确，键盘可打开和关闭联系弹层，构建成功。

```bash
git add src/components/work-card.tsx src/components/contact-author.tsx src/components/work-preview-strip.tsx src/app/'(public)'/authors tests
git commit -m "feat: add complete work capsule cards"
```

## Task 9：第一阶段视觉、SEO 与端到端验收

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`
- Create: `src/app/not-found.tsx`
- Create: `src/app/robots.ts`
- Create: `src/app/sitemap.ts`
- Create: `tests/e2e/public-browsing.spec.ts`
- Create: `tests/e2e/author-permissions.spec.ts`
- Create: `README.md`

**Interfaces:**
- Consumes: Task 1–8 的页面、seed 账号和权限接口。
- Produces: 第一阶段可验收版本。

- [ ] **Step 1: 写公开浏览 E2E**

流程：打开首页 → 确认精选作者与作者网格 → 进入作者合集 → 确认分类顺序 → 确认作品完整字段 → 打开联系弹层 → 复制微信 ID。

- [ ] **Step 2: 写作者越权 E2E**

流程：以演示作者登录 → 编辑自己的分类成功 → 手工访问其他作者作品编辑 URL → 返回 403 页面或重定向后台首页，且数据库内容未变化。

- [ ] **Step 3: 完成视觉系统**

应用已确认的黑、白、浅灰、低饱和浅紫变量；大圆角只用于作者卡和作品卡；按钮动效限制为颜色和透明度 150ms；遵循 `prefers-reduced-motion`；正文最小 14px；触控目标最小 44px。

- [ ] **Step 4: 实现 SEO 与 404**

首页、作者页自动生成简体中文标题与描述；作者自定义 SEO 字段优先。`robots.ts` 禁止索引 `/admin`、`/login`、`/register`；`sitemap.ts` 只列首页、作者列表和活跃作者页。

- [ ] **Step 5: 编写运行说明**

README 包含：依赖要求、复制 `.env.example`、启动 PostgreSQL、迁移、seed、开发服务器、测试、演示账号和生产环境禁止使用演示密码的提醒。

- [ ] **Step 6: 执行完整验收**

Run:

```bash
pnpm prisma validate
pnpm test
pnpm typecheck
pnpm lint
pnpm build
pnpm playwright test
```

Expected: 所有命令退出码为 0；Playwright 覆盖公开浏览和作者越权保护；浅色与深色截图无横向溢出。

- [ ] **Step 7: 检查改动范围并提交**

Run:

```bash
git diff --check
git status --short
```

Expected: 无空白错误，无 `.env`、上传测试图片、数据库文件或 `.superpowers` 内容进入版本控制。

```bash
git add src tests README.md
git commit -m "feat: complete phase one collection experience"
```

## 第一阶段完成标准

- 管理员能够创建、编辑、发布、下架、软删除和恢复作者作品。
- 作者只能管理自己绑定作者的公开资料、自定义分类、作品和版本。
- 游客能够从首页进入作者合集，在同一页面读取完整作品信息并复制公开微信 ID 或查看二维码。
- 作者分类和作品顺序正确，删除分类不会删除作品。
- 手机端和桌面端均无横向页面溢出，浅色和深色模式可用。
- 密码未明文存储，越权请求被服务端拒绝。
- 全部自动化检查与端到端验收通过。
