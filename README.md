# 作者作品合集

面向手机端的多作者作品展示网站。前台展示作者合集与完整作品胶囊卡，后台供作者和管理员维护作者资料、自定义分类、作品和版本。

## 本地运行

需要 Node.js 20+、pnpm 和 PostgreSQL 16。

```bash
cp .env.example .env
docker compose up -d db
pnpm install
pnpm prisma migrate dev
pnpm prisma db seed
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

当前电脑若没有 Docker 或 PostgreSQL，可以先运行不依赖数据库的前四项；数据库迁移、seed 和端到端测试必须在 PostgreSQL 可用后补验。
