---
title: "feat: Landing Page SEO and Polish"
type: feat
status: completed
date: 2026-03-14
deepened: 2026-03-14
origin: docs/brainstorms/2026-03-13-guided-practice-modes-brainstorm.md
---

# Landing Page SEO and Polish

## Enhancement Summary

**Deepened on:** 2026-03-14
**Research agents used:** 10 (best-practices, framework-docs, vercel-react-skill, performance-oracle, security-sentinel, architecture-strategist, typescript-reviewer, pattern-recognition, simplicity-reviewer, learnings-checker)

### Key Improvements
1. Confirmed Launcher can and should become a server component (shadcn Card has no `"use client"`)
2. Added `optimizePackageImports` for lucide-react barrel import fix
3. Added `generateStaticParams` for pre-rendering the 3 mode pages
4. Corrected OG image placement (must be in `app/`, not `public/`, for auto-detection)
5. Added `SITE_URL` shared constant to prevent env var duplication across files
6. Added `opengraph-image.alt.txt` companion file for accessibility
7. Added service worker caching considerations for landing page HTML
8. Added font loading audit recommendation (3 fonts loaded, only 1 needed on landing)

### New Considerations Discovered
- `metadataBase` must be `new URL(...)`, not a plain string — will cause type error otherwise
- `title.template` only applies to **child** segments, not the segment where it's defined
- Child `openGraph` metadata **entirely replaces** parent (shallow merge, not deep)
- `robots.txt` `Disallow` prevents crawling but not indexing — per-page `noindex` is still needed
- INP replaced FID as a Core Web Vital in March 2024

---

## Overview

Convert FretPad's root page from a client-rendered launcher into a server-rendered, SEO-friendly landing page. The existing launcher UI stays largely the same — the work is about making it crawlable, adding proper metadata, and removing the auto-resume redirect that blocks SSR.

This is Phase 2 of the guided practice modes rollout (see brainstorm: [docs/brainstorms/2026-03-13-guided-practice-modes-brainstorm.md](../brainstorms/2026-03-13-guided-practice-modes-brainstorm.md)).

## Problem Statement

1. **Search engines see nothing.** The root page is `"use client"` and renders `null` while checking localStorage. Googlebot gets an empty page.
2. **No metadata.** Title is just "FretPad", no Open Graph tags, no Twitter cards, no sitemap, no robots.txt.
3. **Auto-resume blocks rendering.** Returning users see a blank screen while JavaScript checks localStorage and redirects.
4. **Copy is minimal.** The launcher has functional descriptions but no value proposition for first-time visitors.

## Proposed Solution

### 1. Server-Render the Landing Page

Convert `app/page.tsx` from a client component to a server component. The current `"use client"` directive and localStorage check prevent any server-rendered HTML.

**What changes:**
- `app/page.tsx` becomes a server component that renders the Launcher directly
- Remove the auto-resume redirect entirely — users always see the launcher and pick a mode
- Remove `"use client"` from `Launcher.tsx` — it uses zero client-side APIs

**Key insight from learnings:** Use the server component wrapper pattern documented in `docs/solutions/logic-errors/nextjs-zustand-guided-practice-code-review.md` — server `page.tsx` handles metadata/validation, client components receive typed props. This is already the established pattern for `app/practice/[mode]/page.tsx`.

#### Research Insights

**Launcher is confirmed safe as a server component.** Pattern recognition review verified that `components/ui/card.tsx` has no `"use client"` directive — it's a purely presentational component using only `cn()` and HTML props. All Launcher dependencies (Link, Card, lucide icons, PRACTICE_MODES config) work in server components.

**After conversion, `app/page.tsx` becomes:**
```tsx
// app/page.tsx — Server Component (no "use client")
import { Launcher } from "@/components/modes/Launcher";

export default function Page() {
  return <Launcher />;
}
```

**Performance impact:** Making Launcher a server component means its Card/Icon code is excluded from the client JS bundle entirely for the `/` route. No hydration occurs on the landing page (beyond layout-level `OfflineIndicator` and `InstallPromptBanner`), eliminating any hydration mismatch risk.

### 2. Remove Auto-Resume

Delete the `fretpad-last-mode` localStorage check and auto-redirect from `app/page.tsx`. Users always land on the launcher and choose their mode.

**Rationale:** Auto-resume complicates SSR, causes blank-screen flashes, and is unnecessary — picking a mode takes one click.

