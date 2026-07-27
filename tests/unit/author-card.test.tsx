import { render, screen } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { AuthorCard } from "@/components/author-card";

describe("AuthorCard", () => {
  it("shows the author summary and collection link", () => {
    render(createElement(AuthorCard, { author: { slug: "nanzhi", name: "南枝", bio: "温柔的播放器作品", workCount: 12, avatarUrl: null, coverUrl: null } }));
    expect(screen.getByRole("heading", { name: "南枝" })).toBeInTheDocument();
    expect(screen.getByText("12 件作品")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "进入合集" })).toHaveAttribute("href", "/authors/nanzhi");
  });
});
