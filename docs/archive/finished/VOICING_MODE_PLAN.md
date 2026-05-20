# Chord Voicing Mode

## Problem

The app needs a mode where guitarists can see **chord voicings** for their progression — specific shapes to grab, not just scattered note dots. The current fretboard view (showing all possible notes) is the wrong UI for this.

Key requirements:
- Multiple voicing options per chord
- Minimal hand movement between consecutive chords
- Automated voice-leading path optimization

## Design Decisions

### Separate mode, separate URL

Lives at `/practice/comp-with-voicings` (stub already exists in `modes.ts`). Different mental model from "Outline Chord Changes" — comping vs improvising. Shares progression editor, transport, audio engine, and theory panel. Only the main visualization area differs.

### Chord diagrams, not fretboard dots

The standard fretboard view shows all possible positions — wrong for "grab this shape." Instead, use SVG **chord-book-style diagrams** showing exact finger positions, muted strings, barre indicators. Familiar format that every guitarist knows.

### Template-based voicing generation

Define voicing templates as relative shapes (e.g., shell voicing: R-3-7 on strings 4-3-2). Transpose to any root by finding the root on the template's root string and shifting. Filter by playability constraints (max 4-fret stretch, max 4 fingers, fret range 0-14). Start with ~15 templates for MVP, expand to ~50 later.

### Viterbi algorithm for voice leading

Given candidate voicings per chord, find the minimum-cost path:
1. Cost function: sum of fret-distance per string between two voicings + penalties for large jumps and string-group changes
2. DP forward pass: for each chord position, find best predecessor voicing
3. Backtrack for optimal sequence

With ~30 voicings/chord and ~16 chords, this is ~15K comparisons — instant.

## Implementation Plan

### Phase 1: Voicing Engine (Pure Logic, TDD)

All pure functions, no UI. Test-first.

**1a. Voicing templates** `src/lib/guitar/voicingTemplates.ts`
- Shell voicings (R-3-7, R-7-3) on top4/inner4/bottom4 string groups
- Cover maj7, min7, dom7, min7b5 qualities
- ~15 templates for MVP
- Tests: each template produces correct intervals when instantiated at a known root

**1b. Voicing generator** `src/lib/guitar/voicingGenerator.ts`
- `generateVoicingsForChord(chord: Chord, options?): GuitarVoicing[]`
- Transpose templates to requested root, apply playability filter
- Uses existing `getNoteAtFret()` from `src/lib/fretboard.ts` and `parseChordSymbol()` from `src/lib/theory/chords.ts`
- Tests: known chords produce expected voicings, unplayable shapes filtered out

**1c. Voice leading** `src/lib/guitar/voiceLeading.ts`
- `voicingTransitionCost(from: GuitarVoicing, to: GuitarVoicing): number`
- `computeVoiceLeadingPath(chords: Chord[], voicingsPerChord: GuitarVoicing[][]): GuitarVoicing[]`
- Viterbi DP with loop-around support for repeating progressions
- Tests: ii-V-I produces voicings that stay in same fretboard region; cost function is symmetric and sane

### Phase 2: UI Components

**2a. ChordDiagram** `src/components/voicing/ChordDiagram.tsx`
- SVG chord box: fret grid, dots with interval labels, X/O for muted/open, barre arcs
- Color-coded: root=orange, guide tone=blue, chord tone=green (existing palette)
- Responsive via SVG viewBox

**2b. VoicingCard + VoicingStrip** `src/components/voicing/`
- `VoicingCard`: wraps ChordDiagram with chord symbol, voicing type label, difficulty
- `VoicingStrip`: horizontal scroll of alternatives for one chord, voice-leading pick highlighted, tap to override

**2c. VoiceLeadingPath** `src/components/voicing/VoiceLeadingPath.tsx`
- Row of mini chord diagrams for full progression
- Current chord enlarged during playback
- Common tones highlighted between adjacent voicings

**2d. CompVoicingsView** `src/components/voicing/CompVoicingsView.tsx`
- Top-level view, rendered instead of `Fretboard` when mode is `comp-with-voicings`
- Manages voicing state, renders path during playback, strip when browsing

### Phase 3: State & Integration

**3a. Zustand slice** `src/state/slices/voicingSlice.ts`
- Generated voicings per chord, computed voice-leading path, user overrides, filter preferences
- Recomputes on progression change

**3b. Hook** `src/hooks/useVoicingData.ts`
- Connects store to components (same pattern as `useFretboardData`)

**3c. PracticePage** `src/app/practice/[mode]/PracticePage.tsx`
- Conditional: `comp-with-voicings` mode renders `CompVoicingsView`, others render `Fretboard`

**3d. Mode config** `src/lib/modes.ts`
- Minor update to `comp-with-voicings` flags if needed

### Phase 4: Polish (Future)

- Expand template library to ~50 shapes (open, barre, rootless, drop24)
- Audio preview: tap a diagram to hear the voicing (guitar-like sound)
- Animate transitions during playback
- Difficulty filter UI (beginner/intermediate/advanced)
- Fingering suggestions in diagram dots

## Existing Infrastructure to Reuse

| What | Where |
|------|-------|
| `GuitarVoicing`, `VoicingTemplate` types | `src/lib/types.ts` (lines 410-448) |
| Chord parsing | `src/lib/theory/chords.ts` `parseChordSymbol()` |
| Note-at-fret mapping | `src/lib/fretboard.ts` `getNoteAtFret()` |
| Fretboard layout | `src/lib/fretboard.ts` `generateFretboardLayout()` |
| Color palette | `src/lib/fretboard.ts` `getFretNoteColor()` |
| Mode system | `src/lib/modes.ts` `comp-with-voicings` stub |
| Practice page layout | `src/app/practice/[mode]/PracticePage.tsx` |
| Store composition | `src/state/useAppStore.ts` |

## New Files

```
src/lib/guitar/voicingTemplates.ts
src/lib/guitar/voicingGenerator.ts
src/lib/guitar/voiceLeading.ts
src/components/voicing/ChordDiagram.tsx
src/components/voicing/VoicingCard.tsx
src/components/voicing/VoicingStrip.tsx
src/components/voicing/VoiceLeadingPath.tsx
src/components/voicing/CompVoicingsView.tsx
src/state/slices/voicingSlice.ts
src/hooks/useVoicingData.ts
src/__tests__/lib/guitar/voicingTemplates.test.ts
src/__tests__/lib/guitar/voicingGenerator.test.ts
src/__tests__/lib/guitar/voiceLeading.test.ts
```

## Verification

1. `pnpm validate` passes (lint + type-check + tests)
2. Navigate to `/practice/comp-with-voicings` — chord diagrams render for default ii-V-I
3. Voice-leading path stays in same fretboard region (no wild jumps)
4. Override a voicing — path recomputes from that point
5. Playback advances through voicings in sync with audio
