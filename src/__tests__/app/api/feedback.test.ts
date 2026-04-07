import { describe, expect, it, vi } from "vitest";

vi.mock("@vercel/blob", () => ({
  put: vi.fn().mockResolvedValue({
    url: "https://blob.vercel-storage.com/feedback/test.json",
  }),
}));

import { POST } from "@/app/api/feedback/route";

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

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
      makeRequest({
        mode: "outline-chord-changes",
        tempo: 120,
        loopCount: 5,
      }),
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 when rating is invalid", async () => {
    const res = await POST(
      makeRequest({
        rating: "maybe",
        mode: "outline-chord-changes",
        tempo: 120,
        loopCount: 5,
      }),
    );
    expect(res.status).toBe(400);
  });
});
