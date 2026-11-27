import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import PageHeader from "@/components/Headers/PageHeader";
import QueryCompLayout from "@/components/layout/QueryCompLayout";
import StatCard from "@/components/StatCard";
import { RichTextContent } from "@/components/inputs/RichTextEditor";
import { useCurrentStaffIdentity } from "../-components/useCurrentStaffIdentity";
import { isCourseRelevantToStaff } from "../-components/staffScoping";
import {
  formatSessionDate,
  formatSessionDateTime,
  mapBackendCategoryToUi,
  mapBackendDeliveryModeToUi,
  mapBackendSessionRecordToUi,
  normalizeTrainingParticipant,
} from "@/routes/hr/training/-components/mappers";
import type { TrainingSession } from "@/routes/hr/training/-components/types";
import {
  downloadTrainingMaterial,
  useMyTrainingLearning,
  useTrainingCourse,
  useTrainingCourseMaterials,
  type TrainingMaterialItem,
} from "@/api/trainingApi";
import { useEmployeeColleagues } from "@/api/employeesApi";
import { usePortalOrganization } from "@/api/organizationApi";
import { extract_message } from "@/helpers/errors";
import { toast } from "sonner";
import {
  ArrowLeft,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  GraduationCap,
  MapPin,
  ShieldAlert,
  Video,
} from "lucide-react";

export const Route = createFileRoute("/staff/training/$id")({
  component: StaffTrainingCourseDetailPage,
});

