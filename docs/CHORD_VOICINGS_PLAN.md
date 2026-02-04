# Chord Voicings Display Feature

## Overview

Display playable guitar chord voicings on the fretboard, showing users practical fingering shapes for the current chord. This bridges the gap between the audio engine (which already generates voicings) and the visual fretboard display.

## Current State

- **Audio voicings exist**: `lib/audio/voicings.ts` has shell, triad, and full voicing generators
- **Fretboard shows all chord tones**: But doesn't group them into playable shapes
- **No voicing visualization**: Users must mentally construct chord shapes

## Goals

1. Show 2-4 practical guitar voicings per chord
2. Highlight voicing shapes distinctly from scale/chord tone overlays
3. Allow cycling through voicing options
4. Support common guitar voicing types (open, barre, shell, etc.)
5. **Organize voicings using Ted Greene's V-System principles**
6. **Provide voice leading suggestions between chords**

---

## Technical Approach

### Phase 1: Guitar Voicing Data Structure

Create a new guitar-specific voicing system separate from the audio voicings (which are piano-oriented).

```typescript
// lib/types.ts additions

interface GuitarVoicing {
  id: string;
  name: string;                    // e.g., "Open C", "Barre (5th fret)", "Shell"
  type: GuitarVoicingType;
  positions: GuitarFretPosition[]; // 6 positions, one per string
  baseFret: number;                // Lowest fret in voicing
  isBarreChord: boolean;
  difficulty: 'beginner' | 'intermediate' | 'advanced';

  // Ted Greene-inspired categorization
  vSystem: VSystemPosition;        // Which string has the root (V-1 to V-6)
  stringGroup: StringGroup;        // Which 4-string set is used
  voicingStructure: VoicingStructure; // Close, drop2, drop3, etc.
  inversion: 0 | 1 | 2 | 3;        // Root position, 1st, 2nd, 3rd inversion
}

// Ted Greene's V-System: categorizes voicings by root string position
type VSystemPosition =
  | 'V-1'   // Root on string 1 (high E)
  | 'V-2'   // Root on string 2 (B)
  | 'V-3'   // Root on string 3 (G)
  | 'V-4'   // Root on string 4 (D)
  | 'V-5'   // Root on string 5 (A)
  | 'V-6';  // Root on string 6 (low E)

// String groups for organizing voicing families
type StringGroup =
  | 'top4'      // Strings 1-2-3-4 (high E to D)
  | 'inner4'    // Strings 2-3-4-5 (B to A)
  | 'bottom4'   // Strings 3-4-5-6 (G to low E)
  | 'spread';   // Non-adjacent strings

// Voicing structure types
type VoicingStructure =
  | 'close'     // All voices within an octave
  | 'drop2'     // Second voice from top dropped an octave
  | 'drop3'     // Third voice from top dropped an octave
  | 'drop24'    // 2nd and 4th voices dropped
  | 'spread';   // Voices spread across multiple octaves

interface GuitarFretPosition {
  string: number;     // 0-5 (high E to low E)
  fret: number;       // 0 = open, -1 = muted
  finger?: 1 | 2 | 3 | 4 | 'T';  // Optional fingering suggestion
  isRoot?: boolean;
}

type GuitarVoicingType =
  | 'open'      // Open chord shapes (cowboy chords)
  | 'barre'     // Movable barre chord shapes
  | 'shell'     // Root + 3rd + 7th (jazz voicings)
  | 'drop2'     // Drop 2 voicings
  | 'drop3'     // Drop 3 voicings
  | 'triadic'   // Simple 3-note shapes
  | 'rootless'; // No root (jazz comping)
```

### Phase 2: Voicing Generation

Create a guitar voicing generator that produces practical shapes.

```
lib/
  guitar/
    voicings.ts          # Main voicing generation logic
    shapes/
      open-shapes.ts     # Open chord templates (C, A, G, E, D shapes)
      barre-shapes.ts    # Movable barre templates
      shell-shapes.ts    # Shell voicing templates
      drop-voicings.ts   # Drop 2/3 voicing templates
```

**Approach Options:**

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| **A: Template-based** | Define shapes for each chord quality, transpose as needed | Fast lookup, guaranteed playable | Limited variety, storage overhead |
| **B: Algorithmic** | Calculate voicings from chord notes + fretboard constraints | Flexible, covers all chords | Complex, may generate unplayable shapes |
| **C: Hybrid** | Templates for common chords, algorithm for extensions | Best of both | More code to maintain |

