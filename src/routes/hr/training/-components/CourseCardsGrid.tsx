import type { Course } from "./types";
import { Users, GraduationCap, CheckCircle2, Award } from "lucide-react";
import StatCard from "@/components/StatCard";

interface CourseCardsGridProps {
  courses: Course[];
  onSelectCourse?: (course: Course) => void;
}

export default function CourseCardsGrid({
  courses,
  onSelectCourse,
}: CourseCardsGridProps) {
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
      case "Soft skills":
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

  const totalEnrolled = courses.reduce((sum, c) => sum + c.enrolled, 0);
  const avgCompletion = Math.round(
    courses.reduce((sum, c) => sum + c.completionRate, 0) / (courses.length || 1),
  );

  return (
    <div className="space-y-6">
      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Active Courses"
          value={courses.length}
          desc="Published and ongoing curriculums"
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
              <span className="text-xs font-normal text-base-content/60">%</span>
            </div>
          }
          desc="Overall course progress rate"
          icon={<CheckCircle2 className="size-5" />}
          variant="success"
        />

        <StatCard
          title="Certifications"
          value={184}
          desc="Certificates issued year-to-date"
          icon={<Award className="size-5" />}
          variant="warning"
        />
      </div>

      {/* 4-Card Course Overview Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-base-content">Courses</h2>
            <p className="text-xs text-base-content/60">
              Active company learning curriculums and completion progress.
            </p>
          </div>
          <span className="badge badge-sm badge-ghost text-xs font-semibold">
            {courses.length} programs
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {courses.map((course) => (
            <div
              key={course.id}
              onClick={() => onSelectCourse?.(course)}
              className="card bg-base-100 border border-base-200 shadow-sm p-5 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
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

                <p className="mt-3 font-bold text-sm sm:text-base text-base-content line-clamp-1">
                  {course.title}
                </p>

                <p className="text-xs text-base-content/60 mt-0.5">
                  {course.enrolled} enrolled
                </p>
              </div>

              <div className="mt-5 space-y-1.5 pt-3 border-t border-base-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-base-content/60 font-medium">
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
          ))}
        </div>
      </div>
    </div>
  );
}
