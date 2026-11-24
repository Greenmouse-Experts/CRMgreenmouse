export type AttendanceStatus = "Present" | "Late" | "Absent" | "Half-day";

export type CorrectionStatus = "Pending" | "Approved" | "Rejected";

export interface AttendanceRecord {
  id: string;
  staffId?: string;
  name: string;
  date: string;
  rawDate?: string;
  clockInAt?: string | null;
  clockOutAt?: string | null;
  timeIn: string;
  timeOut: string;
  status: AttendanceStatus;
  workMode?: "On-site" | "Remote" | "Field work";
  location?: string;
}

export interface CorrectionRequest {
  id: string;
  employeeName: string;
  date: string;
  type: string;
  detail: string;
  status: CorrectionStatus;
  correctIn?: string;
  correctOut?: string;
  reason?: string;
}
