export type CourseCategory =
  | "Compliance"
  | "Management"
  | "Sales"
  | "Technical"
  | "Onboarding"
  | "Other"
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
  status?: "draft" | "published" | "archived" | string;
  certificateOnCompletion?: boolean;
  learningObjectives?: string;
}

export type SessionStatus =
  | "Scheduled"
  | "In Progress"
  | "Completed"
  | "Cancelled";

export interface TrainingSession {
  id: string;
  courseId?: string;
  course: string;
  date: string;
  rawStartsAt?: string;
  rawEndsAt?: string;
  trainer: string;
  status: SessionStatus;
  mode?: DeliveryMode;
  location?: string;
  meetingUrl?: string;
  capacity?: number;
  enrolled?: number;
}

export interface CreateCoursePayload {
  title: string;
  category: CourseCategory;
  mode: DeliveryMode;
  trainer: string;
  duration?: number;
  capacity?: number;
  cost?: string | number;
  mandatory: boolean;
  desc?: string;
  start: string;
  end?: string;
  audience: string;
  cert: boolean;
  location?: string;
  meetingUrl?: string;
}
