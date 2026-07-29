import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MobileNav } from "@/components/mobile-nav";

let pathname = "/";
const prefetch = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
  useRouter: () => ({ prefetch }),
}));

describe("MobileNav", () => {
  beforeEach(() => {
    pathname = "/";
    prefetch.mockClear();
    window.scrollTo = vi.fn();
  });

  it("prefetches every destination and selects a destination immediately on pointer down", () => {
    render(<MobileNav />);

    expect(prefetch.mock.calls.map(([href]) => href)).toEqual(["/", "/authors", "/settings"]);

    const authors = screen.getByRole("link", { name: "合集" });
    fireEvent.pointerDown(authors);

    expect(prefetch).toHaveBeenCalledWith("/authors");
    expect(authors).toHaveAttribute("aria-current", "page");
  });

  it("keeps the three required destinations and marks the current page", () => {
    pathname = "/authors/nanzhi";
    render(<MobileNav />);

    expect(screen.getByRole("link", { name: "首页" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "合集" })).toHaveAttribute("href", "/authors");
    expect(screen.getByRole("link", { name: "我的" })).toHaveAttribute("href", "/settings");
    expect(screen.getByRole("link", { name: "合集" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "首页" })).not.toHaveAttribute("aria-current");
  });

  it("scrolls to the top instead of navigating again when the active item is tapped", () => {
    render(<MobileNav />);
    const event = new MouseEvent("click", { bubbles: true, cancelable: true });

    screen.getByRole("link", { name: "首页" }).dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });
});