**Recommendation:** Option C (Hybrid)
- Use CAGED-based templates for basic shapes
- Algorithm generates shell/drop voicings for jazz chords
- Validate all generated voicings for playability (max 4-fret stretch)
- **Categorize all voicings using Ted Greene's V-System for organization**

### Phase 2.5: Ted Greene V-System Framework

The V-System provides a systematic way to organize and navigate voicings:

**V-System Categorization:**
- Every voicing is tagged with its V-position (V-1 through V-6) based on root string
- Allows users to filter voicings by position on the neck
- Enables "stay in position" practice by showing all voicings in a V-group

**String Group Organization:**
- Top 4 strings: Bright, clear voicings (good for comping)
- Inner 4 strings: Balanced, warm voicings
- Bottom 4 strings: Full, bass-heavy voicings

**Inversion Mapping:**
- Track all inversions for each voicing type
- Enable users to explore root position → 1st → 2nd → 3rd inversions
- Show how inversions move up the neck

```typescript
// lib/guitar/v-system.ts

// Get all voicings in a specific V-position
function getVoicingsByVSystem(
  chord: Chord,
  vPosition: VSystemPosition
): GuitarVoicing[]

// Get voicings organized by string group
function getVoicingsByStringGroup(
  chord: Chord,
  stringGroup: StringGroup
): GuitarVoicing[]

// Get all inversions of a voicing type
function getAllInversions(
  chord: Chord,
  voicingStructure: VoicingStructure,
  stringGroup: StringGroup
): GuitarVoicing[]
```

### Phase 2.6: Voice Leading Engine

Voice leading is the art of moving smoothly between chords with minimal finger movement. This is a core principle in Ted Greene's teaching.

```typescript
// lib/guitar/voice-leading.ts

interface VoiceLeadingOptions {
  maxMovement: number;        // Max frets any single voice moves (default: 2)
  preferCommonTones: boolean; // Prioritize voicings sharing notes
  allowPositionJump: boolean; // Allow large position shifts if smoother
}

// Find the best next voicing based on voice leading principles
function getVoiceLeadingOptions(
  currentVoicing: GuitarVoicing,
  nextChord: Chord,
  options: VoiceLeadingOptions
): GuitarVoicing[]

// Calculate voice leading "cost" between two voicings
function calculateVoiceLeadingDistance(
  from: GuitarVoicing,
  to: GuitarVoicing
): number

// Get optimal voicing path through a progression
function getOptimalVoicingPath(
  progression: Progression,
  startingVoicing: GuitarVoicing,
  options: VoiceLeadingOptions
): GuitarVoicing[]
```

**Voice Leading Principles:**
1. **Common tones**: Keep notes that appear in both chords on the same string
2. **Contrary motion**: Move voices in opposite directions when possible
3. **Minimal movement**: Prefer half-step and whole-step movements
4. **Avoid jumps**: Large interval jumps in any voice are penalized
5. **Bass movement**: Allow more freedom in bass for harmonic clarity

### Phase 3: UI Integration

**Display Component:**

```
components/
  voicings/
    VoicingSelector.tsx    # UI to browse/select voicings
    VoicingOverlay.tsx     # Fretboard overlay for voicing shape
    VoicingDiagram.tsx     # Standalone chord diagram (optional)
```

**State Management:**

```typescript
// state/slices/voicingSlice.ts

interface VoicingState {
  showVoicings: boolean;
  selectedVoicingIndex: number;
  availableVoicings: GuitarVoicing[];

  // Basic filters
  voicingFilter: {
    types: GuitarVoicingType[];
    maxDifficulty: 'beginner' | 'intermediate' | 'advanced';
    maxFretStretch: number;
  };

  // Ted Greene V-System filters
  vSystemFilter: {
    positions: VSystemPosition[];     // e.g., ['V-5', 'V-6'] for bass-string roots
    stringGroups: StringGroup[];      // e.g., ['top4'] for bright voicings
    structures: VoicingStructure[];   // e.g., ['drop2', 'drop3']
    inversions: (0 | 1 | 2 | 3)[];   // Which inversions to show
  };

  // Voice leading state
  voiceLeading: {
    enabled: boolean;                 // Auto-suggest voice-led voicings
    showPath: boolean;                // Highlight movement lines between voicings
    maxMovement: number;              // Max fret movement per voice (default: 2)
    suggestedVoicings: GuitarVoicing[]; // Voice-led suggestions for next chord
  };
}
```

