---
title: "feat: Mode-Aware URL Sharing"
type: feat
status: active
date: 2026-03-14
origin: docs/plans/2026-03-13-001-feat-guided-practice-modes-plan.md
deepened: 2026-03-14
---

# Mode-Aware URL Sharing

Phase 4 of the Guided Practice Modes plan. Add mode awareness to shared URLs so recipients land in the correct practice mode with the correct progression.

(see origin: [docs/plans/2026-03-13-001-feat-guided-practice-modes-plan.md](2026-03-13-001-feat-guided-practice-modes-plan.md), Phase 4)

## Enhancement Summary

**Deepened on:** 2026-03-14
**Agents used:** TypeScript reviewer, frontend races reviewer, architecture strategist, code simplicity reviewer, security sentinel, pattern recognition specialist, best practices researcher

### Key Improvements
1. **Dropped client-side `useEffect` redirect** — use server-side `redirect()` in `app/page.tsx` instead (consistent with existing codebase pattern of server components handling validation/routing)
2. **Fixed type mismatch** — accept `PracticeModeId | null` directly instead of `?? undefined` coercion at call sites
3. **Extracted default mode constant** — `DEFAULT_SHARE_MODE` in `lib/modes.ts` prevents shotgun surgery
4. **Added testability** — optional `origin` parameter on `generateShareUrl` eliminates `window.location` mocking in tests
5. **Identified race condition** — if redirect is ever done client-side, it must be merged with the existing auto-resume effect to avoid dual `router.replace` race

### Learnings Applied
- From `docs/solutions/logic-errors/nextjs-zustand-guided-practice-code-review.md`: Server components handle validation/routing, client components receive clean props. The redirect follows this pattern.
- From `docs/solutions/performance-issues/zustand-mode-switching-render-cascade.md`: Type safety at persistence boundaries — `mode` field should preserve `PracticeModeId` type, not widen to `string`.

---

## Problem

`generateShareUrl()` builds URLs from `window.location.href` and encodes `{ progression, tempo }` into the `?p=` param. Because it uses the current page URL as base, shared URLs already include the `/practice/[mode]` path — this works. But:

1. Old pre-mode URLs (`fretpad.app/?p=...`) have no `/practice/` path and break.
2. If `ShareExport` is ever rendered outside a practice page (e.g. launcher, full editor), the generated URL won't have a mode path.

## Proposed Solution

The mode belongs in the **URL path**, not in the encoded `?p=` blob. `ShareableState` stays unchanged — no new fields, no dual-source-of-truth. This follows REST-like semantics: path = what you're doing (mode), query = parameterization (progression/tempo).

### 1. Extract default mode constant

```typescript
// lib/modes.ts
export const DEFAULT_SHARE_MODE: PracticeModeId = "outline-chord-changes";
```

The default appears in `generateShareUrl` and the old-URL redirect. A named constant makes the design decision explicit and prevents the value from diverging across locations.

### 2. Update `generateShareUrl` to use explicit path

```typescript
// lib/persistence/urlState.ts
import type { PracticeModeId } from "../types";
import { DEFAULT_SHARE_MODE } from "../modes";

export function generateShareUrl(
  state: ShareableState,
  mode: PracticeModeId | null,
  origin?: string,
): string {
  const encoded = encodeStateToUrl(state);
  const url = new URL(origin ?? window.location.origin);
  url.pathname = `/practice/${mode ?? DEFAULT_SHARE_MODE}`;
  url.searchParams.set(URL_PARAM, encoded);
  return url.toString();
}
```

Changes from current:
- **`window.location.origin`** instead of `window.location.href` — constructs the URL explicitly rather than inheriting the current page path. `getStateFromUrl` and `clearUrlState` correctly keep using `href` (they operate on the current page).
- **`mode: PracticeModeId | null`** — matches the store's `activeMode` type directly. No `?? undefined` coercion needed at call sites.
- **`origin?: string`** — optional parameter for testability. Tests pass an explicit origin instead of mocking `window.location`. Production code omits it and falls through to `window.location.origin`.

### 3. Update `ShareExport` to pass active mode

```typescript
// components/progression/ShareExport.tsx
const activeMode = useAppStore((state) => state.activeMode);

const handleCopyUrl = async () => {
  const url = generateShareUrl({ progression, tempo }, activeMode);
  // ...
};
```

Clean call site — `activeMode` is `PracticeModeId | null`, which matches the function signature exactly.

### 4. Handle old URLs at root (server-side redirect)

Old URLs like `fretpad.app/?p=...` need to redirect. Use server-side `redirect()` in `app/page.tsx` — consistent with the existing pattern of server components handling validation/routing (same pattern as `app/practice/[mode]/page.tsx` calling `notFound()`).

```typescript
// app/page.tsx (Server Component)
import { redirect } from "next/navigation";
import { DEFAULT_SHARE_MODE } from "@/lib/modes";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ p?: string }>;
}) {
  const { p } = await searchParams;
  if (p) {
    redirect(`/practice/${DEFAULT_SHARE_MODE}?p=${encodeURIComponent(p)}`);
  }
  return <Launcher />;
}
```