**Cleanup:**
- Remove `fretpad-last-mode` localStorage read from `app/page.tsx`
- Remove the `checked` state gate and `null` render
- Keep `fretpad-last-mode` writes in the practice page (could be useful for future "Continue" feature)

### 3. SEO Metadata

**Shared URL constant (`lib/config.ts`):**

Extract the site URL to a single source of truth to prevent divergence between files:

```typescript
// lib/config.ts
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
```

#### Research Insights

**`metadataBase` must be a `URL` object**, not a string — plain strings cause a type error:
```typescript
// CORRECT
metadataBase: new URL(SITE_URL),
// WRONG — type error
metadataBase: SITE_URL,
```

**`title.template` only applies to child segments**, not the segment where it's defined. So `title.template: "%s | FretPad"` in `layout.tsx` will format titles from `page.tsx` children but not the layout's own `title.default`.

**OG metadata shallow merges.** A child segment's `openGraph` object entirely replaces the parent's. If a practice page sets its own `openGraph`, it loses the parent's `siteName`, `locale`, etc. Since practice pages will be `noindex`, this is not a concern here.

**Let Next.js inherit Twitter from OG.** Setting `twitter.card` is sufficient — Next.js auto-populates `twitter:title` and `twitter:description` from `openGraph` values. Don't duplicate them.

**Root layout (`app/layout.tsx`):**

```typescript
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/config";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "FretPad — Guitar Practice Tool for Improvisation",
    template: "%s | FretPad",
  },
  description: "Practice guitar improvisation over chord progressions with a visual fretboard, backing tracks, and on-demand music theory.",
  openGraph: {
    type: "website",
    siteName: "FretPad",  // keep consistent with manifest.json name
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FretPad",
  },
};
```

**Practice pages (`app/practice/[mode]/page.tsx`):**

```typescript
import type { Metadata } from "next";
import { PRACTICE_MODES, isValidModeId } from "@/lib/modes";
import type { PracticeModeId } from "@/lib/types";

type Props = {
  params: Promise<{ mode: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { mode } = await params;
  if (!isValidModeId(mode)) return {};
  const config = PRACTICE_MODES[mode as PracticeModeId];
  return {
    title: config.label,
    robots: { index: false, follow: false },
  };
}
```

**Why `noindex` is needed even with `robots.txt` Disallow:** `robots.txt` `Disallow` prevents crawling, not indexing. If other pages link to a disallowed URL, Google may still index it (showing "No information is available for this page"). Per-page `robots` metadata is the authoritative noindex signal.

### 4. Static SEO Files

**`app/robots.ts`:**
```typescript
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/practice/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
```

**`app/sitemap.ts`:**
```typescript
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
```

#### Research Insights

**Both files are cached by default** by Next.js (since v13.3.0) unless they use a Dynamic API. For a static site like this, they are evaluated once at build time — no runtime cost.

**Simplicity note:** The simplicity reviewer argued these are YAGNI for a 2-route app. They are minimal effort (< 10 lines each) and prevent crawl budget waste on practice pages. Keep them.

### 5. OG Image

Create a static OG image at `app/opengraph-image.png` (1200×630px). Simple branded card:
- FretPad name
- Tagline: "See the right notes while hearing the chords"
- Dark background matching the app theme (`#0a0a0a`)
- Guitar/music visual element

Also create `app/opengraph-image.alt.txt` containing: `FretPad — Guitar practice tool for improvisation over chord progressions`

This is a placeholder — replace with a designed asset later.

#### Research Insights

**Must be in `app/`, not `public/`.** The `app/opengraph-image.png` file convention triggers Next.js to automatically inject `<meta property="og:image">` with correct dimensions and content type. Files in `public/` require manual wiring in the metadata export.

**File-based metadata has higher priority** than the `metadata` object and `generateMetadata` function. So the `app/opengraph-image.png` will be used even if `openGraph.images` is also set in metadata.

**Size limits:** `opengraph-image` max 8MB, `twitter-image` max 5MB. A separate `twitter-image.png` is not needed — Next.js uses the OG image for Twitter if no Twitter image is specified.

**Consider excluding from service worker precache.** If the OG image exceeds 100KB, exclude it from Serwist precaching via the `exclude` option in `next.config.ts`. OG images are only fetched by social crawlers, not by end users — no need to precache them.

### 6. Polish Launcher Copy

Enhance the launcher with better copy while keeping the current layout:

**Title area:**
- Keep "FretPad" as h1
- Change subtitle from "What do you want to practice today?" to a value proposition: "See the right notes while hearing the chords"
- Add a secondary line: "Choose how you want to practice"

