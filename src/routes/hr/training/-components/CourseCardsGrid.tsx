import { useState } from "react";
import type { Course } from "./types";
import {
  Users,
  GraduationCap,
  CheckCircle2,
  Award,
  UploadCloud,
  Archive,
  MoreVertical,
  Pencil,
  Eye,
  CalendarPlus,
  Search,
} from "lucide-react";
import StatCard from "@/components/StatCard";

interface CourseCardsGridProps {
  courses: Course[];
  onSelectCourse?: (course: Course) => void;
  onEditCourse?: (course: Course) => void;
  onScheduleSession?: (courseId: string) => void;
  onPublishCourse?: (courseId: string) => void;
  onArchiveCourse?: (courseId: string) => void;
}

export default function CourseCardsGrid({
  courses,
  onSelectCourse,
  onEditCourse,
  onScheduleSession,
  onPublishCourse,
  onArchiveCourse,
}: CourseCardsGridProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case "Compliance":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "Management":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Sales":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Technical":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Onboarding":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "Soft skills":
      case "Other":
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  const getProgressColor = (rate: number) => {
    if (rate >= 80) return "progress-success";
    if (rate >= 60) return "progress-primary";
    if (rate >= 40) return "progress-warning";
    return "progress-error";
  };

  const activeCoursesCount = courses.filter(
    (c) => String(c.status).toLowerCase() !== "archived",
  ).length;
  const totalEnrolled = courses.reduce((sum, c) => sum + c.enrolled, 0);
  const avgCompletion = courses.length
    ? Math.round(
        courses.reduce((sum, c) => sum + c.completionRate, 0) / courses.length,
      )
    : 0;
  const certifiedCoursesCount = courses.filter(
    (c) => c.certificateOnCompletion,
  ).length;

  const filteredCourses = courses.filter((course) => {
    const statusLower = String(course.status ?? "draft").toLowerCase();
    if (statusFilter !== "all" && statusLower !== statusFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        course.title.toLowerCase().includes(q) ||
        course.category.toLowerCase().includes(q) ||
        (course.mode && course.mode.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Active Courses"
          value={activeCoursesCount}
          desc="Non-archived programs in catalog"
          icon={<GraduationCap className="size-5" />}
          variant="primary"
        />

        <StatCard
          title="Total Enrolled"
          value={totalEnrolled}
          desc="Active learners across programs"
          icon={<Users className="size-5" />}
          variant="info"
        />

        <StatCard
          title="Avg Completion"
          value={
            <div className="flex items-baseline gap-1">
              <span>{avgCompletion}</span>
              <span className="font-normal text-base-content/80">%</span>
            </div>
          }
          desc="Overall course progress rate"
          icon={<CheckCircle2 className="size-5" />}
          variant="success"
        />

        <StatCard
          title="Certified Programs"
          value={certifiedCoursesCount}
          desc="Courses issuing certificates"
          icon={<Award className="size-5" />}
          variant="warning"
        />
      </div>

      {/* Course Overview Grid */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-base-content">Courses</h2>
              <span className="badge badge-sm badge-ghost font-semibold">
                {filteredCourses.length} programs
              </span>
            </div>
            <p className="text-xs text-base-content/80 mt-0.5">
              Click any course to open its full curriculum, sessions,
              participants, and materials.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-56">
              <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/70" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search courses..."
                className="input input-sm input-bordered w-full pl-9 rounded-xl bg-base-100"
              />
            </div>

            <div className="join rounded-xl bg-base-100 border border-base-200 p-0.5">
              {[
                { key: "all", label: "All" },
                { key: "published", label: "Published" },
                { key: "draft", label: "Draft" },
                { key: "archived", label: "Archived" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setStatusFilter(tab.key)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                    statusFilter === tab.key
                      ? "bg-primary text-white"
                      : "text-base-content/75 hover:bg-base-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredCourses.length === 0 ? (
          <div className="card bg-base-100 border border-base-200 shadow-sm p-8 text-center space-y-2">
            <GraduationCap className="size-8 mx-auto text-base-content/40" />
            <p className="font-bold text-base-content">
              {courses.length === 0
                ? "No courses created yet"
                : "No courses match the current filter"}
            </p>
            <p className="text-xs text-base-content/70 max-w-sm mx-auto">
              {courses.length === 0
                ? "Create your first training course to configure delivery modes, schedule sessions, and track staff enrollments."
                : "Try clearing the search query or switching the course status tab."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {filteredCourses.map((course) => {
              const statusLower = String(
                course.status ?? "draft",
              ).toLowerCase();
              return (
                <div
                  key={course.id}
                  onClick={() => onSelectCourse?.(course)}
                  className="card bg-base-100 border border-base-200 shadow-sm p-5 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${getCategoryBadgeClass(
                            course.category,
                          )}`}
                        >
                          {course.category}
                        </span>
                        {course.mandatory && (
                          <span className="badge badge-xs badge-error badge-outline font-semibold">
                            Mandatory
                          </span>
                        )}
                      </div>

                      {/* Status Badge & Actions */}
                      <div
                        className="flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {statusLower === "draft" && (
                          <span className="badge badge-xs badge-warning badge-outline font-medium">
                            Draft
                          </span>
                        )}
                        {statusLower === "published" && (
                          <span className="badge badge-xs badge-success badge-outline font-medium">
                            Published
                          </span>
                        )}
                        {statusLower === "archived" && (
                          <span className="badge badge-xs badge-ghost font-medium">
                            Archived
                          </span>
                        )}

                        <div className="dropdown dropdown-end">
                          <button
                            type="button"
                            tabIndex={0}
                            className="btn btn-ghost btn-sm btn-circle text-base-content/60 hover:text-base-content"
                            title="Course Actions"
                          >
                            <MoreVertical className="size-3.5" />
                          </button>
                          <ul
                            tabIndex={0}
                            className="dropdown-content z-20 menu p-1.5 shadow-lg bg-base-100 rounded-xl border border-base-200 text-xs w-44 space-y-0.5"
                          >
                            {onSelectCourse && (
                              <li>
                                <button
                                  type="button"
                                  onClick={() => onSelectCourse(course)}
                                  className="gap-1.5 font-medium"
                                >
                                  <Eye className="size-3.5" />
                                  <span>View details</span>
                                </button>
                              </li>
                            )}
                            {onEditCourse && statusLower !== "archived" && (
                              <li>
                                <button
                                  type="button"
                                  onClick={() => onEditCourse(course)}
                                  className="gap-1.5 font-medium"
                                >
                                  <Pencil className="size-3.5" />
                                  <span>Edit course</span>
                                </button>
                              </li>
                            )}
                            {onScheduleSession &&
                              statusLower !== "archived" && (
                                <li>
                                  <button
                                    type="button"
                                    onClick={() => onScheduleSession(course.id)}
                                    className="gap-1.5 font-medium"
                                  >
                                    <CalendarPlus className="size-3.5" />
                                    <span>Schedule session</span>
                                  </button>
                                </li>
                              )}
                            {statusLower === "draft" && onPublishCourse && (
                              <li>
                                <button
                                  type="button"
                                  onClick={() => onPublishCourse(course.id)}
                                  className="text-primary hover:bg-primary/10 gap-1.5 font-medium"
                                >
                                  <UploadCloud className="size-3.5" />
                                  <span>Publish</span>
                                </button>
                              </li>
                            )}
                            {statusLower !== "archived" && onArchiveCourse && (
                              <li>
                                <button
                                  type="button"
                                  onClick={() => onArchiveCourse(course.id)}
                                  className="text-error hover:bg-error/10 gap-1.5 font-medium"
                                >
                                  <Archive className="size-3.5" />
                                  <span>Archive</span>
                                </button>
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <p className="mt-3 font-bold text-sm sm:text-base text-base-content line-clamp-1">
                      {course.title}
                    </p>

                    <div className="flex items-center justify-between text-xs text-base-content/80 mt-1">
                      <span>{course.enrolled} enrolled</span>
                      <span className="text-base-content/60">
                        {course.mode}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 space-y-1.5 pt-3 border-t border-base-200">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-base-content/80 font-medium">
                        Completion rate
                      </span>
                      <span className="font-bold text-primary">
                        {course.completionRate}%
                      </span>
                    </div>
                    <progress
                      className={`progress w-full h-2 ${getProgressColor(
                        course.completionRate,
                      )}`}
                      value={course.completionRate}
                      max="100"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
