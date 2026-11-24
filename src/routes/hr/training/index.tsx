import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/Headers/PageHeader";
import PageLoader from "@/components/layout/PageLoader";
import CourseCardsGrid from "./-components/CourseCardsGrid";
import UpcomingSessionsTable from "./-components/UpcomingSessionsTable";
import CreateCourseModal from "./-components/CreateCourseModal";
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
import { Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/hr/training/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [isCreateCourseOpen, setIsCreateCourseOpen] = useState(false);

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

  const handlePublishCourse = (courseId: string) => {
    toast.promise(publishCourseMutation.mutateAsync(courseId), {
      loading: "Publishing course...",
      success: "Course published successfully!",
      error: (err) => extract_message(err),
    });
  };

  const handleArchiveCourse = (courseId: string) => {
    toast.promise(archiveCourseMutation.mutateAsync(courseId), {
      loading: "Archiving course...",
      success: "Course archived.",
      error: (err) => extract_message(err),
    });
  };

  const handleAdvanceSessionStatus = (
    sessionId: string,
    status: "in_progress" | "completed",
  ) => {
    const label =
      status === "in_progress"
        ? "Starting session..."
        : "Completing session...";
    toast.promise(advanceSessionMutation.mutateAsync({ sessionId, status }), {
      loading: label,
      success:
        status === "in_progress"
          ? "Session marked as In Progress."
          : "Session marked as Completed.",
      error: (err) => extract_message(err),
    });
  };

  const handleCancelSession = (sessionId: string, reason: string) => {
    toast.promise(cancelSessionMutation.mutateAsync({ sessionId, reason }), {
      loading: "Cancelling session...",
      success: "Training session cancelled.",
      error: (err) => extract_message(err),
    });
  };

  const handleSelectCourse = (course: Course) => {
    toast.info(`Course: ${course.title}`, {
      description: `Category: ${course.category} · Enrolled: ${course.enrolled} staff · Completion: ${course.completionRate}%`,
    });
  };

  const handleSelectSession = (session: TrainingSession) => {
    toast.info(`Session: ${session.course}`, {
      description: `Date: ${session.date} · Trainer: ${session.trainer} · Status: ${session.status}`,
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <PageHeader
        title="Training & Development"
        description="Course catalog, certifications and upcoming training sessions."
      >
        <button
          type="button"
          onClick={() => setIsCreateCourseOpen(true)}
          className="btn btn-sm bg-primary text-white hover:bg-primary/90 border-0 rounded-xl px-4 font-medium gap-1.5 shadow-sm shadow-primary/20"
        >
          <Plus className="size-4" />
          <span>Create course</span>
        </button>
      </PageHeader>

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
          const courses = data.courses.map(mapBackendCourseToUi);
          const sessions = data.upcomingSessions.map(
            mapBackendUpcomingSessionToUi,
          );

          return (
            <div className="space-y-6">
              {/* Top 4 KPI Stat Cards + Active Course Grid */}
              <CourseCardsGrid
                courses={courses}
                onSelectCourse={handleSelectCourse}
                onPublishCourse={handlePublishCourse}
                onArchiveCourse={handleArchiveCourse}
              />

              {/* Upcoming Training Sessions Table */}
              <UpcomingSessionsTable
                sessions={sessions}
                onSelectSession={handleSelectSession}
                onAdvanceStatus={handleAdvanceSessionStatus}
                onCancelSession={handleCancelSession}
              />
            </div>
          );
        }}
      </PageLoader>

      {/* Create Course Modal */}
      <CreateCourseModal
        isOpen={isCreateCourseOpen}
        onClose={() => setIsCreateCourseOpen(false)}
        onSubmitCourse={handleCreateCourse}
      />
    </div>
  );
}
