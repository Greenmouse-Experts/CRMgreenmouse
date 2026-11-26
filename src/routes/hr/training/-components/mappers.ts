import type {
  TrainingCourseItem,
  TrainingCourseRecord,
  TrainingParticipantItem,
  TrainingSessionRecord,
  TrainingUpcomingSessionItem,
  BackendCourseCategory,
  BackendDeliveryMode,
  BackendTargetType,
} from "@/api/trainingApi";
import type {
  Course,
  CourseCategory,
  DeliveryMode,
  NormalizedParticipant,
  SessionStatus,
  TrainingSession,
} from "./types";

export function formatSessionDate(isoString?: string): string {
  if (!isoString) return "—";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return isoString;
  }
}

export function formatSessionDateTime(isoString?: string): string {
  if (!isoString) return "—";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}

export function formatCourseCost(costPerPersonKobo?: number): string {
  if (typeof costPerPersonKobo !== "number" || costPerPersonKobo <= 0) {
    return "Free";
  }
  return `₦${(costPerPersonKobo / 100).toLocaleString()}`;
}

export function mapBackendCategoryToUi(
  backendCategory?: string,
): CourseCategory {
  switch (backendCategory?.toLowerCase()) {
    case "compliance":
      return "Compliance";
    case "management":
      return "Management";
    case "sales":
      return "Sales";
    case "technical":
      return "Technical";
    case "onboarding":
      return "Onboarding";
    case "other":
    default:
      return "Other";
  }
}

export function mapBackendDeliveryModeToUi(backendMode?: string): DeliveryMode {
  switch (backendMode?.toLowerCase()) {
    case "virtual":
      return "Virtual";
    case "hybrid":
      return "Blended";
    case "in_person":
    default:
      return "In-person";
  }
}

export function mapBackendSessionStatusToUi(status?: string): SessionStatus {
  switch (status?.toLowerCase()) {
    case "in_progress":
      return "In Progress";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    case "scheduled":
    default:
      return "Scheduled";
  }
}

export function mapCourseRecordToUi(
  course: TrainingCourseRecord,
  stats?: { enrolled?: number; completionPercent?: number },
): Course {
  return {
    id: course.id,
    title: course.title || "Untitled Course",
    category: mapBackendCategoryToUi(course.category),
    enrolled: stats?.enrolled ?? 0,
    completionRate: Math.round(stats?.completionPercent ?? 0),
    mode: mapBackendDeliveryModeToUi(course.defaultDeliveryMode),
    mandatory: Boolean(course.mandatory),
    status: course.status,
    certificateOnCompletion: Boolean(course.certificateOnCompletion),
    learningObjectives: course.learningObjectives,
    costPerPersonKobo: course.costPerPersonKobo,
    targetType: course.targetType,
    targetIds: Array.isArray(course.targetIds) ? course.targetIds : [],
  };
}

export function mapBackendCourseToUi(item: TrainingCourseItem): Course {
  return mapCourseRecordToUi(item.course, {
    enrolled: item.enrolled,
    completionPercent: item.completionPercent,
  });
}

export function mapBackendSessionRecordToUi(
  session: TrainingSessionRecord,
  courseTitle: string,
  enrolled?: number,
  staffNameMap?: Record<string, string>,
): TrainingSession {
  const internalName =
    session.internalTrainerId && staffNameMap?.[session.internalTrainerId];

  return {
    id: session.id,
    courseId: session.courseId,
    course: courseTitle || "Training Session",
    date: formatSessionDate(session.startsAt),
    rawStartsAt: session.startsAt,
    rawEndsAt: session.endsAt,
    trainer:
      session.externalProvider ||
      internalName ||
      (session.trainerType === "internal"
        ? "Internal Staff Trainer"
        : "Lead Trainer"),
    trainerType: session.trainerType,
    internalTrainerId: session.internalTrainerId,
    externalProvider: session.externalProvider,
    status: mapBackendSessionStatusToUi(session.status),
    mode: mapBackendDeliveryModeToUi(session.deliveryMode),
    location:
      session.location ||
      (session.meetingUrl
        ? `Online: ${session.meetingUrl}`
        : session.deliveryMode === "virtual"
          ? "Virtual Meeting"
          : "Main Training Hall"),
    meetingUrl: session.meetingUrl || undefined,
    capacity: session.capacity,
    enrolled: enrolled ?? 0,
    cancellationReason: session.cancellationReason,
  };
}

export function mapBackendUpcomingSessionToUi(
  item: TrainingUpcomingSessionItem,
  staffNameMap?: Record<string, string>,
): TrainingSession {
  return mapBackendSessionRecordToUi(
    item.session,
    item.courseTitle,
    item.enrolled,
    staffNameMap,
  );
}

export function normalizeTrainingParticipant(
  p: TrainingParticipantItem,
): NormalizedParticipant {
  const enrollment = p.enrollment;
  const employee = p.employee;
  const fullName = employee
    ? `${employee.firstName ?? ""} ${employee.lastName ?? ""}`.trim() ||
      employee.name ||
      employee.email
    : undefined;

  const enrollmentId = enrollment?.id || p.enrollmentId || p.id || "";
  const employeeId =
    enrollment?.employeeId || employee?.id || p.employeeId || "";

  return {
    enrollmentId,
    employeeId,
    sessionId: enrollment?.sessionId ?? p.sessionId ?? null,
    name: p.employeeName || fullName || employeeId || "Staff",
    employeeNumber: employee?.employeeNumber,
    department: employee?.department,
    email: employee?.email,
    status: enrollment?.status || p.status || "enrolled",
    attendanceStatus:
      enrollment?.attendanceStatus || p.attendanceStatus || "not_recorded",
    attendanceNotes: enrollment?.attendanceNotes ?? p.attendanceNotes ?? null,
    completionNotes: enrollment?.completionNotes ?? p.completionNotes ?? null,
    certificateEligible: Boolean(
      enrollment?.certificateEligible ?? p.certificateEligible,
    ),
    certificateUrl: enrollment?.certificateUrl ?? p.certificateUrl ?? null,
    certificateIssuedAt:
      enrollment?.certificateIssuedAt ?? p.certificateIssuedAt ?? null,
    completedAt: enrollment?.completedAt ?? p.completedAt ?? null,
    enrolledAt: enrollment?.enrolledAt ?? null,
  };
}

export function toBackendCategory(cat: CourseCategory): BackendCourseCategory {
  switch (cat) {
    case "Compliance":
      return "compliance";
    case "Management":
      return "management";
    case "Sales":
      return "sales";
    case "Technical":
      return "technical";
    case "Onboarding":
      return "onboarding";
    case "Other":
    case "Soft skills":
    default:
      return "other";
  }
}

export function toBackendDeliveryMode(mode: DeliveryMode): BackendDeliveryMode {
  switch (mode) {
    case "Virtual":
      return "virtual";
    case "Blended":
    case "Self-paced online":
      return "hybrid";
    case "In-person":
    default:
      return "in_person";
  }
}

export function toBackendTargetType(audience: string): BackendTargetType {
  if (audience === "All staff" || audience === "all") return "all";
  if (
    audience === "Managers only" ||
    audience === "New hires" ||
    audience === "role"
  ) {
    return "role";
  }
  if (audience === "selected") return "selected";
  return "department";
}