**Mode cards:**
- Keep current icons and labels
- Expand descriptions slightly with what the user will actually do, not just the abstract job

### 7. Responsive Polish

The launcher already uses `grid-cols-1 sm:grid-cols-3`. Minor improvements:
- Ensure cards have consistent heights across breakpoints
- Check spacing on small screens (320px minimum)
- Test the layout at all standard breakpoints

## Technical Considerations

### Tone.js Isolation

Tone.js is already code-split by route — it's only imported in practice page components. The landing page must not import any component from the practice page tree. This is already true and should remain so.

**Verification:** After implementation, check the landing page bundle does not include Tone.js:
```bash
pnpm build && grep -r "tone" .next/static/chunks/app/page-*.js 2>/dev/null
```

#### Research Insights

**The code-splitting boundary is at the route level.** Since `app/page.tsx` will no longer be a client component and will not import anything from the practice tree, Tone.js stays out naturally. However, the layout (`app/layout.tsx`) must also not import any audio-related modules — currently it only imports `InstallPromptBanner` and `OfflineIndicator`, which are safe.

**Future protection:** Consider adding a comment at the top of `app/page.tsx` documenting this boundary, so future contributors don't accidentally import practice components.

### Launcher Component — Server Component (Confirmed)

Remove `"use client"` from `Launcher.tsx`. This is a one-line deletion, not a conversion.

**Verified safe:** Pattern recognition review confirmed that `components/ui/card.tsx` has no `"use client"` directive. All dependencies (Link, Card/CardContent, lucide-react icons, PRACTICE_MODES config) work in server components.

### Fix Lucide-React Barrel Imports

The Launcher imports icons via barrel: `import { Eye, Guitar, Music } from "lucide-react"`. This pulls in the entire lucide-react module graph.

**Fix:** Add `lucide-react` to `optimizePackageImports` in `next.config.ts`:

```typescript
// next.config.ts
const nextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  // ... existing config
};
```

This is especially important now that the Launcher becomes a server component — without optimization, the entire lucide-react package would be processed server-side.

### Add `generateStaticParams` for Practice Pages

Pre-render the 3 known mode pages at build time:

```typescript
// app/practice/[mode]/page.tsx
import { PRACTICE_MODE_IDS } from "@/lib/modes";

export function generateStaticParams() {
  return PRACTICE_MODE_IDS.map((mode) => ({ mode }));
}
```

This enables static generation of the server component shell (validation + metadata) for each mode. The client `PracticePage` still hydrates dynamically. Low-cost optimization for a fixed set of 3 routes.

### Font Loading Audit

The root layout loads 3 Google Fonts: `Inter`, `Geist`, and `Geist_Mono`. Each font declaration adds a preloaded woff2 file (20-40KB each). The landing page likely only needs `Inter`.

**Recommendation:** Audit which fonts are used on the landing page. Consider whether `Geist` and `Geist_Mono` could be moved to a practice route group layout if they're only used there. At minimum, verify `next/font/google` is using `display: swap` (the default) to avoid font-related LCP delay.

### Service Worker Cache

The existing Serwist config uses `skipWaiting` and `clientsClaim`. After deploying Phase 2, returning PWA users will get the new server-rendered page after the service worker updates. There may be one stale load — this is acceptable.

#### Research Insights

**Verify navigation caching strategy.** For SEO safety, the landing page HTML should use a `NetworkFirst` or `StaleWhileRevalidate` strategy, never `CacheFirst`. If Serwist's `defaultCache` uses `CacheFirst` for navigation requests, stale HTML could be served indefinitely. Check `app/sw.ts` configuration.

**Crawlers and service workers:** Googlebot executes JavaScript but typically does not persist service worker registrations across crawls. The main risk is users sharing URLs — if their cached version is stale, the shared content may be outdated. `NetworkFirst` solves this.

### Environment Variable

