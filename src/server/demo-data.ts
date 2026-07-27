import type { AuthorCardData } from "@/components/author-card";
import type { PublicWork, PublicWorkAuthor } from "@/components/work-card";

export const demoAuthors: AuthorCardData[] = [
  { slug: "nanzhi", name: "南枝", bio: "温柔、克制的播放器卡片与主题作品。", workCount: 4, avatarUrl: null, coverUrl: null },
  { slug: "shancha", name: "山茶", bio: "清爽耐看的气泡、组件与桌面主题。", workCount: 3, avatarUrl: null, coverUrl: null },
  { slug: "qinghe", name: "青禾", bio: "安静细腻的音乐卡片和日常主题。", workCount: 2, avatarUrl: null, coverUrl: null },
];

const author: PublicWorkAuthor = { name: "南枝", publicWechatId: "nanzhi_demo", qrUrl: null };

const makeWork = (id: string, name: string, direct: number, repost: number, status: PublicWork["status"] = "PUBLISHED"): PublicWork => ({
  id, name, status, supportsLab: true, supportsWcglass: true,
  directPriceCents: direct, repostPriceCents: repost,
  features: "歌词滚动、播放进度、封面切换与浅深色配色适配。",
  repostRequirements: "按作者提供的文案完成公开转发，并保留指定时间。",
  purchaseNotes: "添加作者微信时请备注作品名称；作品需配合最新插件版本使用。",
  mainImageUrl: null, images: [], version: "1.2.0", updatedAt: new Date("2026-07-20T00:00:00.000Z"),
});

export const demoWorks = [
  { work: makeWork("spring-letter", "春日来信", 2800, 1800), author },
  { work: makeWork("evening-wind", "晚风播放器", 3200, 2200), author },
  { work: makeWork("violet-bubble", "浅紫气泡", 1600, 1000), author },
];

export const demoCollection = {
  id: "demo-nanzhi", slug: "nanzhi", name: "南枝", bio: demoAuthors[0].bio,
  publicWechatId: author.publicWechatId, avatarUrl: null, qrUrl: null,
  categories: [
    { id: "cards", name: "卡片", works: [demoWorks[0].work, demoWorks[1].work] },
    { id: "themes", name: "主题", works: [makeWork("moon-theme", "月光主题", 2600, 1700)] },
    { id: "bubbles", name: "气泡", works: [demoWorks[2].work] },
  ],
  uncategorized: [] as PublicWork[],
};
