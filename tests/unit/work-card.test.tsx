import { render, screen } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { WorkCard } from "@/components/work-card";

const work = {
  id: "work-1", name: "春日来信", status: "PUBLISHED" as const,
  supportsLab: true, supportsWcglass: true, directPriceCents: 2800, repostPriceCents: 1850,
  features: "歌词与封面配色", repostRequirements: "公开转发", purchaseNotes: "添加作者微信",
  mainImageUrl: null, images: [], version: "1.0.0", updatedAt: new Date("2026-07-20T00:00:00Z"),
};
const author = { name: "南枝", publicWechatId: "nanzhi_2026", qrUrl: null };

describe("WorkCard", () => {
  it("shows complete work information and prices", () => {
    render(createElement(WorkCard, { work, author }));
    expect(screen.getByRole("heading", { name: "春日来信" })).toBeInTheDocument();
    expect(screen.getByText("¥28")).toBeInTheDocument();
    expect(screen.getByText("¥18.50")).toBeInTheDocument();
    expect(screen.getByText("LAB")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "联系作者购买" })).toBeInTheDocument();
  });

  it("does not offer contact purchase for an off-shelf work", () => {
    render(createElement(WorkCard, { work: { ...work, status: "OFF_SHELF" }, author }));
    expect(screen.getByText("已下架")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "联系作者购买" })).not.toBeInTheDocument();
  });

  it("keeps preview images inside a fully clickable compact card", () => {
    render(createElement(WorkCard, {
      compact: true,
      author,
      work: {
        ...work,
        usageRequirements: "需要最新版插件",
        acquisitionMethod: "添加作者微信获取",
        otherNotes: "请勿二次分享",
        mainImageUrl: "/main.jpg",
        mainImageWidth: 600,
        mainImageHeight: 900,
        environments: ["XOS", "主题盒子"],
        images: [
          { id: "preview-1", url: "/preview-1.jpg", alt: "上机效果一" },
          { id: "preview-2", url: "/preview-2.jpg", alt: "上机效果二" },
        ],
      },
    }));

    expect(screen.getByRole("link", { name: "查看春日来信详情" })).toHaveAttribute("href", "/works/work-1");
    expect(screen.queryByRole("link", { name: "查看详情" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "放大上机效果一" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "放大上机效果二" })).toBeInTheDocument();
    expect(screen.getByTestId("compact-preview-strip")).toHaveStyle({ height: "min(40%, 144px)" });
    expect(screen.getByTestId("compact-main-media")).toHaveStyle({ aspectRatio: "600 / 900" });
    expect(screen.getByText("XOS")).toBeInTheDocument();
    expect(screen.getByText("主题盒子")).toBeInTheDocument();
    expect(screen.getByText("歌词与封面配色")).toBeInTheDocument();
    expect(screen.getByText("需要最新版插件")).toBeInTheDocument();
    expect(screen.getByText("添加作者微信获取")).toBeInTheDocument();
    expect(screen.getByText("公开转发")).toBeInTheDocument();
    expect(screen.getByText("添加作者微信")).toBeInTheDocument();
    expect(screen.getByText("请勿二次分享")).toBeInTheDocument();
  });
});
