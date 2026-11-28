import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/trilhas",
}));

import { DesktopNav } from "./main-nav";

describe("DesktopNav responsive labels", () => {
  it("renders Explore when available and keeps labels accessible while visually compact below lg", () => {
    const html = renderToStaticMarkup(<DesktopNav showExplore />);

    expect(html).toContain("Explorar");
    expect(html).toContain("hidden lg:inline");
    expect(html).toContain("sr-only lg:hidden");
    expect(html).toContain("px-3");
    expect(html).toContain("xl:px-4");
  });
});
