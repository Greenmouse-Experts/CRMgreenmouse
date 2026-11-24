import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/Headers/PageHeader";
import PageLoader from "@/components/layout/PageLoader";
import CourseCardsGrid from "./-components/CourseCardsGrid";
import UpcomingSessionsTable from "./-components/UpcomingSessionsTable";
import CreateCourseModal from "./-components/CreateCourseModal";
import ScheduleSessionModal from "./-components/ScheduleSessionModal";
import CourseDetailModal from "./-components/CourseDetailModal";
import SessionDetailModal from "./-components/SessionDetailModal";
import MyLearningSection from "./-components/MyLearningSection";
import type { Course, TrainingSession } from "./-components/types";
import {
  mapBackendCourseToUi,
  mapBackendUpcomingSessionToUi,
} from "./-components/mappers";
import {
  useTrainingDashboard,
  useCreateTrainingCourse,
  useCreateTrainingSession,
  usePublishTrainingCourse,
  useArchiveTrainingCourse,
  useAdvanceTrainingSessionStatus,
  useCancelTrainingSession,
  type CreateTrainingCoursePayload,
  type CreateTrainingSessionPayload,
  type TrainingDashboardData,
} from "@/api/trainingApi";
import { extract_message } from "@/helpers/errors";
import { CalendarPlus, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/hr/training/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [isCreateCourseOpen, setIsCreateCourseOpen] = useState(false);
  const [isScheduleSessionOpen, setIsScheduleSessionOpen] = useState(false);
  const [scheduleDefaultCourseId, setScheduleDefaultCourseId] = useState<
    string | undefined
  >(undefined);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedSession, setSelectedSession] =
    useState<TrainingSession | null>(null);

  const dashboardQuery = useTrainingDashboard();

  const createCourseMutation = useCreateTrainingCourse();
  const createSessionMutation = useCreateTrainingSession();
  const publishCourseMutation = usePublishTrainingCourse();
  const archiveCourseMutation = useArchiveTrainingCourse();
  const advanceSessionMutation = useAdvanceTrainingSessionStatus();
  const cancelSessionMutation = useCancelTrainingSession();

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
          ? "Session marked as In Progress."
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

  const courses = (dashboardQuery.data?.courses ?? []).map(
    mapBackendCourseToUi,
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
              setScheduleDefaultCourseId(courses[0]?.id);
              setIsScheduleSessionOpen(true);
            }}
            disabled={courses.length === 0}
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
          const loadedCourses = data.courses.map(mapBackendCourseToUi);
          const sessions = data.upcomingSessions.map(
            mapBackendUpcomingSessionToUi,
          );

          return (
            <div className="space-y-6">
              <CourseCardsGrid
                courses={loadedCourses}
                onSelectCourse={(course) => setSelectedCourse(course)}
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

      <ScheduleSessionModal
        isOpen={isScheduleSessionOpen}
        onClose={() => setIsScheduleSessionOpen(false)}
        courses={courses}
        defaultCourseId={scheduleDefaultCourseId}
        onScheduleSession={handleScheduleSession}
      />

      <CourseDetailModal
        isOpen={Boolean(selectedCourse)}
        onClose={() => setSelectedCourse(null)}
        course={selectedCourse}
        onPublish={handlePublishCourse}
        onArchive={handleArchiveCourse}
        onScheduleSession={(courseId) => {
          setScheduleDefaultCourseId(courseId);
          setIsScheduleSessionOpen(true);
        }}
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
