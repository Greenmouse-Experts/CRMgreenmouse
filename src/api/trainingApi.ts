import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "./simpleApi";

export type BackendCourseCategory =
  | "compliance"
  | "management"
  | "sales"
  | "technical"
  | "onboarding"
  | "other";

export type BackendDeliveryMode = "in_person" | "virtual" | "hybrid";

export type BackendTargetType = "all" | "department" | "role" | "selected";

export type BackendCourseStatus = "draft" | "published" | "archived";

export type BackendSessionStatus =
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled";

export type BackendAttendanceStatus =
  | "not_recorded"
  | "attended"
  | "absent"
  | "excused";

export interface TrainingCourseRecord {
  id: string;
  tenantId: string;
  title: string;
  category: BackendCourseCategory | string;
  defaultDeliveryMode: BackendDeliveryMode | string;
  learningObjectives: string;
  mandatory: boolean;
  certificateOnCompletion: boolean;
  targetType: BackendTargetType | string;
  targetIds?: string[];
  costPerPersonKobo?: number;
  status: BackendCourseStatus | string;
  publishedAt?: string | null;
  archivedAt?: string | null;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TrainingCourseItem {
  course: TrainingCourseRecord;
  enrolled: number;
  completed: number;
  completionPercent: number;
}

export interface TrainingSessionRecord {
  id: string;
  tenantId: string;
  courseId: string;
  startsAt: string;
  endsAt: string;
  deliveryMode: BackendDeliveryMode | string;
  location?: string | null;
  meetingUrl?: string | null;
  capacity: number;
  trainerType: "internal" | "external" | string;
  internalTrainerId?: string | null;
  externalProvider?: string | null;
  status: BackendSessionStatus | string;
  cancellationReason?: string | null;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TrainingUpcomingSessionItem {
  session: TrainingSessionRecord;
  courseTitle: string;
  enrolled: number;
}

export interface TrainingDashboardData {
  courses: TrainingCourseItem[];
  upcomingSessions: TrainingUpcomingSessionItem[];
}

export interface CreateTrainingCoursePayload {
  title: string;
  category: BackendCourseCategory;
  defaultDeliveryMode: BackendDeliveryMode;
  learningObjectives: string;
  mandatory: boolean;
  certificateOnCompletion: boolean;
  targetType: BackendTargetType;
  targetIds: string[];
  costPerPerson: string;
}

export interface UpdateTrainingCoursePayload {
  title?: string;
  category?: BackendCourseCategory;
  defaultDeliveryMode?: BackendDeliveryMode;
  learningObjectives?: string;
  mandatory?: boolean;
  certificateOnCompletion?: boolean;
  targetType?: BackendTargetType;
  targetIds?: string[];
  costPerPerson?: string;
}

export interface CreateTrainingSessionPayload {
  courseId: string;
  startsAt: string;
  endsAt: string;
  deliveryMode: BackendDeliveryMode;
  location?: string;
  meetingUrl?: string;
  capacity: number;
  trainerType: "internal" | "external";
  internalTrainerId?: string;
  externalProvider?: string;
}

export interface CancelTrainingSessionPayload {
  sessionId: string;
  reason: string;
}

export interface AdvanceSessionStatusPayload {
  sessionId: string;
  status: "in_progress" | "completed";
}

export interface MarkAttendancePayload {
  sessionId: string;
  enrollmentId: string;
  status: "attended" | "absent" | "excused";
  notes?: string;
}

export interface AssignEnrollmentSessionPayload {
  enrollmentId: string;
  sessionId: string;
}

export interface CompleteEnrollmentPayload {
  enrollmentId: string;
  notes?: string;
}

export interface IssueCertificatePayload {
  enrollmentId: string;
  certificateUrl: string;
}

export interface TrainingMaterialItem {
  id: string;
  title?: string;
  fileName?: string;
  name?: string;
  fileUrl?: string;
  url?: string;
  mimeType?: string;
  createdAt?: string;
}

export interface TrainingEnrollmentRecord {
  id: string;
  tenantId?: string;
  courseId?: string;
  sessionId?: string | null;
  employeeId?: string;
  staffId?: string | null;
  status?: string;
  attendanceStatus?: BackendAttendanceStatus | string;
  attendanceNotes?: string | null;
  attendanceRecordedBy?: string | null;
  attendanceRecordedAt?: string | null;
  completionNotes?: string | null;
  completedBy?: string | null;
  completedAt?: string | null;
  certificateEligible?: boolean;
  certificateUrl?: string | null;
  certificateIssuedAt?: string | null;
  enrolledAt?: string;
  updatedAt?: string;
}

export interface TrainingParticipantItem {
  enrollment?: TrainingEnrollmentRecord;
  enrollmentId?: string;
  id?: string;
  employeeId?: string;
  employeeName?: string;
  employee?: {
    id?: string;
    employeeNumber?: string;
    department?: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    email?: string;
  };
  sessionId?: string | null;
  status?: string;
  attendanceStatus?: string;
  attendanceNotes?: string | null;
  completionNotes?: string | null;
  certificateEligible?: boolean;
  certificateUrl?: string | null;
  certificateIssuedAt?: string | null;
  completedAt?: string | null;
}

export interface TrainingCourseDetailRecord extends TrainingCourseRecord {
  sessions?: TrainingSessionRecord[];
  participants?: TrainingParticipantItem[];
  materials?: TrainingMaterialItem[];
}

export interface TrainingMyLearningItem {
  id?: string;
  enrollmentId?: string;
  tenantId?: string;
  courseId?: string;
  sessionId?: string | null;
  employeeId?: string;
  courseTitle?: string;
  title?: string;
  category?: BackendCourseCategory | string;
  defaultDeliveryMode?: BackendDeliveryMode | string;
  learningObjectives?: string;
  mandatory?: boolean;
  certificateOnCompletion?: boolean;
  targetType?: BackendTargetType | string;
  targetIds?: string[];
  costPerPersonKobo?: number;
  status?: string;
  courseStatus?: BackendCourseStatus | string;
  attendanceStatus?: BackendAttendanceStatus | string;
  attendanceNotes?: string | null;
  completionNotes?: string | null;
  certificateEligible?: boolean;
  certificateUrl?: string | null;
  certificateIssuedAt?: string | null;
  enrolledAt?: string;
  completedAt?: string | null;
  publishedAt?: string | null;
  createdAt?: string;
  enrollment?: TrainingEnrollmentRecord;
  course?: Partial<TrainingCourseDetailRecord> & {
    id?: string;
    title?: string;
    courseTitle?: string;
  };
  session?: TrainingSessionRecord | null;
  sessions?: TrainingSessionRecord[];
  materials?: TrainingMaterialItem[];
}

export interface NormalizedMyLearningEntry {
  id: string;
  enrollmentId: string;
  courseId: string;
  courseTitle: string;
  status: string;
  attendanceStatus: string;
  certificateEligible: boolean;
  certificateUrl: string | null;
  sessionId: string | null;
  courseRecord: TrainingCourseRecord;
  sessions: TrainingSessionRecord[];
  materials: TrainingMaterialItem[];
}

export function extractMyLearningItems(raw: any): TrainingMyLearningItem[] {
  if (Array.isArray(raw)) return raw;
  const unwrapped = raw?.data?.data ?? raw?.data ?? raw?.payload ?? raw;
  if (Array.isArray(unwrapped)) return unwrapped;
  if (Array.isArray(unwrapped?.enrollments)) return unwrapped.enrollments;
  if (Array.isArray(unwrapped?.items)) return unwrapped.items;
  if (Array.isArray(unwrapped?.courses)) return unwrapped.courses;
  if (Array.isArray(raw?.enrollments)) return raw.enrollments;
  if (Array.isArray(raw?.items)) return raw.items;
  return [];
}

export function normalizeMyLearningEntry(
  item: TrainingMyLearningItem,
): NormalizedMyLearningEntry | null {
  const enrollment = item.enrollment;
  const course = item.course;
  const courseId = String(
    item.courseId || enrollment?.courseId || course?.id || item.id || "",
  ).trim();

  if (!courseId) return null;

  const enrollmentId = String(
    enrollment?.id || item.enrollmentId || item.id || courseId,
  ).trim();
  const courseTitle =
    course?.title ||
    course?.courseTitle ||
    item.courseTitle ||
    item.title ||
    "Assigned Training";
  const status = String(enrollment?.status || item.status || "enrolled");
  const attendanceStatus = String(
    enrollment?.attendanceStatus || item.attendanceStatus || "not_recorded",
  );
  const certificateUrl =
    enrollment?.certificateUrl ?? item.certificateUrl ?? null;
  const certificateEligible = Boolean(
    enrollment?.certificateEligible ??
    item.certificateEligible ??
    certificateUrl,
  );
  const sessionId =
    enrollment?.sessionId ?? item.sessionId ?? item.session?.id ?? null;

  const rawSessions = [
    ...(item.session ? [item.session] : []),
    ...(Array.isArray(item.sessions) ? item.sessions : []),
    ...(Array.isArray(course?.sessions) ? course.sessions : []),
  ];
  const sessionMap = new Map<string, TrainingSessionRecord>();
  for (const session of rawSessions) {
    if (!session?.id) continue;
    sessionMap.set(session.id, {
      ...session,
      courseId: session.courseId || courseId,
    });
  }

  const rawMaterials = [
    ...(Array.isArray(item.materials) ? item.materials : []),
    ...(Array.isArray(course?.materials) ? course.materials : []),
  ];
  const materialMap = new Map<string, TrainingMaterialItem>();
  for (const material of rawMaterials) {
    if (!material?.id) continue;
    materialMap.set(material.id, material);
  }

  const courseRecord: TrainingCourseRecord = {
    id: courseId,
    tenantId: course?.tenantId || enrollment?.tenantId || item.tenantId || "",
    title: courseTitle,
    category: course?.category || item.category || "other",
    defaultDeliveryMode:
      course?.defaultDeliveryMode || item.defaultDeliveryMode || "virtual",
    learningObjectives:
      course?.learningObjectives ?? item.learningObjectives ?? "",
    mandatory: Boolean(course?.mandatory ?? item.mandatory),
    certificateOnCompletion: Boolean(
      course?.certificateOnCompletion ??
      item.certificateOnCompletion ??
      certificateUrl,
    ),
    targetType: course?.targetType || item.targetType || "selected",
    targetIds: Array.isArray(course?.targetIds)
      ? course.targetIds
      : Array.isArray(item.targetIds)
        ? item.targetIds
        : [],
    costPerPersonKobo: course?.costPerPersonKobo ?? item.costPerPersonKobo,
    status: course?.status || item.courseStatus || "published",
    publishedAt: course?.publishedAt ?? item.publishedAt ?? null,
    archivedAt: course?.archivedAt ?? null,
    createdBy: course?.createdBy,
    createdAt: course?.createdAt ?? item.createdAt ?? enrollment?.enrolledAt,
    updatedAt: course?.updatedAt ?? enrollment?.updatedAt,
  };

  return {
    id: enrollmentId,
    enrollmentId,
    courseId,
    courseTitle,
    status,
    attendanceStatus,
    certificateEligible,
    certificateUrl,
    sessionId,
    courseRecord,
    sessions: Array.from(sessionMap.values()),
    materials: Array.from(materialMap.values()),
  };
}

/* =========================================================================
 * Queries
 * ========================================================================= */

export const TRAINING_QUERY_KEYS = {
  all: ["training"] as const,
  dashboard: () => [...TRAINING_QUERY_KEYS.all, "dashboard"] as const,
  courses: () => [...TRAINING_QUERY_KEYS.all, "courses"] as const,
  course: (id: string) => [...TRAINING_QUERY_KEYS.all, "courses", id] as const,
  myLearning: () => [...TRAINING_QUERY_KEYS.all, "my-learning"] as const,
  sessionParticipants: (id: string) =>
    [...TRAINING_QUERY_KEYS.all, "sessions", id, "participants"] as const,
  courseMaterials: (id: string) =>
    [...TRAINING_QUERY_KEYS.all, "courses", id, "materials"] as const,
};

/**
 * Fetch Training Dashboard (active courses + upcoming scheduled sessions)
 */
const noAuthRetry = (failureCount: number, error: any) => {
  const status = error?.response?.status;
  if (status === 401 || status === 403 || status === 404) return false;
  return failureCount < 2;
};

export function useTrainingDashboard() {
  return useQuery({
    queryKey: TRAINING_QUERY_KEYS.dashboard(),
    retry: noAuthRetry,
    queryFn: async (): Promise<TrainingDashboardData> => {
      const response = await apiClient.get<any>("/training/dashboard");
      const raw = response.data?.data ?? response.data;
      return {
        courses: Array.isArray(raw?.courses) ? raw.courses : [],
        upcomingSessions: Array.isArray(raw?.upcomingSessions)
          ? raw.upcomingSessions
          : [],
      };
    },
  });
}

/**
 * Fetch Course Catalog List
 */
export function useTrainingCourses() {
  return useQuery({
    queryKey: TRAINING_QUERY_KEYS.courses(),
    retry: noAuthRetry,
    queryFn: async (): Promise<TrainingCourseItem[]> => {
      const response = await apiClient.get<any>("/training/courses");
      const raw = response.data?.data ?? response.data;
      return Array.isArray(raw) ? raw : [];
    },
  });
}

/**
 * Fetch Single Course Detail (includes sessions, participants, materials)
 */
export function useTrainingCourse(id?: string) {
  return useQuery({
    queryKey: TRAINING_QUERY_KEYS.course(id || ""),
    retry: noAuthRetry,
    queryFn: async (): Promise<TrainingCourseDetailRecord> => {
      if (!id) throw new Error("Course ID is required");
      const response = await apiClient.get<any>(`/training/courses/${id}`);
      const raw = response.data?.data ?? response.data;
      return raw;
    },
    enabled: Boolean(id),
  });
}

/**
 * Fetch Participants for a Session
 */
export function useTrainingSessionParticipants(sessionId?: string) {
  return useQuery({
    queryKey: TRAINING_QUERY_KEYS.sessionParticipants(sessionId || ""),
    queryFn: async (): Promise<TrainingParticipantItem[]> => {
      if (!sessionId) throw new Error("Session ID is required");
      const response = await apiClient.get<any>(
        `/training/sessions/${sessionId}/participants`,
      );
      const raw = response.data?.data ?? response.data;
      if (Array.isArray(raw)) return raw;
      if (Array.isArray(raw?.participants)) return raw.participants;
      return [];
    },
    enabled: Boolean(sessionId),
  });
}

/**
 * Fetch Materials for a Course
 */
export function useTrainingCourseMaterials(courseId?: string) {
  return useQuery({
    queryKey: TRAINING_QUERY_KEYS.courseMaterials(courseId || ""),
    retry: noAuthRetry,
    queryFn: async (): Promise<TrainingMaterialItem[]> => {
      if (!courseId) throw new Error("Course ID is required");
      const response = await apiClient.get<any>(
        `/training/courses/${courseId}/materials`,
      );
      const raw = response.data;
      if (Array.isArray(raw)) return raw;
      if (Array.isArray(raw?.data)) return raw.data;
      if (Array.isArray(raw?.materials)) return raw.materials;
      return [];
    },
    enabled: Boolean(courseId),
  });
}

/**
 * Fetch Current User's Learning / Enrollments (`GET /v1/training/my-learning`)
 */
export function useMyTrainingLearning() {
  return useQuery({
    queryKey: TRAINING_QUERY_KEYS.myLearning(),
    retry: noAuthRetry,
    queryFn: async (): Promise<TrainingMyLearningItem[]> => {
      const response = await apiClient.get<any>("/training/my-learning");
      return extractMyLearningItems(response.data);
    },
  });
}

/**
 * Download a Training Material file
 */
export async function downloadTrainingMaterial(materialId: string) {
  const response = await apiClient.get<any>(
    `/training/materials/${materialId}/download`,
    { responseType: "blob" },
  );
  return response;
}

/* =========================================================================
 * Mutations
 * ========================================================================= */

/**
 * Create a new Training Course
 */
export function useCreateTrainingCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateTrainingCoursePayload) => {
      const response = await apiClient.post<TrainingCourseRecord>(
        "/training/courses",
        payload,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRAINING_QUERY_KEYS.all });
    },
  });
}