Add `NEXT_PUBLIC_SITE_URL` to:
- `.env.example` with `http://localhost:3000` (this will be the project's first env variable file)
- Production deployment config (Vercel, etc.)

#### Research Insights

**Pattern note:** This will be the project's first user-defined environment variable. Currently only `process.env.NODE_ENV` is referenced (in `next.config.ts`). Establishing the `.env.example` convention now sets the pattern for future variables.

**Security note (from security review):** `NEXT_PUBLIC_` prefix means the value is bundled into client-side JavaScript. This is fine since it holds a public website URL. The security review confirmed overall risk is LOW — no secrets exposed.

## Acceptance Criteria

- [x] Root page (`/`) is server-rendered — view source shows HTML content
- [x] `"use client"` removed from both `app/page.tsx` and `Launcher.tsx`
- [x] Auto-resume redirect removed — launcher always renders
- [x] Landing page has clear value prop copy
- [x] `<title>` is keyword-rich (e.g., "FretPad — Guitar Practice Tool for Improvisation")
- [x] Open Graph tags present: `og:title`, `og:description`, `og:image`, `og:type`
- [x] Twitter card meta present: `twitter:card` set to `summary_large_image`
- [x] Static OG image exists at `app/opengraph-image.png` (1200×630) with alt text file
- [x] `robots.txt` served at `/robots.txt` — disallows `/practice/`
- [x] `sitemap.xml` served at `/sitemap.xml` — includes only `/`
- [x] Practice pages have `noindex` robots meta via `generateMetadata`
- [x] Practice pages have mode-specific titles via `generateMetadata`
- [x] Practice pages have `generateStaticParams` for the 3 modes
- [x] `SITE_URL` constant extracted to `lib/config.ts`, used in robots.ts and sitemap.ts
- [x] `NEXT_PUBLIC_SITE_URL` env var documented in `.env.example`
- [x] `metadataBase` uses `new URL(SITE_URL)` (not a plain string)
- [x] `lucide-react` added to `optimizePackageImports` in `next.config.ts`
- [x] Mobile layout: cards stack vertically, no horizontal scroll, readable on 320px
- [x] Tone.js not in landing page bundle (verified via build output)
- [x] `pnpm validate` passes

## Key Files

### Create

| File | Purpose |
|------|---------|
| `app/robots.ts` | Dynamic robots.txt via Next.js convention |
| `app/sitemap.ts` | Dynamic sitemap.xml via Next.js convention |
| `app/opengraph-image.png` | Static OG image placeholder (1200×630) |
| `app/opengraph-image.alt.txt` | Alt text for OG image |
| `lib/config.ts` | Shared `SITE_URL` constant |
| `.env.example` | Document `NEXT_PUBLIC_SITE_URL` |

### Modify

| File | Change |
|------|--------|
| `app/page.tsx` | Remove `"use client"`, remove auto-resume, render Launcher directly as server component |
| `app/layout.tsx` | Add `metadataBase`, `openGraph`, `twitter`, `title.template`, expanded `description` |
| `components/modes/Launcher.tsx` | Remove `"use client"`, update copy (value prop, better mode descriptions) |
| `app/practice/[mode]/page.tsx` | Add `generateMetadata` with mode-specific titles and `noindex`, add `generateStaticParams` |
| `next.config.ts` | Add `optimizePackageImports: ["lucide-react"]` |

### No Changes Needed

| File | Why |
|------|-----|
| Audio engine files | Tone.js already isolated by route |
| `app/manifest.json` | PWA config is fine as-is |
| `state/` | No store changes needed |
| `hooks/` | No hook changes needed |
| `lib/modes.ts` | Mode configs are already usable from server components |

## Sources & References

### Origin

- **Brainstorm document:** [docs/brainstorms/2026-03-13-guided-practice-modes-brainstorm.md](../brainstorms/2026-03-13-guided-practice-modes-brainstorm.md) — Key decisions: modes-first execution, landing page for SEO, targeting "guitar practice tool" keywords.
- **Parent plan:** [docs/plans/2026-03-13-001-feat-guided-practice-modes-plan.md](2026-03-13-001-feat-guided-practice-modes-plan.md) — Phase 2 section.

### Internal References

- Server component wrapper pattern: `docs/solutions/logic-errors/nextjs-zustand-guided-practice-code-review.md`
- Current launcher: `components/modes/Launcher.tsx`
- Current root page: `app/page.tsx`
- Current layout metadata: `app/layout.tsx:19-29`
- Mode configs: `lib/modes.ts`
- Practice page: `app/practice/[mode]/page.tsx`
- PWA manifest: `app/manifest.json`
- Service worker config: `next.config.ts`
- shadcn Card component (no `"use client"`): `components/ui/card.tsx`

### External References

- [Next.js Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Next.js robots.txt Convention](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots)
- [Next.js sitemap.xml Convention](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)
- [Next.js opengraph-image Convention](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image)
- [Next.js generateStaticParams](https://nextjs.org/docs/app/api-reference/functions/generate-static-params)
- [Core Web Vitals 2026: INP, LCP & CLS](https://www.digitalapplied.com/blog/core-web-vitals-2026-inp-lcp-cls-optimization-guide)
