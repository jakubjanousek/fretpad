// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  buildDocumentTitle,
  type DocumentTitleInput,
} from "@/lib/documentTitle";

describe("buildDocumentTitle", () => {
  it("uses progression name when present", () => {
    const input: DocumentTitleInput = {
      name: "ii-V-I",
      bars: [
        { chords: ["Dm7"] },
        { chords: ["G7"] },
        { chords: ["Cmaj7"] },
        { chords: ["Cmaj7"] },
      ],
    };
    expect(buildDocumentTitle(input)).toBe("ii-V-I — FretPad");
  });

  it("falls back to chord symbols when name is empty", () => {
    const input: DocumentTitleInput = {
      name: "",
      bars: [
        { chords: ["Dm7"] },
        { chords: ["G7"] },
        { chords: ["Cmaj7"] },
        { chords: ["Cmaj7"] },
      ],
    };
    expect(buildDocumentTitle(input)).toBe(
      "Dm7 | G7 | Cmaj7 | Cmaj7 — FretPad",
    );
  });

  it("joins multi-chord bars with spaces", () => {
    const input: DocumentTitleInput = {
      name: "",
      bars: [{ chords: ["Dm7", "G7"] }, { chords: ["Cmaj7"] }],
    };
    expect(buildDocumentTitle(input)).toBe("Dm7 G7 | Cmaj7 — FretPad");
  });

  it("returns base title for empty bars", () => {
    const input: DocumentTitleInput = { name: "", bars: [] };
    expect(buildDocumentTitle(input)).toBe("FretPad");
  });
});
