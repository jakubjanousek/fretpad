# PWA & iPad Offline Improvements

Enhancements to make FretFlow a polished offline-capable PWA, especially on iPad/iOS.

## Current State

- [x] Service worker (Serwist) with precaching and runtime caching
- [x] Web manifest with standalone display mode
- [x] Apple Web App meta tags in layout
- [x] All audio synthesized client-side (Tone.js) — no network samples
- [x] AudioContext started on user gesture (play button)
- [x] AudioContext state tracking in `useAudioEngine.ts`

---

## Improvements

### P0 — Wake Lock

**File:** `hooks/useAudioEngine.ts`

Prevent the iPad screen from dimming during practice. Without this, the screen auto-locks mid-session and audio stops.

- [x] Request `navigator.wakeLock.request("screen")` when playback starts
- [x] Release wake lock when playback stops
- [x] Re-acquire on `visibilitychange` (Safari releases it when tab is backgrounded)
- [x] Fail silently if API is unavailable (supported Safari 16.4+)

### P0 — AudioContext Interruption Recovery

**Files:** `hooks/useAudioEngine.ts`, `components/transport/`

On iOS, the AudioContext suspends on phone calls, app switches, lock screen. The app should recover gracefully.

- [ ] Detect `AudioContext.state` transition to `"interrupted"` / `"suspended"` during playback
- [ ] Show a "Tap to resume" overlay when audio is interrupted
- [ ] Auto-resume AudioContext and Transport on user tap
- [ ] Restore playback position (or restart from current bar)

### P1 — Install Prompt

**Files:** `components/` (new component), `app/layout.tsx`

Safari doesn't show install banners. Guide users to add the app to their home screen.

- [ ] Create `InstallPromptBanner` component
- [ ] Detect standalone mode via `window.matchMedia("(display-mode: standalone)")`
- [ ] Show dismissable hint on first visit in browser mode: "Add to Home Screen for the best experience"
- [ ] Persist dismissal in `localStorage`
- [ ] Only show on iOS/iPadOS (detect via user agent)

### P1 — Offline Indicator

**Files:** `components/` (new component), `app/layout.tsx`

Subtle feedback so users know they're running from cache.

- [ ] Create `OfflineIndicator` component
- [ ] Listen to `online` / `offline` events
- [ ] Show a small badge or toast when offline
- [ ] Auto-dismiss when back online

### P2 — Safe Area & Standalone Viewport

**Files:** `app/globals.css`, `app/layout.tsx`

In standalone mode on iPad (rounded corners, no Safari chrome), content can be clipped.

- [ ] Add `viewport-fit=cover` to viewport meta
- [ ] Apply `env(safe-area-inset-*)` padding to root layout
- [ ] Test in standalone mode on iPad with notch/rounded corners

### P2 — Touch Target Audit

**Files:** `components/fretboard/`, `components/transport/`

Ensure all interactive elements meet the 44×44pt minimum (Apple HIG).

- [ ] Audit fretboard note dots — ensure tap targets are at least 44×44pt
- [ ] Audit transport controls (play, stop, tempo, metronome toggle)
- [ ] Audit progression editor chord cells
- [ ] Add padding/hit areas where needed without changing visual size
