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

/* =========================================================================
 * Queries
 * ========================================================================= */

export const TRAINING_QUERY_KEYS = {
  all: ["training"] as const,
  dashboard: () => [...TRAINING_QUERY_KEYS.all, "dashboard"] as const,
  courses: () => [...TRAINING_QUERY_KEYS.all, "courses"] as const,
  course: (id: string) => [...TRAINING_QUERY_KEYS.all, "courses", id] as const,
  sessionParticipants: (id: string) =>
    [...TRAINING_QUERY_KEYS.all, "sessions", id, "participants"] as const,
  courseMaterials: (id: string) =>
    [...TRAINING_QUERY_KEYS.all, "courses", id, "materials"] as const,
};

/**
 * Fetch Training Dashboard (active courses + upcoming scheduled sessions)
 */
export function useTrainingDashboard() {
  return useQuery({
    queryKey: TRAINING_QUERY_KEYS.dashboard(),
    queryFn: async (): Promise<TrainingDashboardData> => {
      const response = await apiClient.get<TrainingDashboardData>(
        "/training/dashboard"
      );
      const data = response.data;
      return {
        courses: Array.isArray(data?.courses) ? data.courses : [],
        upcomingSessions: Array.isArray(data?.upcomingSessions)
          ? data.upcomingSessions
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
    queryFn: async (): Promise<TrainingCourseItem[]> => {
      const response = await apiClient.get<TrainingCourseItem[]>(
        "/training/courses"
      );
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    },
  });
}

/**
 * Fetch Single Course Detail
 */
export function useTrainingCourse(id?: string) {
  return useQuery({
    queryKey: TRAINING_QUERY_KEYS.course(id || ""),
    queryFn: async (): Promise<TrainingCourseRecord> => {
      if (!id) throw new Error("Course ID is required");
      const response = await apiClient.get<TrainingCourseRecord>(
        `/training/courses/${id}`
      );
      return response.data;
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
    queryFn: async (): Promise<any[]> => {
      if (!sessionId) throw new Error("Session ID is required");
      const response = await apiClient.get<any[]>(
        `/training/sessions/${sessionId}/participants`
      );
      return Array.isArray(response.data) ? response.data : [];
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
    queryFn: async (): Promise<any[]> => {
      if (!courseId) throw new Error("Course ID is required");
      const response = await apiClient.get<any[]>(
        `/training/courses/${courseId}/materials`
      );
      return Array.isArray(response.data) ? response.data : [];
    },
    enabled: Boolean(courseId),
  });
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
        payload
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
        payload
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
        `/training/courses/${courseId}/publish`
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
        `/training/courses/${courseId}/archive`
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
        payload
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
        { reason }
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
        { status }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRAINING_QUERY_KEYS.all });
    },
  });
}