---

## Implementation Plan

### Milestone 1: Core Data & Generation ✅
- [x] Define `GuitarVoicing` types in `lib/types.ts` (including V-System fields)
- [x] Create `lib/guitar/voicings.ts` with voicing generator
- [x] Add open chord shape templates (C, A, G, E, D families)
- [x] Add barre chord templates (E-shape, A-shape)
- [x] Add shell voicing templates for 7th chords
- [x] Add drop2/drop3 voicing generators
- [x] Write tests for voicing generation

### Milestone 2: Ted Greene V-System Framework ✅
- [x] Create `lib/guitar/v-system.ts` with V-System utilities
- [x] Implement V-position categorization for all voicings
- [x] Add string group classification
- [x] Implement inversion tracking
- [x] Create `getVoicingsByVSystem()` and related functions
- [x] Write tests for V-System categorization

### Milestone 3: State & Integration ✅
- [x] Create `voicingSlice.ts` in state store
- [x] Add V-System filter state
- [x] Connect voicing generation to current chord changes
- [x] Generate voicings when `currentChord` updates
- [x] Cache voicings to avoid recalculation

### Milestone 4: Fretboard Display ✅
- [x] Extend `FretNote` with `isVoicingNote` flag
- [x] Update `Fretboard.tsx` to highlight voicing positions
- [x] Add visual distinction (border, glow, or shape outline)
- [x] Show finger numbers on voicing notes (optional toggle)
- [x] Connect voicing lines between notes (optional)

### Milestone 5: UI Controls ✅
- [x] Create `VoicingControlsPanel` component
- [x] Add voicing type filter (open, barre, shell, etc.)
- [x] Add V-System filter panel (V-1 through V-6, string groups)
- [x] Previous/Next voicing navigation
- [x] Keyboard shortcuts (`V` to toggle, `[` `]` to cycle voicings)
- [x] Add to display controls panel (TransportDrawer)

### Milestone 6: Voice Leading Engine
- [ ] Create `lib/guitar/voice-leading.ts`
- [ ] Implement `calculateVoiceLeadingDistance()` scoring
- [ ] Implement `getVoiceLeadingOptions()` for next-chord suggestions
- [ ] Implement `getOptimalVoicingPath()` for full progressions
- [ ] Add voice leading toggle to UI
- [ ] Show voice leading suggestions during playback
- [ ] Visualize voice movement (optional lines between notes)

### Milestone 7: Polish & Extras
- [ ] Add voicing difficulty indicators
- [ ] Show voicing name/type label with V-System info
- [ ] Persist voicing preferences (including V-System filters)
- [ ] Add chord diagram view (traditional box notation)
- [ ] Add "chord scale" view (same shape moving up the neck)

---

## Key Files to Modify

| File | Changes |
|------|---------|
| `lib/types.ts` | Add `GuitarVoicing`, V-System types, voice leading types |
| `lib/guitar/voicings.ts` | New file - voicing generation logic |
| `lib/guitar/v-system.ts` | New file - V-System categorization & queries |
| `lib/guitar/voice-leading.ts` | New file - voice leading engine |
| `lib/fretboard.ts` | Add `getVoicingFretNotes()` function |
| `state/store.ts` | Add voicing slice with V-System filters |
| `components/fretboard/Fretboard.tsx` | Render voicing overlay |
| `components/voicings/VoicingSelector.tsx` | New component with V-System filters |
| `components/voicings/VoiceLeadingIndicator.tsx` | New component - shows movement between voicings |
| `app/page.tsx` | Connect voicing state to fretboard |

---

## UI/UX Considerations

### Visual Design
- **Voicing notes**: Use distinct styling (e.g., ring/outline + fill color)
- **Muted strings**: Show "X" above nut
- **Open strings**: Show "O" above nut
- **Finger numbers**: Small numbers inside dots (1-4, T for thumb)
- **Barre indicator**: Connected line across strings

### Interaction
- Tap/click voicing selector to open panel
- Swipe or arrow keys to cycle voicings
- Auto-advance voicing when chord changes (optional setting)
- Long-press voicing note to hear just that note

### Responsive
- Mobile: Compact voicing selector, fewer simultaneous voicings
- Desktop: Can show chord diagram alongside fretboard

### V-System Filter UI

