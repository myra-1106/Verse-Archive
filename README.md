# 作者作品合集

面向手机端的多作者作品展示网站。前台展示作者合集与完整作品胶囊卡，后台供作者和管理员维护作者资料、自定义分类、作品和版本。

## 本地运行

需要 Node.js 20+ 和 pnpm。项目可以用 Prisma Dev 启动本地 PostgreSQL，不要求安装 Docker。

```bash
cp .env.example .env
pnpm install
pnpm db:dev
pnpm db:push
pnpm db:seed
pnpm dev
```

打开 `http://localhost:3000`。

演示 seed 会创建 `admin_demo / ChangeMe123!`。该账号和密码只能用于本地开发，生产环境禁止执行演示 seed。

## 检查

```bash
pnpm test
pnpm typecheck
pnpm lint
pnpm build
pnpm playwright test
```

`pnpm db:dev` 会显示本机数据库连接地址。把该地址写入 `.env.local` 的 `DATABASE_URL`，并设置 `DEMO_MODE="0"`，即可使用真实数据库。
