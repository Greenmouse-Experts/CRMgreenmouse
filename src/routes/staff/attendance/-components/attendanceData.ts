export const SHIFT_OPTIONS = [
  "Morning 09:00–17:00",
  "Afternoon 13:00–21:00",
  "Night 21:00–05:00",
  "Flexible",
];

export const WORK_MODES = ["On-site", "Remote", "Field work"] as const;

export const LOCATION_OPTIONS = [
  "Lagos HQ",
  "Abuja Branch",
  "Accra Site",
  "Remote",
];

/** UI label -> value accepted by POST /v1/attendance/corrections. */
export const CORRECTION_TYPES = [
  { label: "Missed clock-in", value: "missed_clock_in" },
  { label: "Missed clock-out", value: "missed_clock_out" },
  { label: "Wrong time", value: "wrong_time" },
  { label: "Overtime claim", value: "overtime_claim" },
] as const;

export const correctionLabel = (value?: string) =>
  CORRECTION_TYPES.find((type) => type.value === value)?.label ??
  value?.replaceAll("_", " ") ??
  "Correction";
