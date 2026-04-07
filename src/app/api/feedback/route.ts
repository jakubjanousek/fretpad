import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

interface FeedbackPayload {
  rating: "up" | "down";
  comment?: string;
  mode?: string;
  tempo?: number;
  loopCount?: number;
}

function isValidPayload(body: unknown): body is FeedbackPayload {
  if (typeof body !== "object" || body === null) return false;
  const b = body as Record<string, unknown>;
  return b.rating === "up" || b.rating === "down";
}

export async function POST(request: Request) {
  const body: unknown = await request.json();

  if (!isValidPayload(body)) {
    return NextResponse.json({ error: "Invalid feedback" }, { status: 400 });
  }

  const entry = {
    ...body,
    timestamp: new Date().toISOString(),
  };

  const filename = `feedback/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.json`;

  await put(filename, JSON.stringify(entry), {
    access: "private",
    contentType: "application/json",
  });

  return NextResponse.json({ ok: true });
}