**Why server-side, not client-side `useEffect`:**
- No flash of launcher content before redirect
- No race condition with the existing auto-resume `useEffect` (which also calls `router.replace`)
- Consistent with the codebase pattern: server components validate and route, client components receive clean props
- `encodeURIComponent` prevents malformed URLs from `&` or `#` characters in the `p` value

**Why not `next.config.ts` redirects:** The `?p=` query param needs to be forwarded, and we need to read its value to determine whether to redirect. `next.config.ts` redirects can't conditionally fire based on query param presence.

**Why not middleware:** Overkill for a single redirect rule. Middleware is better suited for large redirect maps or auth-gated redirects.

## Edge Cases

- **`activeMode` is `null` during first render:** `ShareExport` renders inside `PracticePage`, which calls `enterMode()` in a `useEffect`. Before the effect fires, `activeMode` is `null`. The user cannot click the share button before React paints, so `activeMode` will be set by the time the click handler runs. The `null` fallback to `DEFAULT_SHARE_MODE` is a safety net, not a normal code path.
- **`[mode]` route changes and `useUrlState`:** `hasLoadedRef` in `useUrlState` is per-mount. Changing the `[mode]` param in Next.js dynamic routes causes a remount of `PracticePage`, so the ref resets correctly. No `key` prop needed.
- **`clearUrlState` uses `history.replaceState`:** This bypasses the Next.js router, creating a minor desync between the router's internal state and the browser URL. This is a pre-existing concern, not introduced by this plan.

## Acceptance Criteria

- [ ] `DEFAULT_SHARE_MODE` constant exported from `lib/modes.ts`
- [ ] `generateShareUrl` accepts `mode: PracticeModeId | null` and optional `origin`, builds `/practice/[mode]` URLs (`lib/persistence/urlState.ts`)
- [ ] `ShareExport` passes `activeMode` to `generateShareUrl` (`components/progression/ShareExport.tsx`)
- [ ] Old URLs at `/?p=...` redirect server-side to `/practice/${DEFAULT_SHARE_MODE}?p=...` (`app/page.tsx`)
- [ ] Old encoded `?p=` blobs (without mode) still decode correctly (no changes to `ShareableState`)
- [ ] Recipients land in correct mode with correct progression and tempo
- [ ] Tests cover: mode in URL path, null mode fallback, origin parameter, roundtrip with mode (`__tests__/lib/persistence/urlState.test.ts`)
- [ ] `pnpm validate` passes

## Test Plan

Currently zero tests exist for `generateShareUrl`. Add:

```typescript
describe("generateShareUrl", () => {
  it("builds URL with explicit mode in path", () => {
    const url = generateShareUrl(sampleState, "learn-the-neck", "https://fretpad.app");
    expect(url).toMatch(/^https:\/\/fretpad\.app\/practice\/learn-the-neck\?p=/);
  });

  it("falls back to default mode when mode is null", () => {
    const url = generateShareUrl(sampleState, null, "https://fretpad.app");
    expect(url).toContain("/practice/outline-chord-changes");
  });

  it("preserves encoded state in query param", () => {
    const url = generateShareUrl(sampleState, "comp-with-voicings", "https://fretpad.app");
    const parsed = new URL(url);
    const encoded = parsed.searchParams.get("p");
    expect(encoded).toBeTruthy();
    const decoded = decodeStateFromUrl(encoded!);
    expect(decoded?.tempo).toBe(sampleState.tempo);
  });
});
```

## Files to Modify

- `lib/modes.ts` — add `DEFAULT_SHARE_MODE` constant
- `lib/persistence/urlState.ts` — update `generateShareUrl` signature and implementation
- `lib/persistence/index.ts` — no changes needed (re-export signature is compatible)
- `components/progression/ShareExport.tsx` — pass `activeMode` to `generateShareUrl`
- `app/page.tsx` — add server-side redirect for `?p=` URLs
- `__tests__/lib/persistence/urlState.test.ts` — add `generateShareUrl` test suite

## Sources

- **Origin plan:** [docs/plans/2026-03-13-001-feat-guided-practice-modes-plan.md](2026-03-13-001-feat-guided-practice-modes-plan.md) — Phase 4
- **Learnings:** [docs/solutions/logic-errors/nextjs-zustand-guided-practice-code-review.md](../solutions/logic-errors/nextjs-zustand-guided-practice-code-review.md) — server component validation pattern
- **Learnings:** [docs/solutions/performance-issues/zustand-mode-switching-render-cascade.md](../solutions/performance-issues/zustand-mode-switching-render-cascade.md) — type safety at boundaries
- Current URL state: `lib/persistence/urlState.ts`
- Share component: `components/progression/ShareExport.tsx`
- Practice page (URL + mode integration): `app/practice/[mode]/PracticePage.tsx:50-74`
- Mode slice: `state/slices/practiceModeSlice.ts`
- Next.js `redirect()` docs: https://nextjs.org/docs/app/api-reference/functions/redirect
- Next.js redirecting guide: https://nextjs.org/docs/app/guides/redirecting
