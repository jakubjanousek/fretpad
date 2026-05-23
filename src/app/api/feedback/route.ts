import { put } from "@vercel/blob";
import { checkBotId } from "botid/server";
import { NextResponse } from "next/server";
import { SITE_URL } from "@/lib/config";

const MAX_COMMENT_LENGTH = 1000;
const MAX_MODE_LENGTH = 100;
const MIN_TEMPO = 20;
const MAX_TEMPO = 400;
const MAX_LOOP_COUNT = 100_000;

interface FeedbackEntry {
  rating: "up" | "down";
  comment?: string;
  mode?: string;
  tempo?: number;
  loopCount?: number;
}

/** Rejects requests whose Origin isn't this site — blocks casual cross-site abuse. */
function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;

  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    return false;
  }

  const allowedHosts = new Set<string>();
  try {
    allowedHosts.add(new URL(request.url).host);
  } catch {
    // request.url should always be valid; ignore if not
  }
  try {
    allowedHosts.add(new URL(SITE_URL).host);
  } catch {
    // SITE_URL should always be valid; ignore if not
  }

  return allowedHosts.has(originHost);
}

/**
 * Builds a feedback entry from untrusted input, returning null if anything is
 * invalid. Only known fields are copied through, so a caller cannot inflate the
 * stored blob with arbitrary keys.
 */
function parseFeedback(body: unknown): FeedbackEntry | null {
  if (typeof body !== "object" || body === null) return null;
  const b = body as Record<string, unknown>;

  if (b.rating !== "up" && b.rating !== "down") return null;
  const entry: FeedbackEntry = { rating: b.rating };

  if (b.comment !== undefined) {
    if (
      typeof b.comment !== "string" ||
      b.comment.length > MAX_COMMENT_LENGTH
    ) {
      return null;
    }
    entry.comment = b.comment;
  }

  if (b.mode !== undefined) {
    if (typeof b.mode !== "string" || b.mode.length > MAX_MODE_LENGTH) {
      return null;
    }
    entry.mode = b.mode;
  }

  if (b.tempo !== undefined) {
    if (
      typeof b.tempo !== "number" ||
      !Number.isFinite(b.tempo) ||
      b.tempo < MIN_TEMPO ||
      b.tempo > MAX_TEMPO
    ) {
      return null;
    }
    entry.tempo = b.tempo;
  }

  if (b.loopCount !== undefined) {
    if (
      typeof b.loopCount !== "number" ||
      !Number.isInteger(b.loopCount) ||
      b.loopCount < 0 ||
      b.loopCount > MAX_LOOP_COUNT
    ) {
      return null;
    }
    entry.loopCount = b.loopCount;
  }

  return entry;
}

export async function POST(request: Request) {
  const verification = await checkBotId();
  if (verification.isBot) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid feedback" }, { status: 400 });
  }

  const entry = parseFeedback(body);
  if (!entry) {
    return NextResponse.json({ error: "Invalid feedback" }, { status: 400 });
  }

  const record = { ...entry, timestamp: new Date().toISOString() };
  const filename = `feedback/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.json`;

  await put(filename, JSON.stringify(record), {
    access: "private",
    contentType: "application/json",
  });

  return NextResponse.json({ ok: true });
}
