import type { AttendanceRecord, CorrectionRequest } from "./types";

export const INITIAL_ATTENDANCE_LOGS: AttendanceRecord[] = [
  {
    id: "ATT-01",
    name: "Amara Okafor",
    shift: "09:00–17:00",
    timeIn: "08:52",
    timeOut: "—",
    status: "Present",
    workMode: "On-site",
    location: "Lagos HQ",
  },
  {
    id: "ATT-02",
    name: "Tunde Adeyemi",
    shift: "09:00–17:00",
    timeIn: "09:17",
    timeOut: "—",
    status: "Late",
    workMode: "On-site",
    location: "Lagos HQ",
  },
  {
    id: "ATT-03",
    name: "Chiamaka Eze",
    shift: "09:00–17:00",
    timeIn: "08:45",
    timeOut: "—",
    status: "Present",
    workMode: "Remote",
    location: "Remote",
  },
  {
    id: "ATT-04",
    name: "David Mensah",
    shift: "09:00–17:00",
    timeIn: "—",
    timeOut: "—",
    status: "Absent",
    workMode: "On-site",
    location: "Lagos HQ",
  },
  {
    id: "ATT-05",
    name: "Fatima Bello",
    shift: "09:00–17:00",
    timeIn: "08:58",
    timeOut: "—",
    status: "Present",
    workMode: "On-site",
    location: "Abuja Branch",
  },
  {
    id: "ATT-06",
    name: "Kwame Asante",
    shift: "09:00–17:00",
    timeIn: "09:25",
    timeOut: "—",
    status: "Late",
    workMode: "Field work",
    location: "Accra Site",
  },
  {
    id: "ATT-07",
    name: "Ngozi Obi",
    shift: "09:00–17:00",
    timeIn: "08:49",
    timeOut: "—",
    status: "Present",
    workMode: "On-site",
    location: "Lagos HQ",
  },
  {
    id: "ATT-08",
    name: "Samuel Johnson",
    shift: "09:00–17:00",
    timeIn: "08:55",
    timeOut: "—",
    status: "Present",
    workMode: "On-site",
    location: "Abuja Branch",
  },
];

export const INITIAL_CORRECTIONS: CorrectionRequest[] = [
  {
    id: "COR-01",
    employeeName: "Peter Okon",
    date: "Nov 10",
    type: "Missed clock-in",
    detail: "Nov 10 · missed clock-in",
    status: "Pending",
    correctIn: "08:50",
    correctOut: "17:05",
    reason: "Network card glitch at the entrance turnstile.",
  },
  {
    id: "COR-02",
    employeeName: "Ruth Akande",
    date: "Nov 07",
    type: "Wrong time",
    detail: "Nov 07 · wrong clock-out",
    status: "Approved",
    correctIn: "09:00",
    correctOut: "18:15",
    reason: "Recorded 16:15 accidentally instead of 18:15 after team sync.",
  },
  {
    id: "COR-03",
    employeeName: "Emeka Uche",
    date: "Nov 05",
    type: "Overtime claim",
    detail: "Nov 05 · overtime 2h",
    status: "Pending",
    correctIn: "09:00",
    correctOut: "19:00",
    reason: "Production database maintenance migration window.",
  },
];

export const SHIFT_OPTIONS = [
  "Morning 09:00–17:00",
  "Afternoon 13:00–21:00",
  "Night 21:00–05:00",
  "Flexible",
];

export const WORK_MODES = ["On-site", "Remote", "Field work"] as const;

export const LOCATION_OPTIONS = ["Lagos HQ", "Abuja Branch", "Accra Site", "Remote"];

export const CORRECTION_TYPES = [
  "Missed clock-in",
  "Missed clock-out",
  "Wrong time",
  "Overtime claim",
];
