import { describe, expect, it } from "vitest";
import { computePersonalAttendanceStats } from "./AttendanceStats";

describe("computePersonalAttendanceStats", () => {
  it("computes personal present, late, absent counts and total hours from own logs", () => {
    const stats = computePersonalAttendanceStats([
      {
        id: "1",
        staffId: "staff-1",
        status: "present",
        clockInAt: "2026-11-24T09:00:00.000Z",
        clockOutAt: "2026-11-24T17:00:00.000Z",
      },
      {
        id: "2",
        staffId: "staff-1",
        status: "late",
        clockInAt: "2026-11-25T09:30:00.000Z",
        clockOutAt: "2026-11-25T17:00:00.000Z",
      },
      {
        id: "3",
        staffId: "staff-1",
        status: "absent",
      },
      {
        id: "4",
        staffId: "staff-1",
        clockInAt: "2026-11-26T09:00:00.000Z",
      },
    ]);

    expect(stats.presentCount).toBe(3);
    expect(stats.lateCount).toBe(1);
    expect(stats.absentCount).toBe(1);
    expect(stats.totalHours).toBe(15.5);
  });

  it("returns zeros when no logs exist", () => {
    expect(computePersonalAttendanceStats([])).toEqual({
      presentCount: 0,
      lateCount: 0,
      absentCount: 0,
      totalHours: 0,
    });
  });
});
