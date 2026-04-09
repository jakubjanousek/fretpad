// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { ProgressionName } from "@/components/progression/ProgressionName";
import { useAppStore } from "@/state/useAppStore";

function setStoreName(name: string) {
  useAppStore.setState((s) => ({
    progression: { ...s.progression, name },
  }));
}

describe("ProgressionName", () => {
  beforeEach(() => {
    setStoreName("");
  });

  it("shows placeholder when name is empty", () => {
    render(<ProgressionName />);
    expect(screen.getByText("Name this progression...")).toBeDefined();
  });

  it("shows name when present", () => {
    setStoreName("My Blues");
    render(<ProgressionName />);
    expect(screen.getByText("My Blues")).toBeDefined();
  });

  it("enters edit mode on click and commits on Enter", () => {
    render(<ProgressionName />);

    fireEvent.click(screen.getByText("Name this progression..."));
    const input = screen.getByRole("textbox");
    expect(input).toBeDefined();

    fireEvent.change(input, { target: { value: "Jazz Turnaround" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(useAppStore.getState().progression.name).toBe("Jazz Turnaround");
  });

  it("cancels edit on Escape", () => {
    setStoreName("Original");
    render(<ProgressionName />);

    fireEvent.click(screen.getByText("Original"));
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Changed" } });
    fireEvent.keyDown(input, { key: "Escape" });

    expect(useAppStore.getState().progression.name).toBe("Original");
    expect(screen.getByText("Original")).toBeDefined();
  });

  it("commits on blur", () => {
    render(<ProgressionName />);

    fireEvent.click(screen.getByText("Name this progression..."));
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Blur Test" } });
    fireEvent.blur(input);

    expect(useAppStore.getState().progression.name).toBe("Blur Test");
  });
});
