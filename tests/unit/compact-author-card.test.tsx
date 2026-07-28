import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CompactAuthorCard } from "@/components/compact-author-card";

describe("CompactAuthorCard", () => {
  it("shows a compact author summary in one clickable card", () => {
    render(<CompactAuthorCard author={{ slug: "nanzhi", name: "南枝", bio: "温柔的播放器作品", workCount: 12, avatarUrl: null, coverUrl: null }}/>);

    expect(screen.getByRole("link", { name: "进入南枝合集" })).toHaveAttribute("href", "/authors/nanzhi");
    expect(screen.getByRole("heading", { name: "南枝" })).toBeInTheDocument();
    expect(screen.getByText("12 件作品")).toBeInTheDocument();
    expect(screen.getByText("温柔的播放器作品")).toBeInTheDocument();
    expect(screen.queryByText("进入合集")).not.toBeInTheDocument();
  });
});
