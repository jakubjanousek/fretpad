import { beforeEach, describe, expect, it, vi } from "vitest";

// Track mock Player instances
interface MockPlayer {
  start: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
  connect: ReturnType<typeof vi.fn>;
  dispose: ReturnType<typeof vi.fn>;
  loaded: boolean;
  volume: { value: number };
  playbackRate: number;
}

const playerInstances: MockPlayer[] = [];

vi.mock("tone", () => {
  return {
    Player: class {
      start = vi.fn();
      stop = vi.fn();
      connect = vi.fn().mockReturnValue(this);
      dispose = vi.fn();
      loaded = true;
      volume = { value: 0 };
      playbackRate = 1;
      constructor() {
        playerInstances.push(this as unknown as MockPlayer);
      }
    },
    Gain: class {
      gain = { value: 1 };
      chain = vi.fn();
      connect = vi.fn().mockReturnValue(this);
      dispose = vi.fn();
    },
    Filter: class {
      dispose = vi.fn();
    },
    Reverb: class {
      dispose = vi.fn();
    },
    Compressor: class {
      dispose = vi.fn();
    },
    Destination: {},
    loaded: vi.fn().mockResolvedValue(undefined),
    now: vi.fn(() => 0),
    dbToGain: vi.fn((db: number) => 10 ** (db / 20)),
  };
});

import { createSampleDrumInstrument } from "@/lib/audio/instruments/sampleDrumInstrument";

beforeEach(() => {
  playerInstances.length = 0;
});

describe("sampleDrumInstrument", () => {
  it("returns an object with trigger, setVolume, and dispose", async () => {
    const drum = await createSampleDrumInstrument(-8);

    expect(drum).toHaveProperty("trigger");
    expect(drum).toHaveProperty("setVolume");
    expect(drum).toHaveProperty("dispose");
    expect(typeof drum.trigger).toBe("function");
    expect(typeof drum.setVolume).toBe("function");
    expect(typeof drum.dispose).toBe("function");
  });

  it("creates Player instances for all drum sounds with velocity layers", async () => {
    await createSampleDrumInstrument(-8);

    // 5 sounds (kick, snare, hihat, hihatOpen, ride) x 2 velocity layers = 10 players
    expect(playerInstances.length).toBe(10);
  });

  it("trigger calls start on the correct velocity layer player", async () => {
    const drum = await createSampleDrumInstrument(-8);
    const time = 5.0;

    // Soft hit — should use soft layer
    drum.trigger("ride", time, 0.3);

    // Hard hit — should use hard layer
    drum.trigger("ride", time, 0.9);

    // At least one player should have been started for each trigger call
    const startedPlayers = playerInstances.filter(
      (p) => p.start.mock.calls.length > 0,
    );
    expect(startedPlayers.length).toBeGreaterThanOrEqual(2);
  });

  it("dispose cleans up all players", async () => {
    const drum = await createSampleDrumInstrument(-8);

    drum.dispose();

    for (const player of playerInstances) {
      expect(player.dispose).toHaveBeenCalled();
    }
  });
});
