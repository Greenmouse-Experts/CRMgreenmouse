import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/Headers/PageHeader";
import CourseCardsGrid from "./-components/CourseCardsGrid";
import UpcomingSessionsTable from "./-components/UpcomingSessionsTable";
import CreateCourseModal from "./-components/CreateCourseModal";
import {
  INITIAL_COURSES,
  INITIAL_SESSIONS,
} from "./-components/trainingData";
import type { Course, TrainingSession } from "./-components/types";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/hr/training/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [sessions, setSessions] = useState<TrainingSession[]>(INITIAL_SESSIONS);
  const [isCreateCourseOpen, setIsCreateCourseOpen] = useState(false);

  const handleCreateCourse = (newCourse: Course, newSession?: TrainingSession) => {
    setCourses((prev) => [newCourse, ...prev]);
    if (newSession) {
      setSessions((prev) => [newSession, ...prev]);
    }
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

      {/* Top 4 KPI Stat Cards + Active Course Grid */}
      <CourseCardsGrid
        courses={courses}
        onSelectCourse={handleSelectCourse}
      />

      {/* Upcoming Training Sessions Table */}
      <UpcomingSessionsTable
        sessions={sessions}
        onSelectSession={handleSelectSession}
      />

      {/* Create Course Modal */}
      <CreateCourseModal
        isOpen={isCreateCourseOpen}
        onClose={() => setIsCreateCourseOpen(false)}
        onCreateCourse={handleCreateCourse}
      />
    </div>
  );
}