/**
 * Update an existing Training Course
 */
export function useUpdateTrainingCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: UpdateTrainingCoursePayload & { id: string }) => {
      const response = await apiClient.patch<TrainingCourseRecord>(
        `/training/courses/${id}`,
        payload,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRAINING_QUERY_KEYS.all });
    },
  });
}

/**
 * Publish a Course (requires at least one scheduled session)
 */
export function usePublishTrainingCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (courseId: string) => {
      const response = await apiClient.post<TrainingCourseRecord>(
        `/training/courses/${courseId}/publish`,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRAINING_QUERY_KEYS.all });
    },
  });
}

/**
 * Archive a Course
 */
export function useArchiveTrainingCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (courseId: string) => {
      const response = await apiClient.post<TrainingCourseRecord>(
        `/training/courses/${courseId}/archive`,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRAINING_QUERY_KEYS.all });
    },
  });
}

/**
 * Create a Session for a Course
 */
export function useCreateTrainingSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      courseId,
      ...payload
    }: CreateTrainingSessionPayload) => {
      const response = await apiClient.post<TrainingSessionRecord>(
        `/training/courses/${courseId}/sessions`,
        payload,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRAINING_QUERY_KEYS.all });
    },
  });
}

/**
 * Cancel a scheduled Session
 */
