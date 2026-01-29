# Plan: Verify Fretboard Note Accuracy

## Problem
No integration tests verify that the full pipeline (chord symbol → parsed chord → fretboard positions → note classifications) produces correct results. A potential interval display bug exists for flat-root chords.

## Potential Bug: Flat-Root Interval Labels
`getIntervalName(root, note)` in `lib/theory/chords.ts:148` uses `Interval.distance(root, note)` where:
- `root` can be flat-spelled (e.g. "Bb", "Eb") from chord parsing
- `note` is always sharp-spelled (e.g. "A#", "D#") from the fretboard's `CHROMATIC_NOTES` array

Tonal's `Interval.distance("Bb", "A#")` likely returns `"1A"` (augmented unison) instead of `"1P"`, which isn't in the interval map — so flat-root chords may display raw tonal notation (e.g. "1A") instead of clean labels (e.g. "1").

**Fix:** Normalize the `note` parameter to match the root's enharmonic spelling before computing the interval, or expand the interval map.

## Plan

### Step 1: Investigate and fix the interval bug
- Write a quick test to confirm `getIntervalName("Bb", "A#")` returns "1A" instead of "1"
- Fix by normalizing the note to the root's enharmonic context before calling `Interval.distance`, using tonal's `Note.enharmonic()` or converting both to pitch class and reconstructing
- Verify fix for Bb7, Ebmaj7, Abmaj7, Dbmaj7

### Step 2: Create integration test file
Create `__tests__/lib/fretboard-integration.test.ts` with these test categories:

**A. Known chord shapes (~10 tests)**
- Cmaj7, Dm7, G7, Am, E — verify specific (string, fret) positions have correct note, classification, and interval
- Verify no notes appear at non-chord-tone positions

**B. Guide tone classification for all chord qualities (~16 tests)**
- For each ChordQuality (maj, min, maj7, min7, 7, dim, dim7, aug, sus2, sus4, 6, min6, 9, maj9, min9, min7b5), parse a C-root chord and verify `guideTones` and `isGuideTone` flags

**C. Scale overlay accuracy (~5 tests)**
- Cmaj7 + Major, Dm7 + Dorian, G7 + Mixolydian, Bb7 + Mixolydian
- Verify correct scale tones appear and chromatic non-scale notes don't

**D. Enharmonic / flat-root edge cases (~5 tests)**
- Bb7, Ebmaj7, F#m7, Abmaj7 — verify root detection, guide tones, and interval labels work across enharmonic boundaries

**E. Interval label accuracy (~5 tests)**
- Verify interval strings for Cmaj7, Dm7, G7, Bb7, Ebmaj7

**F. Regression snapshots (~4 tests)**
- Inline snapshots for Cmaj7, G7+Mixolydian, Bb7, Dm7+Dorian — locks in known-correct behavior

**G. Edge cases (~5 tests)**
- No duplicate (string, fret) positions
- numFrets=0 returns only open string matches
- Every chord covers all 6 strings
- ii-V-I progression sanity checks

### Step 3: Run tests, fix any discovered bugs

## Files to modify
- `lib/theory/chords.ts` — fix `getIntervalName` for enharmonic mismatch
- `__tests__/lib/fretboard-integration.test.ts` — new file with ~50 integration tests

## Verification
- `pnpm test` — all existing + new tests pass
- `pnpm validate` — lint, types, tests all green
