import { describe, expect, it } from "vitest";
import { applyGrooveTemplate } from "@/lib/audio/grooveTemplates";
import type { GrooveTemplate } from "@/lib/types";

const swingTemplate: GrooveTemplate = {
  name: "Jazz Swing",
  subdivisions: 8,
  // 8th-note grid in 4/4: positions at beats 0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5
  // Offsets in beats — upbeats (odd indices) pushed late
  offsets: [0, 0.12, 0, 0.15, 0, 0.1, 0, 0.13],
};

const straightTemplate: GrooveTemplate = {
  name: "Straight",
  subdivisions: 8,
  offsets: [0, 0, 0, 0, 0, 0, 0, 0],
};

describe("applyGrooveTemplate", () => {
  it("passes downbeats through unchanged", () => {
    expect(applyGrooveTemplate(0, swingTemplate)).toBe(0);
    expect(applyGrooveTemplate(1, swingTemplate)).toBe(1);
    expect(applyGrooveTemplate(2, swingTemplate)).toBe(2);
    expect(applyGrooveTemplate(3, swingTemplate)).toBe(3);
  });

  it("shifts upbeat 8th notes by the template offset", () => {
    // Beat 0.5 -> subdivision index 1 -> offset 0.12
    expect(applyGrooveTemplate(0.5, swingTemplate)).toBeCloseTo(0.62);
    // Beat 1.5 -> subdivision index 3 -> offset 0.15
    expect(applyGrooveTemplate(1.5, swingTemplate)).toBeCloseTo(1.65);
    // Beat 2.5 -> subdivision index 5 -> offset 0.1
    expect(applyGrooveTemplate(2.5, swingTemplate)).toBeCloseTo(2.6);
  });

  it("produces straight timing with all-zero offsets", () => {
    expect(applyGrooveTemplate(0, straightTemplate)).toBe(0);
    expect(applyGrooveTemplate(0.5, straightTemplate)).toBe(0.5);
    expect(applyGrooveTemplate(1.5, straightTemplate)).toBe(1.5);
    expect(applyGrooveTemplate(3.5, straightTemplate)).toBe(3.5);
  });

  it("handles positions beyond the template range by wrapping", () => {
    // Beat 4.5 should wrap to subdivision index 1 (same as beat 0.5)
    expect(applyGrooveTemplate(4.5, swingTemplate)).toBeCloseTo(4.62);
  });

  it("interpolates for positions between subdivisions", () => {
    // Beat 0.25 is between subdivision 0 (offset 0) and subdivision 1 (offset 0.12)
    // Should interpolate: 0 + 0.5 * 0.12 = 0.06
    const result = applyGrooveTemplate(0.25, swingTemplate);
    expect(result).toBeCloseTo(0.31); // 0.25 + 0.06
  });
});
