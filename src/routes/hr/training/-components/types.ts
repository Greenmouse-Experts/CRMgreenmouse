export type CourseCategory =
  | "Compliance"
  | "Management"
  | "Sales"
  | "Technical"
  | "Soft skills";

export type DeliveryMode =
  | "In-person"
  | "Virtual"
  | "Self-paced online"
  | "Blended";

export interface Course {
  id: string;
  title: string;
  category: CourseCategory;
  enrolled: number;
  completionRate: number; // percentage
  mode?: DeliveryMode;
  trainer?: string;
  duration?: number; // hours
  mandatory?: boolean;
}

export type SessionStatus = "Scheduled" | "In Progress" | "Completed" | "Cancelled";

export interface TrainingSession {
  id: string;
  course: string;
  date: string;
  trainer: string;
  status: SessionStatus;
  mode?: DeliveryMode;
  location?: string;
}

export interface CreateCoursePayload {
  title: string;
  category: CourseCategory;
  mode: DeliveryMode;
  trainer: string;
  duration?: number;
  capacity?: number;
  cost?: number;
  mandatory: boolean;
  desc?: string;
  start: string;
  end?: string;
  audience: string;
  cert: boolean;
}
