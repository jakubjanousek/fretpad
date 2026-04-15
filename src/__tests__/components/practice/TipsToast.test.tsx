// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { TipsToast } from "@/components/practice/TipsToast";
import { TIPS } from "@/lib/tips";

describe("TipsToast", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders nothing before any loop-count increase", () => {
    render(<TipsToast loopCount={0} />);
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("shows a tip when loopCount increases to a trigger value", () => {
    const triggerTip = TIPS[0];
    if (!triggerTip) throw new Error("TIPS must contain at least one tip");

    const { rerender } = render(<TipsToast loopCount={0} />);
    rerender(<TipsToast loopCount={triggerTip.triggerLoop} />);

    expect(screen.getByRole("status")).toBeTruthy();
    expect(screen.getByText(triggerTip.text)).toBeTruthy();
  });

  it("does not show a tip when loopCount goes from a higher value back to 0", () => {
    const triggerTip = TIPS[0];
    if (!triggerTip) throw new Error("TIPS must contain at least one tip");

    // Start already past the trigger so we don't satisfy "increased to it"
    const { rerender } = render(
      <TipsToast loopCount={triggerTip.triggerLoop + 5} />,
    );
    rerender(<TipsToast loopCount={0} />);

    expect(screen.queryByRole("status")).toBeNull();
  });

  it("does not show the same tip twice across mounts", () => {
    const triggerTip = TIPS[0];
    if (!triggerTip) throw new Error("TIPS must contain at least one tip");

    const first = render(<TipsToast loopCount={0} />);
    first.rerender(<TipsToast loopCount={triggerTip.triggerLoop} />);
    expect(screen.getByText(triggerTip.text)).toBeTruthy();
    first.unmount();

    const second = render(<TipsToast loopCount={0} />);
    second.rerender(<TipsToast loopCount={triggerTip.triggerLoop} />);
    expect(screen.queryByText(triggerTip.text)).toBeNull();
  });

  it("dismisses when the close button is clicked", () => {
    const triggerTip = TIPS[0];
    if (!triggerTip) throw new Error("TIPS must contain at least one tip");

    const { rerender } = render(<TipsToast loopCount={0} />);
    rerender(<TipsToast loopCount={triggerTip.triggerLoop} />);
    expect(screen.getByRole("status")).toBeTruthy();

    fireEvent.click(screen.getByLabelText("Dismiss tip"));

    expect(screen.queryByRole("status")).toBeNull();
  });
});