```
┌─────────────────────────────────────────────────┐
│ Voicing Filter                            [×]   │
├─────────────────────────────────────────────────┤
│ Root Position (V-System):                       │
│ [V-1] [V-2] [V-3] [V-4] [●V-5] [●V-6]          │
│                                                 │
│ String Group:                                   │
│ [●Top 4] [Inner 4] [●Bottom 4] [Spread]        │
│                                                 │
│ Structure:                                      │
│ [●Close] [●Drop 2] [Drop 3] [Spread]           │
│                                                 │
│ Inversion:                                      │
│ [●Root] [●1st] [●2nd] [3rd]                    │
│                                                 │
│ Difficulty: [Beginner ▼]                        │
└─────────────────────────────────────────────────┘
```

### Voice Leading Indicator

When voice leading is enabled, show arrows or lines indicating:
- Which fingers stay in place (common tones)
- Direction and distance of movement for each voice
- Suggested fingering transitions

```
Current: Dm7 (V-5)        Next: G7 (V-6)
    ┌─────────┐              ┌─────────┐
    │ x       │              │ x       │
    │ ●───────│──────────────│→●       │  (voice moves down 1 fret)
    │ ●═══════│══════════════│═●       │  (common tone, stays)
    │ ●───────│──────────────│→●       │  (voice moves down 2 frets)
    │ x       │              │ ●       │  (new voice enters)
    │ ●       │              │ ●       │  (bass moves)
    └─────────┘              └─────────┘
```

### Chord Scale View

Show how a single voicing shape can move chromatically up the neck:

```
Cmaj7 Shell (V-5) moving up the neck:
┌────────────────────────────────────────────────┐
│     Cmaj7    C#maj7   Dmaj7    D#maj7   Emaj7  │
│ 3   ●────────●────────●────────●────────●      │
│ 4   ●────────●────────●────────●────────●      │
│ 5   ●────────●────────●────────●────────●      │
│     fret 3   fret 4   fret 5   fret 6   fret 7 │
└────────────────────────────────────────────────┘
```

---

## Example Voicing Templates

### Cmaj7 Voicings

```
Open Position:        Barre (3rd fret):     Shell (8th fret):
x                     x                     x
0 (B - maj7)          3 (G - 5th)           8 (B - maj7)
0 (E - 3rd)           5 (C - root)          9 (E - 3rd)
0 (C - root)          4 (E - 3rd)           10 (C - root)
2 (B - maj7)          5 (G - 5th)           x
3 (C - root)          3 (C - root)          x
```

### Voicing Priority Logic

1. **Open voicings first** (if chord root allows)
2. **Common barre shapes** (E-form, A-form)
3. **Shell voicings** (for 7th chords)
4. **Drop voicings** (for advanced users)

---

## Edge Cases

1. **Altered chords** (e.g., G7#9): May need algorithmic generation
2. **Slash chords** (e.g., C/G): Adjust bass note in voicing
3. **Extended chords** (e.g., Cmaj13): Show shell + optional extensions
4. **Physically impossible voicings**: Validate fret stretch (max 4 frets)
5. **Duplicate notes**: Allow same note on multiple strings for color

---

## Ted Greene Inspiration & Attribution

This feature draws organizational principles from Ted Greene's legendary work, particularly his V-System for categorizing chord voicings. We use these concepts respectfully:

**What we use (principles, not copyrightable):**
- V-System concept: organizing voicings by root string position
- String group organization (top 4, inner 4, bottom 4)
- Voice leading principles for smooth chord transitions
- Drop voicing terminology (drop2, drop3, etc.)

**What we don't copy:**
- Specific voicing diagrams from "Chord Chemistry"
- Exact fingerings or arrangements
- Any copyrighted written material

**Attribution in UI:**
- "Voicing organization inspired by Ted Greene's V-System"
- Link to tedgreene.com for users who want to learn more

**Note:** All voicings are algorithmically generated or created from standard music theory, not copied from any publication.

---

## Future Enhancements

- **Audio preview**: Play voicing when selected
- **Voicing comparison**: Show two voicings side-by-side (compare inversions)
- **Custom voicings**: Let users save their own shapes
- **Voicing library**: Browse all voicings for a chord quality by V-System position
- **Chord scales**: Show how a voicing shape moves chromatically up the neck
- **Harp harmonics**: Show voicings playable with harmonics
- **Practice mode**: Quiz user on voicing names/positions
- **Export voicing sheets**: Generate PDF chord charts
