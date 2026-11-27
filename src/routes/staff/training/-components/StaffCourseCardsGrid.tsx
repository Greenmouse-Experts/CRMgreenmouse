import { useState } from "react";
import type { Course } from "@/routes/hr/training/-components/types";
import type { StaffTrainingScopeTab } from "../../-components/staffScoping";
import {
  Award,
  BookOpen,
  Building2,
  CheckCircle2,
  Eye,
  GraduationCap,
  Search,
} from "lucide-react";
import StatCard from "@/components/StatCard";

interface StaffCourseCardsGridProps {
  allRelevantCourses: Course[];
  displayedCourses: Course[];
  enrolledCourseIds: Set<string>;
  departmentName?: string;
  scopeTab: StaffTrainingScopeTab;
  onChangeScopeTab: (tab: StaffTrainingScopeTab) => void;
  onSelectCourse: (course: Course) => void;
}

const stripHtml = (html?: string): string => {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
};

export default function StaffCourseCardsGrid({
  allRelevantCourses,
  displayedCourses,
  enrolledCourseIds,
  departmentName,
  scopeTab,
  onChangeScopeTab,
  onSelectCourse,
}: StaffCourseCardsGridProps) {
  const [searchTerm, setSearchTerm] = useState("");

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

  const deptTargetedCount = allRelevantCourses.filter(
    (c) => String(c.targetType ?? "").toLowerCase() === "department",
  ).length;
  const enrolledCount = allRelevantCourses.filter((c) =>
    enrolledCourseIds.has(c.id),
  ).length;
  const certifiedCount = allRelevantCourses.filter(
    (c) => c.certificateOnCompletion,
  ).length;

  const filteredCourses = displayedCourses.filter((course) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      course.title.toLowerCase().includes(q) ||
      course.category.toLowerCase().includes(q) ||
      (course.mode && course.mode.toLowerCase().includes(q)) ||
      stripHtml(course.learningObjectives).toLowerCase().includes(q)
    );
  });

  const getAudienceLabel = (course: Course) => {
    const t = String(course.targetType ?? "all").toLowerCase();
    if (t === "department") {
      return departmentName ? `Dept: ${departmentName}` : "Your Department";
    }
    if (t === "all") return "All Staff";
    if (t === "role") return "Role-Based";
    if (t === "selected") return "Assigned to You";
    return "Assigned";
  };

  return (
    <div className="space-y-6">
      {/* KPI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Available Trainings"
          value={allRelevantCourses.length}
          desc="Programs open to you"
          icon={<GraduationCap className="size-5" />}
          variant="primary"
        />
        <StatCard
          title="Department Trainings"
          value={deptTargetedCount}
          desc={
            departmentName
              ? `Targeted to ${departmentName}`
              : "Targeted to your department"
          }
          icon={<Building2 className="size-5" />}
          variant="info"
        />
        <StatCard
          title="Enrolled Programs"
          value={enrolledCount}
          desc="Active enrollments in progress"
          icon={<CheckCircle2 className="size-5" />}
          variant="success"
        />
        <StatCard
          title="Certified Courses"
          value={certifiedCount}
          desc="Issue completion certificates"
          icon={<Award className="size-5" />}
          variant="warning"
        />
      </div>

      {/* Course Grid Header & Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-base-content">
                Training Courses
              </h2>
              <span className="badge badge-sm badge-ghost font-semibold">
                {filteredCourses.length} programs
              </span>
              {departmentName && (
                <span className="badge badge-sm badge-primary badge-outline font-medium gap-1">
                  <Building2 className="size-3" />
                  {departmentName}
                </span>
              )}
            </div>
            <p className="text-xs text-base-content/80 mt-0.5">
              Courses created by HR for your department or assigned to you.
              Click any course to view objectives, sessions, and materials.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-56">
              <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/70" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search trainings..."
                className="input input-sm input-bordered w-full pl-9 rounded-xl bg-base-100"
              />
            </div>

            <div className="join rounded-xl bg-base-100 border border-base-200 p-0.5">
              {(
                [
                  { key: "all-relevant", label: "Department & Assigned" },
                  { key: "department", label: "My Department" },
                  { key: "enrolled", label: "Enrolled" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => onChangeScopeTab(tab.key)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                    scopeTab === tab.key
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
          <div className="card bg-base-100 border border-base-200 shadow-sm p-10 text-center space-y-2">
            <BookOpen className="size-8 mx-auto text-base-content/40" />
            <p className="font-bold text-base-content">
              No training courses match this view
            </p>
            <p className="text-xs text-base-content/70 max-w-md mx-auto">
              {scopeTab === "department"
                ? departmentName
                  ? `HR hasn't assigned any department-specific trainings to ${departmentName} yet.`
                  : "Your employee profile is not currently mapped to a department."
                : "Check back later for new courses published for your department."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredCourses.map((course) => {
              const statusLower = String(
                course.status ?? "published",
              ).toLowerCase();
              const isEnrolled = enrolledCourseIds.has(course.id);
              const objectiveSnippet = stripHtml(course.learningObjectives);

              return (
                <div
                  key={course.id}
                  onClick={() => onSelectCourse(course)}
                  className="card bg-base-100 border border-base-200 shadow-sm p-5 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${getCategoryBadgeClass(
                            course.category,
                          )}`}
                        >
                          {course.category}
                        </span>
                        {course.mandatory && (
                          <span className="badge badge-sm badge-error badge-outline font-semibold">
                            Mandatory
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {isEnrolled && (
                          <span className="badge badge-sm badge-primary font-medium">
                            Enrolled
                          </span>
                        )}
                        {statusLower === "draft" ? (
                          <span className="badge badge-sm badge-warning badge-outline font-medium">
                            Upcoming
                          </span>
                        ) : (
                          <span className="badge badge-sm badge-success badge-outline font-medium">
                            Published
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-base text-base-content line-clamp-2">
                        {course.title}
                      </h3>
                      {objectiveSnippet && (
                        <p className="text-xs text-base-content/75 mt-1.5 line-clamp-2">
                          {objectiveSnippet}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-base-200">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-base-content/80">
                      <span className="inline-flex items-center gap-1 font-medium text-primary">
                        <Building2 className="size-3.5" />
                        {getAudienceLabel(course)}
                      </span>
                      <span>{course.mode || "Virtual"}</span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-base-content/70 inline-flex items-center gap-1">
                        {course.certificateOnCompletion ? (
                          <>
                            <Award className="size-3.5 text-amber-500" />
                            Certificate included
                          </>
                        ) : (
                          "Participation training"
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCourse(course);
                        }}
                        className="btn btn-sm btn-ghost text-primary hover:bg-primary/10 rounded-lg gap-1"
                      >
                        <Eye className="size-3.5" />
                        <span>View details</span>
                      </button>
                    </div>
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
