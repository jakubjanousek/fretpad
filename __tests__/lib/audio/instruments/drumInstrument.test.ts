import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Tests that drumInstrument passes the correct arguments to Tone.js synths.
 *
 * NoiseSynth.triggerAttackRelease(duration, time, velocity) — 3 args (no note)
 * MembraneSynth/Synth.triggerAttackRelease(note, duration, time, velocity) — 4 args
 */

function makeMockInstance() {
  return {
    triggerAttackRelease: vi.fn(),
    connect: vi.fn().mockReturnThis(),
    chain: vi.fn().mockReturnThis(),
    volume: { value: 0 },
    dispose: vi.fn(),
  };
}

const membraneSynthInstances: ReturnType<typeof makeMockInstance>[] = [];
const noiseSynthInstances: ReturnType<typeof makeMockInstance>[] = [];
const synthInstances: ReturnType<typeof makeMockInstance>[] = [];

vi.mock("tone", () => {
  return {
    Gain: class {
      chain = vi.fn();
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
    MembraneSynth: class {
      triggerAttackRelease = vi.fn();
      connect = vi.fn().mockReturnValue(this);
      volume = { value: 0 };
      dispose = vi.fn();
      constructor() {
        const inst = makeMockInstance();
        Object.assign(this, inst);
        membraneSynthInstances.push(inst);
      }
    },
    NoiseSynth: class {
      triggerAttackRelease = vi.fn();
      connect = vi.fn().mockReturnValue(this);
      chain = vi.fn().mockReturnValue(this);
      volume = { value: 0 };
      dispose = vi.fn();
      constructor() {
        const inst = makeMockInstance();
        Object.assign(this, inst);
        noiseSynthInstances.push(inst);
      }
    },
    Synth: class {
      triggerAttackRelease = vi.fn();
      connect = vi.fn().mockReturnValue(this);
      volume = { value: 0 };
      dispose = vi.fn();
      constructor() {
        const inst = makeMockInstance();
        Object.assign(this, inst);
        synthInstances.push(inst);
      }
    },
    Destination: {},
    now: vi.fn(() => 0),
  };
});

import { createDrumInstrument } from "@/lib/audio/instruments/drumInstrument";

beforeEach(() => {
  membraneSynthInstances.length = 0;
  noiseSynthInstances.length = 0;
  synthInstances.length = 0;
});

describe("drumInstrument trigger calls", () => {
  // NoiseSynth creation order: [0] snareNoise, [1] hihat, [2] hihatOpen, [3] ride

  it("passes hihat args as (duration, time, velocity)", () => {
    const drum = createDrumInstrument(-8);
    const time = 10.5;
    const velocity = 0.6;

    drum.trigger("hihat", time, velocity);

    const hihat = noiseSynthInstances[1];
    if (!hihat) throw new Error("hihat instance not created");

    const call = hihat.triggerAttackRelease.mock.calls[0];
    if (!call) throw new Error("hihat trigger not called");
    expect(call[1]).toBe(time);
    expect(call[2]).toBeCloseTo(velocity);
  });

  it("passes ride args as (duration, time, velocity)", () => {
    const drum = createDrumInstrument(-8);
    const time = 3.0;
    const velocity = 0.5;

    drum.trigger("ride", time, velocity);

    const ride = noiseSynthInstances[3];
    if (!ride) throw new Error("ride instance not created");

    const call = ride.triggerAttackRelease.mock.calls[0];
    if (!call) throw new Error("ride trigger not called");
    expect(call[1]).toBe(time);
    expect(call[2]).toBeCloseTo(velocity);
  });

  it("passes kick args as (note, duration, time, velocity)", () => {
    const drum = createDrumInstrument(-8);
    const time = 5.0;
    const velocity = 0.9;

    drum.trigger("kick", time, velocity);

    const kick = membraneSynthInstances[0];
    if (!kick) throw new Error("kick instance not created");

    const call = kick.triggerAttackRelease.mock.calls[0];
    if (!call) throw new Error("kick trigger not called");
    expect(call).toHaveLength(4);
    expect(call[2]).toBe(time);
    expect(call[3]).toBe(velocity);
  });

  it("passes snare args correctly for both layers", () => {
    const drum = createDrumInstrument(-8);
    const time = 7.0;
    const velocity = 0.8;

    drum.trigger("snare", time, velocity);

    // NoiseSynth[0] = snareNoise: (duration, time, velocity)
    const snareNoise = noiseSynthInstances[0];
    if (!snareNoise) throw new Error("snareNoise instance not created");
    const noiseCall = snareNoise.triggerAttackRelease.mock.calls[0];
    if (!noiseCall) throw new Error("snareNoise trigger not called");
    expect(noiseCall[1]).toBe(time);
    expect(noiseCall[2]).toBeCloseTo(velocity * 0.7);

    // Synth[0] = snareBody: (note, duration, time, velocity)
    const snareBody = synthInstances[0];
    if (!snareBody) throw new Error("snareBody instance not created");
    const bodyCall = snareBody.triggerAttackRelease.mock.calls[0];
    if (!bodyCall) throw new Error("snareBody trigger not called");
    expect(bodyCall[2]).toBe(time);
    expect(bodyCall[3]).toBeCloseTo(velocity * 0.5);
  });
});
