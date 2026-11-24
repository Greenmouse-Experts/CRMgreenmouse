import type {
  TrainingCourseItem,
  TrainingUpcomingSessionItem,
  BackendCourseCategory,
  BackendDeliveryMode,
  BackendTargetType,
} from "@/api/trainingApi";
import type {
  Course,
  CourseCategory,
  DeliveryMode,
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

export function mapBackendCategoryToUi(
  backendCategory?: string
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

export function mapBackendDeliveryModeToUi(
  backendMode?: string
): DeliveryMode {
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

export function mapBackendSessionStatusToUi(
  status?: string
): SessionStatus {
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

export function mapBackendCourseToUi(item: TrainingCourseItem): Course {
  return {
    id: item.course.id,
    title: item.course.title || "Untitled Course",
    category: mapBackendCategoryToUi(item.course.category),
    enrolled: item.enrolled ?? 0,
    completionRate: Math.round(item.completionPercent ?? 0),
    mode: mapBackendDeliveryModeToUi(item.course.defaultDeliveryMode),
    mandatory: Boolean(item.course.mandatory),
    status: item.course.status,
    certificateOnCompletion: Boolean(item.course.certificateOnCompletion),
    learningObjectives: item.course.learningObjectives,
  };
}

export function mapBackendUpcomingSessionToUi(
  item: TrainingUpcomingSessionItem
): TrainingSession {
  return {
    id: item.session.id,
    courseId: item.session.courseId,
    course: item.courseTitle || "Training Session",
    date: formatSessionDate(item.session.startsAt),
    rawStartsAt: item.session.startsAt,
    rawEndsAt: item.session.endsAt,
    trainer:
      item.session.externalProvider ||
      (item.session.trainerType === "internal"
        ? "Internal Staff Trainer"
        : "Lead Trainer"),
    status: mapBackendSessionStatusToUi(item.session.status),
    mode: mapBackendDeliveryModeToUi(item.session.deliveryMode),
    location: item.session.location || (item.session.meetingUrl ? `Online: ${item.session.meetingUrl}` : "Main Training Hall"),
    meetingUrl: item.session.meetingUrl || undefined,
    capacity: item.session.capacity,
    enrolled: item.enrolled ?? 0,
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
  if (audience === "All staff") return "all";
  if (audience === "Managers only" || audience === "New hires") return "role";
  return "department";
}
