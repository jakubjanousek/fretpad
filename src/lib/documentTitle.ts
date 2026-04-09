const BASE_TITLE = "FretPad";

export interface DocumentTitleInput {
  name: string;
  bars: { chords: string[] }[];
}

export function buildDocumentTitle(input: DocumentTitleInput): string {
  if (input.name) {
    return `${input.name} — ${BASE_TITLE}`;
  }

  if (input.bars.length === 0) {
    return BASE_TITLE;
  }

  const chordSummary = input.bars
    .map((bar) => bar.chords.join(" "))
    .join(" | ");

  return `${chordSummary} — ${BASE_TITLE}`;
}
