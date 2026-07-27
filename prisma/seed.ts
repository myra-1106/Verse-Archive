import { PrismaClient, UserRole, AuthorStatus, WorkStatus } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await argon2.hash("ChangeMe123!", {
    type: argon2.argon2id,
  });

  const admin = await prisma.user.upsert({
    where: { wechatId: "admin_demo" },
    update: {},
    create: {
      wechatId: "admin_demo",
      displayName: "演示管理员",
      passwordHash,
      role: UserRole.SUPER_ADMIN,
    },
  });

  const authorInputs = [
    {
      slug: "nanzhi",
      name: "南枝",
      bio: "温柔、克制的播放器作品。",
      publicWechatId: "nanzhi_demo",
    },
    {
      slug: "shancha",
      name: "山茶",
      bio: "简洁耐看的主题与气泡作品。",
      publicWechatId: "shancha_demo",
    },
  ];

  for (const [authorIndex, input] of authorInputs.entries()) {
    const author = await prisma.author.upsert({
      where: { slug: input.slug },
      update: input,
      create: {
        ...input,
        status: AuthorStatus.ACTIVE,
        displayOrder: authorIndex,
      },
    });

    const categories = await Promise.all(
      ["卡片", "主题"].map((name, displayOrder) =>
        prisma.authorCategory.upsert({
          where: { authorId_name: { authorId: author.id, name } },
          update: { displayOrder },
          create: { authorId: author.id, name, displayOrder },
        }),
      ),
    );

    for (let index = 0; index < (authorIndex === 0 ? 2 : 1); index += 1) {
      const slug = `${input.slug}-work-${index + 1}`;
      const work = await prisma.work.upsert({
        where: { slug },
        update: {},
        create: {
          authorId: author.id,
          authorCategoryId: categories[index % categories.length].id,
          slug,
          name: index === 0 ? "春日来信" : "晚风气泡",
          supportsLab: true,
          supportsWcglass: true,
          directPriceCents: 2800,
          repostPriceCents: 1800,
          features: "歌词、进度与封面配色适配。",
          repostRequirements: "按作者说明完成公开转发。",
          purchaseNotes: "添加作者微信后说明作品名称。",
          status: WorkStatus.PUBLISHED,
          displayOrder: index,
          createdById: admin.id,
          updatedById: admin.id,
          publishedAt: new Date("2026-07-20T00:00:00.000Z"),
        },
      });

      const version = await prisma.workVersion.upsert({
        where: { workId_version: { workId: work.id, version: "1.0.0" } },
        update: {},
        create: {
          workId: work.id,
          version: "1.0.0",
          releasedAt: new Date("2026-07-20T00:00:00.000Z"),
          changeLog: "首次发布。",
          minLabVersion: "latest",
          minWcglassVersion: "latest",
          createdById: admin.id,
        },
      });

      if (work.currentVersionId !== version.id) {
        await prisma.work.update({
          where: { id: work.id },
          data: { currentVersionId: version.id },
        });
      }
    }
  }

  console.info("演示管理员：admin_demo / ChangeMe123!");
  console.info("生产环境禁止使用或导入此演示账号。");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
