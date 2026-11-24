export type AttendanceStatus =
  | "Clocked In"
  | "Clocked Out"
  | "Present"
  | "Late"
  | "Absent"
  | "Half-day";

export type CorrectionStatus = "Pending" | "Approved" | "Rejected";

export interface AttendanceRecord {
  id: string;
  staffId: string;
  name: string;
  date: string;
  rawDate?: string;
  clockInAt: string;
  clockOutAt: string;
  status: AttendanceStatus;
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
