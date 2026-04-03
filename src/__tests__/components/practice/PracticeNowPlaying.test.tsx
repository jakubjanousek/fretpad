// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Chord } from "@/lib/types";

// Mock AudioInputScorecard to avoid audio/store dependencies
vi.mock("@/components/transport/AudioInputScorecard", () => ({
  AudioInputScorecard: ({ enabled }: { enabled: boolean }) =>
    enabled ? <div data-testid="scorecard">Scorecard</div> : null,
}));

import { PracticeNowPlaying } from "@/components/practice/PracticeNowPlaying";

const dm7: Chord = {
  symbol: "Dm7",
  root: "D",
  quality: "min7",
  notes: ["D", "F", "A", "C"],
  guideTones: ["F", "C"],
  suggestedScales: ["D Dorian"],
};

const g7: Chord = {
  symbol: "G7",
  root: "G",
  quality: "7",
  notes: ["G", "B", "D", "F"],
  guideTones: ["B", "F"],
  suggestedScales: ["G Mixolydian"],
};

describe("PracticeNowPlaying", () => {
  it("renders the current chord symbol", () => {
    render(
      <PracticeNowPlaying
        currentChord={dm7}
        nextChord={g7}
        micEnabled={false}
      />,
    );
    expect(screen.getByText("Dm7")).toBeDefined();
  });

  it("renders the next chord preview", () => {
    render(
      <PracticeNowPlaying
        currentChord={dm7}
        nextChord={g7}
        micEnabled={false}
      />,
    );
    expect(screen.getByText("G7")).toBeDefined();
  });

  it("shows scorecard when mic is enabled", () => {
    render(
      <PracticeNowPlaying
        currentChord={dm7}
        nextChord={g7}
        micEnabled={true}
      />,
    );
    expect(screen.getByTestId("scorecard")).toBeDefined();
  });

  it("hides scorecard when mic is disabled", () => {
    render(
      <PracticeNowPlaying
        currentChord={dm7}
        nextChord={g7}
        micEnabled={false}
      />,
    );
    expect(screen.queryByTestId("scorecard")).toBeNull();
  });

  it("handles null next chord gracefully", () => {
    render(
      <PracticeNowPlaying
        currentChord={dm7}
        nextChord={null}
        micEnabled={false}
      />,
    );
    expect(screen.getByText("Dm7")).toBeDefined();
    expect(screen.queryByText("Next")).toBeNull();
  });
});