export function useCancelTrainingSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ sessionId, reason }: CancelTrainingSessionPayload) => {
      const response = await apiClient.post<TrainingSessionRecord>(
        `/training/sessions/${sessionId}/cancel`,
        { reason },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRAINING_QUERY_KEYS.all });
    },
  });
}

/**
 * Advance Session status (in_progress | completed)
 */
export function useAdvanceTrainingSessionStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ sessionId, status }: AdvanceSessionStatusPayload) => {
      const response = await apiClient.patch<TrainingSessionRecord>(
        `/training/sessions/${sessionId}/status`,
        { status },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRAINING_QUERY_KEYS.all });
    },
  });
}

/**
 * Upload a Material to a Course
 */
export function useUploadTrainingMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      courseId,
      file,
    }: {
      courseId: string;
      file: File;
    }) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await apiClient.post<any>(
        `/training/courses/${courseId}/materials`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      return response.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: TRAINING_QUERY_KEYS.courseMaterials(variables.courseId),
      });
      queryClient.invalidateQueries({
        queryKey: TRAINING_QUERY_KEYS.course(variables.courseId),
      });
    },
  });
}

/**
 * Mark Attendance for a Session Participant
 */
export function useMarkTrainingAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      sessionId,
      enrollmentId,
      status,
      notes,
    }: MarkAttendancePayload) => {
      const response = await apiClient.put<any>(
        `/training/sessions/${sessionId}/attendance/${enrollmentId}`,
        { status, ...(notes ? { notes } : {}) },
      );
      return response.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: TRAINING_QUERY_KEYS.sessionParticipants(variables.sessionId),
      });
      queryClient.invalidateQueries({ queryKey: TRAINING_QUERY_KEYS.all });
    },
  });
}

/**
 * Assign an Enrollment to a Session
 */
export function useAssignEnrollmentSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      enrollmentId,
      sessionId,
    }: AssignEnrollmentSessionPayload) => {
      const response = await apiClient.put<any>(
        `/training/enrollments/${enrollmentId}/session`,
        { sessionId },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRAINING_QUERY_KEYS.all });
    },
  });
}

/**
 * Mark an Enrollment as Completed
 */
export function useCompleteTrainingEnrollment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ enrollmentId, notes }: CompleteEnrollmentPayload) => {
      const response = await apiClient.post<any>(
        `/training/enrollments/${enrollmentId}/complete`,
        { ...(notes ? { notes } : {}) },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRAINING_QUERY_KEYS.all });
    },
  });
}

/**
 * Issue a Certificate for an Enrollment
 */
export function useIssueTrainingCertificate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      enrollmentId,
      certificateUrl,
    }: IssueCertificatePayload) => {
      const response = await apiClient.put<any>(
        `/training/enrollments/${enrollmentId}/certificate`,
        { certificateUrl },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRAINING_QUERY_KEYS.all });
    },
  });
}
