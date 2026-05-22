import { beforeEach, describe, expect, it, vi } from "vitest";

const { checkBotIdMock } = vi.hoisted(() => ({ checkBotIdMock: vi.fn() }));

vi.mock("botid/server", () => ({ checkBotId: checkBotIdMock }));

vi.mock("@vercel/blob", () => ({
  put: vi.fn(),
}));

import { put } from "@vercel/blob";
import { POST } from "@/app/api/feedback/route";

const BLOB_RESULT = {
  url: "https://blob.vercel-storage.com/feedback/test.json",
};

function makeRequest(
  body: unknown,
  origin: string | null = "http://localhost",
): Request {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (origin) headers.Origin = origin;
  return new Request("http://localhost/api/feedback", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  checkBotIdMock.mockResolvedValue({
    isBot: false,
    isHuman: true,
    isVerifiedBot: false,
    bypassed: false,
  });
  vi.mocked(put).mockResolvedValue(
    BLOB_RESULT as Awaited<ReturnType<typeof put>>,
  );
});

describe("POST /api/feedback", () => {
  it("returns 200 for valid feedback with thumbs up", async () => {
    const res = await POST(
      makeRequest({
        rating: "up",
        mode: "outline-chord-changes",
        tempo: 120,
        loopCount: 5,
      }),
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
  });

  it("returns 200 for valid feedback with thumbs down and comment", async () => {
    const res = await POST(
      makeRequest({
        rating: "down",
        comment: "Needs more styles",
        mode: "learn-the-neck",
        tempo: 100,
        loopCount: 3,
      }),
    );
    expect(res.status).toBe(200);
  });

  it("returns 400 when rating is missing", async () => {
    const res = await POST(
      makeRequest({ mode: "outline-chord-changes", tempo: 120, loopCount: 5 }),
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 when rating is invalid", async () => {
    const res = await POST(
      makeRequest({ rating: "maybe", mode: "outline-chord-changes" }),
    );
    expect(res.status).toBe(400);
  });

  it("returns 403 and does not store anything when the request is a bot", async () => {
    checkBotIdMock.mockResolvedValue({
      isBot: true,
      isHuman: false,
      isVerifiedBot: false,
      bypassed: false,
    });

    const res = await POST(makeRequest({ rating: "up" }));

    expect(res.status).toBe(403);
    expect(put).not.toHaveBeenCalled();
  });

  it("returns 403 for a cross-origin request", async () => {
    const res = await POST(
      makeRequest({ rating: "up" }, "https://evil.example.com"),
    );

    expect(res.status).toBe(403);
    expect(put).not.toHaveBeenCalled();
  });

  it("returns 403 when the Origin header is missing", async () => {
    const res = await POST(makeRequest({ rating: "up" }, null));

    expect(res.status).toBe(403);
    expect(put).not.toHaveBeenCalled();
  });

  it("returns 400 when the comment exceeds the maximum length", async () => {
    const res = await POST(
      makeRequest({ rating: "down", comment: "x".repeat(1001) }),
    );

    expect(res.status).toBe(400);
    expect(put).not.toHaveBeenCalled();
  });

  it("returns 400 when tempo is not a number", async () => {
    const res = await POST(makeRequest({ rating: "up", tempo: "fast" }));

    expect(res.status).toBe(400);
  });

  it("returns 400 for a malformed JSON body", async () => {
    const req = new Request("http://localhost/api/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost",
      },
      body: "{ not json",
    });

    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it("stores only known fields, ignoring injected payload keys", async () => {
    const res = await POST(
      makeRequest({
        rating: "up",
        comment: "good",
        injected: "x".repeat(50_000),
        nested: { huge: "y".repeat(50_000) },
      }),
    );

    expect(res.status).toBe(200);
    expect(put).toHaveBeenCalledTimes(1);
    const stored = vi.mocked(put).mock.calls[0]?.[1] as string;
    expect(stored).not.toContain("injected");
    expect(stored).not.toContain("huge");
    const parsed = JSON.parse(stored);
    expect(parsed).toEqual({
      rating: "up",
      comment: "good",
      timestamp: expect.any(String),
    });
  });
});
