import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import PageHeader from "@/components/Headers/PageHeader";
import PageLoader from "@/components/layout/PageLoader";
import CourseCardsGrid from "./-components/CourseCardsGrid";
import UpcomingSessionsTable from "./-components/UpcomingSessionsTable";
import CreateCourseModal from "./-components/CreateCourseModal";
import EditCourseModal from "./-components/EditCourseModal";
import ScheduleSessionModal from "./-components/ScheduleSessionModal";
import SessionDetailModal from "./-components/SessionDetailModal";
import MyLearningSection from "./-components/MyLearningSection";
import type { Course, TrainingSession } from "./-components/types";
import {
  mapBackendCourseToUi,
  mapBackendUpcomingSessionToUi,
} from "./-components/mappers";
import {
  useTrainingDashboard,
  useTrainingCourses,
  useCreateTrainingCourse,
  useUpdateTrainingCourse,
  useCreateTrainingSession,
  usePublishTrainingCourse,
  useArchiveTrainingCourse,
  useAdvanceTrainingSessionStatus,
  useCancelTrainingSession,
  type CreateTrainingCoursePayload,
  type CreateTrainingSessionPayload,
  type TrainingDashboardData,
  type UpdateTrainingCoursePayload,
} from "@/api/trainingApi";
import { useStaffs } from "@/api/tenantApi";
import { extract_message } from "@/helpers/errors";
import { CalendarPlus, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/hr/training/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const [isCreateCourseOpen, setIsCreateCourseOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isScheduleSessionOpen, setIsScheduleSessionOpen] = useState(false);
  const [scheduleDefaultCourseId, setScheduleDefaultCourseId] = useState<
    string | undefined
  >(undefined);
  const [selectedSession, setSelectedSession] =
    useState<TrainingSession | null>(null);

  const dashboardQuery = useTrainingDashboard();
  const catalogQuery = useTrainingCourses();
  const staffsQuery = useStaffs();

  const createCourseMutation = useCreateTrainingCourse();
  const updateCourseMutation = useUpdateTrainingCourse();
  const createSessionMutation = useCreateTrainingSession();
  const publishCourseMutation = usePublishTrainingCourse();
  const archiveCourseMutation = useArchiveTrainingCourse();
  const advanceSessionMutation = useAdvanceTrainingSessionStatus();
  const cancelSessionMutation = useCancelTrainingSession();

  const staffNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const staff of staffsQuery.data ?? []) {
      const fullName =
        `${staff.firstName ?? ""} ${staff.lastName ?? ""}`.trim();
      map[staff.id] = fullName || staff.email || staff.id;
    }
    return map;
  }, [staffsQuery.data]);

  const handleCreateCourse = async (
    coursePayload: CreateTrainingCoursePayload,
    sessionPayload?: Omit<CreateTrainingSessionPayload, "courseId">,
  ) => {
    try {
      const createdCourse =
        await createCourseMutation.mutateAsync(coursePayload);

      if (sessionPayload) {
        try {
          await createSessionMutation.mutateAsync({
            ...sessionPayload,
            courseId: createdCourse.id,
          });
        } catch (sessionErr) {
          toast.warning("Course created, but session scheduling failed", {
            description: extract_message(sessionErr),
          });
          return;
        }
      }

      toast.success("Course created successfully", {
        description: `"${createdCourse.title}" is now added to the course catalog.`,
      });
    } catch (err) {
      toast.error("Failed to create course", {
        description: extract_message(err),
      });
      throw err;
    }
  };

  const handleUpdateCourse = async (
    courseId: string,
    payload: UpdateTrainingCoursePayload,
  ) => {
    try {
      const updated = await updateCourseMutation.mutateAsync({
        id: courseId,
        ...payload,
      });
      toast.success("Course updated successfully", {
        description: `"${updated.title}" changes saved.`,
      });
    } catch (err) {
      toast.error("Failed to update course", {
        description: extract_message(err),
      });
      throw err;
    }
  };

  const handleScheduleSession = async (
    payload: CreateTrainingSessionPayload,
  ) => {
    try {
      await createSessionMutation.mutateAsync(payload);
      toast.success("Training session scheduled");
    } catch (err) {
      toast.error(extract_message(err));
      throw err;
    }
  };

  const handlePublishCourse = async (courseId: string) => {
    try {
      await publishCourseMutation.mutateAsync(courseId);
      toast.success("Course published successfully!");
    } catch (err) {
      toast.error(extract_message(err));
    }
  };

  const handleArchiveCourse = async (courseId: string) => {
    try {
      await archiveCourseMutation.mutateAsync(courseId);
      toast.success("Course archived.");
    } catch (err) {
      toast.error(extract_message(err));
    }
  };

  const handleAdvanceSessionStatus = async (
    sessionId: string,
    status: "in_progress" | "completed",
  ) => {
    try {
      await advanceSessionMutation.mutateAsync({ sessionId, status });
      toast.success(
        status === "in_progress"
          ? "Session started (marked In Progress)."
          : "Session marked as Completed.",
      );
    } catch (err) {
      toast.error(extract_message(err));
    }
  };

  const handleCancelSession = async (sessionId: string, reason: string) => {
    try {
      await cancelSessionMutation.mutateAsync({ sessionId, reason });
      toast.success("Training session cancelled.");
    } catch (err) {
      toast.error(extract_message(err));
    }
  };

  const rawCourses =
    (catalogQuery.data && catalogQuery.data.length > 0
      ? catalogQuery.data
      : dashboardQuery.data?.courses) ?? [];
  const courses = rawCourses.map(mapBackendCourseToUi);
  const nonArchivedCourses = courses.filter(
    (c) => String(c.status).toLowerCase() !== "archived",
  );

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Training & Development"
        description="Course catalog, certifications and upcoming training sessions."
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setScheduleDefaultCourseId(
                nonArchivedCourses[0]?.id ?? courses[0]?.id,
              );
              setIsScheduleSessionOpen(true);
            }}
            disabled={nonArchivedCourses.length === 0}
            className="btn btn-sm btn-outline border-base-300 hover:bg-base-200 text-base-content rounded-xl px-4 font-medium gap-1.5"
          >
            <CalendarPlus className="size-4" />
            <span>Schedule session</span>
          </button>
          <button
            type="button"
            onClick={() => setIsCreateCourseOpen(true)}
            className="btn btn-sm bg-primary text-white hover:bg-primary/90 border-0 rounded-xl px-4 font-medium gap-1.5 shadow-sm shadow-primary/20"
          >
            <Plus className="size-4" />
            <span>Create course</span>
          </button>
        </div>
      </PageHeader>

      <MyLearningSection />

      <PageLoader<TrainingDashboardData>
        query={dashboardQuery}
        emptyState={{
          title: "No training data",
          description:
            "No courses or sessions found. Get started by creating your first course.",
          actionText: "Create course",
          onAction: () => setIsCreateCourseOpen(true),
        }}
      >
        {(data) => {
          const loadedCourses =
            catalogQuery.data && catalogQuery.data.length > 0
              ? catalogQuery.data.map(mapBackendCourseToUi)
              : data.courses.map(mapBackendCourseToUi);
          const sessions = data.upcomingSessions.map((item) =>
            mapBackendUpcomingSessionToUi(item, staffNameMap),
          );

          return (
            <div className="space-y-6">
              <CourseCardsGrid
                courses={loadedCourses}
                onSelectCourse={(course) =>
                  navigate({
                    to: "/hr/training/$id",
                    params: { id: course.id },
                  })
                }
                onEditCourse={(course) => setEditingCourse(course)}
                onScheduleSession={(courseId) => {
                  setScheduleDefaultCourseId(courseId);
                  setIsScheduleSessionOpen(true);
                }}
                onPublishCourse={handlePublishCourse}
                onArchiveCourse={handleArchiveCourse}
              />

              <UpcomingSessionsTable
                sessions={sessions}
                onSelectSession={(session) => setSelectedSession(session)}
                onAdvanceStatus={handleAdvanceSessionStatus}
                onCancelSession={handleCancelSession}
              />
            </div>
          );
        }}
      </PageLoader>

      <CreateCourseModal
        isOpen={isCreateCourseOpen}
        onClose={() => setIsCreateCourseOpen(false)}
        onSubmitCourse={handleCreateCourse}
      />

      <EditCourseModal
        isOpen={Boolean(editingCourse)}
        onClose={() => setEditingCourse(null)}
        course={editingCourse}
        onUpdateCourse={handleUpdateCourse}
      />

      <ScheduleSessionModal
        isOpen={isScheduleSessionOpen}
        onClose={() => setIsScheduleSessionOpen(false)}
        courses={nonArchivedCourses}
        defaultCourseId={scheduleDefaultCourseId}
        onScheduleSession={handleScheduleSession}
      />

      <SessionDetailModal
        isOpen={Boolean(selectedSession)}
        onClose={() => setSelectedSession(null)}
        session={selectedSession}
        onAdvanceStatus={handleAdvanceSessionStatus}
        onCancelSession={handleCancelSession}
      />
    </div>
  );
}