function StaffTrainingCourseDetailPage() {
  const { id } = Route.useParams();

  const { identity } = useCurrentStaffIdentity();
  const courseQuery = useTrainingCourse(id);
  const materialsQuery = useTrainingCourseMaterials(id);
  const myLearningQuery = useMyTrainingLearning();
  const orgQuery = usePortalOrganization();
  const colleaguesQuery = useEmployeeColleagues({ limit: 100 });

  const staffNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const colleague of colleaguesQuery.data?.data ?? []) {
      const fullName =
        `${colleague.firstName ?? ""} ${colleague.lastName ?? ""}`.trim();
      const label = fullName || colleague.email || colleague.id;
      if (colleague.id) map[colleague.id] = label;
      if (colleague.staffId) map[colleague.staffId] = label;
    }
    return map;
  }, [colleaguesQuery.data?.data]);

  const enrolledCourseIds = useMemo(() => {
    const ids = new Set<string>();
    for (const item of myLearningQuery.data ?? []) {
      const cid = item?.courseId || item?.course?.id;
      if (cid) ids.add(String(cid));
    }
    return ids;
  }, [myLearningQuery.data]);

  const myEnrollmentFromLearning = useMemo(
    () =>
      (myLearningQuery.data ?? []).find(
        (item: any) => String(item?.courseId || item?.course?.id || "") === id,
      ),
    [myLearningQuery.data, id],
  );

  const targetSummary = useMemo(() => {
    const detail = courseQuery.data;
    if (!detail) return "—";
    const type = String(detail.targetType || "all").toLowerCase();
    const ids = detail.targetIds ?? [];
    if (type === "all") return "All active staff";
    if (type === "department") {
      const deptMap = new Map(
        (orgQuery.data?.departments ?? []).map((d) => [d.id, d.name]),
      );
      const names = ids.map((tid) => deptMap.get(tid)).filter(Boolean);
      return names.length > 0
        ? names.join(", ")
        : `${ids.length} department(s)`;
    }
    if (type === "role") return "Role-targeted";
    if (type === "selected") return "Selected staff";
    return type;
  }, [courseQuery.data, orgQuery.data?.departments]);

  const handleDownloadMaterial = async (material: TrainingMaterialItem) => {
    try {
      const response = await downloadTrainingMaterial(material.id);
      const blob = new Blob([response.data]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        material.fileName || material.title || material.name || "material";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      if (material.fileUrl || material.url) {
        window.open(material.fileUrl || material.url, "_blank");
      } else {
        toast.error(extract_message(error));
      }
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <Link
          to="/staff/training"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-base-content/75 hover:text-primary transition-colors"
        >
          <ArrowLeft className="size-4" />
          <span>Back to Training &amp; Development</span>
        </Link>
      </div>

      <QueryCompLayout query={courseQuery}>
        {(detail) => {
          const isAllowed = isCourseRelevantToStaff(
            {
              id: detail.id,
              status: detail.status,
              targetType: detail.targetType,
              targetIds: detail.targetIds,
            },
            identity,
            enrolledCourseIds,
          );

          if (!isAllowed) {
            return (
              <div className="card bg-base-100 border border-base-200 shadow-sm p-10 text-center space-y-3 max-w-xl mx-auto">
                <ShieldAlert className="size-10 mx-auto text-amber-500" />
                <h2 className="text-lg font-bold text-base-content">
                  Course Not Assigned to Your Department
                </h2>
                <p className="text-sm text-base-content/75">
                  This training program is targeted to another department or
                  archived. You can view all courses available to your
                  department from the Training catalog.
                </p>
                <div className="pt-2">
                  <Link
                    to="/staff/training"
                    className="btn btn-sm bg-primary text-white border-0 rounded-xl"
                  >
                    Return to My Trainings
                  </Link>
                </div>
              </div>
            );
          }

          const participants = (detail.participants ?? []).map(
            normalizeTrainingParticipant,
          );
          const myParticipant = participants.find(
            (p) =>
              (p.employeeId && identity.idCandidates.has(p.employeeId)) ||
              identity.nameCandidates.has(p.name.trim().toLowerCase()),
          );

          const sessions = (detail.sessions ?? []).map((s) => {
            const count = participants.filter(
              (p) => p.sessionId === s.id,
            ).length;
            return mapBackendSessionRecordToUi(
              s,
              detail.title,
              count,
              staffNameMap,
            );
          });

          const materials =
            materialsQuery.data && materialsQuery.data.length > 0
              ? materialsQuery.data
              : (detail.materials ?? []);

          const myStatus =
            myParticipant?.status ||
            myEnrollmentFromLearning?.status ||
            (enrolledCourseIds.has(detail.id) ? "enrolled" : "eligible");
          const myAttendance =
            myParticipant?.attendanceStatus ||
            myEnrollmentFromLearning?.attendanceStatus ||
            "not_recorded";
          const myCertificateUrl =
            myParticipant?.certificateUrl ||
            myEnrollmentFromLearning?.certificateUrl;

          const sessionStatusBadge = (status: TrainingSession["status"]) => {
            switch (status) {
              case "Scheduled":
                return "bg-blue-50 text-blue-700 border-blue-200";
              case "In Progress":
                return "bg-amber-50 text-amber-700 border-amber-200";
              case "Completed":
                return "bg-emerald-50 text-emerald-700 border-emerald-200";
              case "Cancelled":
              default:
                return "bg-slate-100 text-slate-600 border-slate-200";
            }
          };

          return (
            <div className="space-y-6">
              <PageHeader
                title={detail.title}
                description={`${mapBackendCategoryToUi(detail.category)} • ${mapBackendDeliveryModeToUi(detail.defaultDeliveryMode)} • Audience: ${targetSummary}`}
              />

              {/* KPI Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                  title="Course Status"
                  value={
                    <span className="capitalize">
                      {detail.status || "published"}
                    </span>
                  }
                  desc={
                    detail.mandatory
                      ? "Mandatory course"
                      : "Optional development"
                  }
                  icon={<GraduationCap className="size-5" />}
                  variant="primary"
                />

                <StatCard
                  title="My Status"
                  value={
                    <span className="capitalize">
                      {String(myStatus).replace(/_/g, " ")}
                    </span>
                  }
                  desc={`Attendance: ${String(myAttendance).replace(/_/g, " ")}`}
                  icon={<CheckCircle2 className="size-5" />}
                  variant="info"
                />

                <StatCard
                  title="Sessions"
                  value={sessions.length}
                  desc={`${sessions.filter((s) => s.status === "Scheduled" || s.status === "In Progress").length} upcoming / live`}
                  icon={<Calendar className="size-5" />}
                  variant="success"
                />

                <StatCard
                  title="Certification"
                  value={detail.certificateOnCompletion ? "Included" : "None"}
                  desc={
                    myCertificateUrl
                      ? "Certificate issued"
                      : detail.certificateOnCompletion
                        ? "Issued on completion"
                        : "Completion record only"
                  }
                  icon={<Award className="size-5" />}
                  variant="warning"
                />
              </div>

              {myCertificateUrl && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-emerald-800">
                    <Award className="size-5 text-emerald-600" />
                    <span className="text-sm font-semibold">
                      Your completion certificate is ready!
                    </span>
                  </div>
                  <a
                    href={myCertificateUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sm bg-emerald-600 text-white hover:bg-emerald-700 border-0 rounded-xl gap-1.5"
                  >
                    <Award className="size-4" />
                    <span>View Certificate</span>
                    <ExternalLink className="size-3.5" />
                  </a>
                </div>
              )}

              {/* Overview & Materials */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 card bg-base-100 border border-base-200 shadow-sm p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-base-200">
                    <div className="flex items-center gap-2">
                      <BookOpen className="size-5 text-primary" />
                      <h2 className="text-base font-bold text-base-content">
                        Curriculum &amp; Overview
                      </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="badge badge-outline font-semibold">
                        {mapBackendCategoryToUi(detail.category)}
                      </span>
                      <span className="badge badge-ghost">
                        {mapBackendDeliveryModeToUi(detail.defaultDeliveryMode)}
                      </span>
                      {detail.mandatory && (
                        <span className="badge badge-error badge-outline">
                          Mandatory
                        </span>
                      )}
                      {detail.certificateOnCompletion && (
                        <span className="badge badge-success badge-outline gap-1">
                          <Award className="size-3" />
                          Certificate
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-base-content/70 flex items-center gap-1.5">
                      <FileText className="size-3.5 text-primary" />
                      <span>Learning Objectives</span>
                    </h3>
                    {detail.learningObjectives ? (
                      <RichTextContent value={detail.learningObjectives} />
                    ) : (
                      <p className="text-sm text-base-content/70 italic">
                        No learning objectives provided yet.
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-base-200 text-xs">
                    <div>
                      <span className="text-base-content/60 block">
                        Target Audience
                      </span>
                      <span className="font-semibold text-base-content">
                        {targetSummary}
                      </span>
                    </div>
                    <div>
                      <span className="text-base-content/60 block">
                        Published Date
                      </span>
                      <span className="font-semibold text-base-content">
                        {formatSessionDate(
                          detail.publishedAt ?? detail.createdAt ?? undefined,
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Read-only Materials */}
                <div className="card bg-base-100 border border-base-200 shadow-sm p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-base-200">
                    <h2 className="text-base font-bold text-base-content">
                      Course Materials ({materials.length})
                    </h2>
                  </div>

                  {materialsQuery.isLoading && materials.length === 0 ? (
                    <p className="text-xs text-base-content/70">
                      Loading materials...
                    </p>
                  ) : materials.length === 0 ? (
                    <p className="text-xs text-base-content/70 py-4 text-center">
                      No course materials uploaded yet.
                    </p>
                  ) : (
                    <ul className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {materials.map((m) => (
                        <li
                          key={m.id}
                          className="flex items-center justify-between gap-2 rounded-xl border border-base-200 bg-base-200/40 px-3 py-2.5 text-xs"
                        >
                          <div className="min-w-0">
                            <p className="font-semibold text-base-content truncate">
                              {m.title ||
                                m.fileName ||
                                m.name ||
                                "Course material"}
                            </p>
                            <p className="text-base-content/60 text-[11px]">
                              {m.mimeType || "Document"}{" "}
                              {m.createdAt
                                ? `• ${formatSessionDate(m.createdAt)}`
                                : ""}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDownloadMaterial(m)}
                            className="btn btn-sm btn-ghost text-primary shrink-0 gap-1"
                          >
                            <Download className="size-3.5" />
                            <span>Download</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Read-only Sessions */}
              <div className="card bg-base-100 border border-base-200 shadow-sm p-5 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-base-200">
                  <Calendar className="size-5 text-primary" />
                  <h2 className="text-base font-bold text-base-content">
                    Training Sessions ({sessions.length})
                  </h2>
                </div>

                {sessions.length === 0 ? (
                  <p className="text-sm text-base-content/70 py-6 text-center">
                    No sessions scheduled for this course yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className="rounded-xl border border-base-200 bg-base-200/20 p-4 space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-0.5">
                            <p className="font-bold text-sm text-base-content">
                              {formatSessionDateTime(session.rawStartsAt)}
                            </p>
                            <p className="text-xs text-base-content/70">
                              Ends: {formatSessionDateTime(session.rawEndsAt)}
                            </p>
                          </div>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border ${sessionStatusBadge(
                              session.status,
                            )}`}
                          >
                            {session.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs text-base-content/80">
                          <div className="flex items-center gap-1.5">
                            {session.mode === "Virtual" ? (
                              <Video className="size-3.5 text-info shrink-0" />
                            ) : (
                              <MapPin className="size-3.5 text-emerald-600 shrink-0" />
                            )}
                            {session.meetingUrl ? (
                              <a
                                href={session.meetingUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="truncate text-primary hover:underline inline-flex items-center gap-1"
                              >
                                <span className="truncate">
                                  {session.location || session.meetingUrl}
                                </span>
                                <ExternalLink className="size-3 shrink-0" />
                              </a>
                            ) : (
                              <span className="truncate">
                                {session.location || session.mode}
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="text-base-content/60">
                              Trainer:{" "}
                            </span>
                            <span className="font-medium">
                              {session.trainer}
                            </span>
                          </div>
                        </div>

                        {session.cancellationReason && (
                          <p className="text-xs text-error bg-error/10 rounded-lg px-2.5 py-1.5">
                            Cancelled: {session.cancellationReason}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        }}
      </QueryCompLayout>
    </div>
  );
}
