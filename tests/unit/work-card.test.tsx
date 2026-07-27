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
});
