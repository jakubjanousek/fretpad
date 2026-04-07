import { describe, expect, it, vi } from "vitest";

const mockRedirect = vi.fn();
vi.mock("next/navigation", () => ({
  redirect: mockRedirect,
}));

describe("practice page (no mode)", () => {
  it("redirects to the default practice mode", async () => {
    const { default: Page } = await import("@/app/practice/page");
    Page();
    expect(mockRedirect).toHaveBeenCalledWith(
      "/practice/outline-chord-changes",
    );
  });
});
