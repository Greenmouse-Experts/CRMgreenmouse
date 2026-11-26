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
  costPerPersonKobo?: number;
  targetType?: "all" | "department" | "role" | "selected" | string;
  targetIds?: string[];
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
  trainerType?: "internal" | "external" | string;
  internalTrainerId?: string | null;
  externalProvider?: string | null;
  status: SessionStatus;
  mode?: DeliveryMode;
  location?: string;
  meetingUrl?: string;
  capacity?: number;
  enrolled?: number;
  cancellationReason?: string | null;
}

export interface NormalizedParticipant {
  enrollmentId: string;
  employeeId: string;
  sessionId?: string | null;
  name: string;
  employeeNumber?: string;
  department?: string;
  email?: string;
  status: string;
  attendanceStatus: string;
  attendanceNotes?: string | null;
  completionNotes?: string | null;
  certificateEligible: boolean;
  certificateUrl?: string | null;
  certificateIssuedAt?: string | null;
  completedAt?: string | null;
  enrolledAt?: string | null;
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
