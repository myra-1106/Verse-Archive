import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ContactAuthor } from "@/components/contact-author";

describe("ContactAuthor", () => {
  it("labels the public contact as a WeChat number", () => {
    render(<ContactAuthor authorName="南枝" wechatId="nanzhi_2026" qrUrl={null} />);

    expect(screen.getByRole("button", { name: "联系作者购买" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "复制微信号", hidden: true })).toBeInTheDocument();
  });

  it("does not show a contact button without a public number or QR code", () => {
    render(<ContactAuthor authorName="南枝" wechatId="" qrUrl={null} />);

    expect(screen.queryByRole("button", { name: "联系作者购买" })).not.toBeInTheDocument();
  });
});
