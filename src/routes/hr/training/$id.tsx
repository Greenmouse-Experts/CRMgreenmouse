import { useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import PageHeader from "@/components/Headers/PageHeader";
import QueryCompLayout from "@/components/layout/QueryCompLayout";
import StatCard from "@/components/StatCard";
import { RichTextContent } from "@/components/inputs/RichTextEditor";
import EditCourseModal from "./-components/EditCourseModal";
import ScheduleSessionModal from "./-components/ScheduleSessionModal";
import CancelSessionModal from "./-components/CancelSessionModal";
import SessionDetailModal from "./-components/SessionDetailModal";
import type { TrainingSession } from "./-components/types";
import {
  formatCourseCost,
  formatSessionDate,
  formatSessionDateTime,
  mapBackendCategoryToUi,
  mapBackendDeliveryModeToUi,
  mapBackendSessionRecordToUi,
  mapCourseRecordToUi,
  normalizeTrainingParticipant,
} from "./-components/mappers";
import {
  downloadTrainingMaterial,
  useAdvanceTrainingSessionStatus,
  useArchiveTrainingCourse,
  useAssignEnrollmentSession,
  useCancelTrainingSession,
  useCompleteTrainingEnrollment,
  useCreateTrainingSession,
  useIssueTrainingCertificate,
  useMarkTrainingAttendance,
  usePublishTrainingCourse,
  useTrainingCourse,
  useTrainingCourseMaterials,
  useTrainingCourses,
  useUpdateTrainingCourse,
  useUploadTrainingMaterial,
  type CreateTrainingSessionPayload,
  type TrainingMaterialItem,
  type UpdateTrainingCoursePayload,
} from "@/api/trainingApi";
import { useEmployeeOrganization, useEmployees } from "@/api/employeesApi";
import { useRoles, useStaffs } from "@/api/tenantApi";
import { extract_message } from "@/helpers/errors";
import { toast } from "sonner";
import {
  Archive,
  ArrowLeft,
  Award,
  BookOpen,
  Calendar,
  CalendarPlus,
  Check,
  CheckCircle2,
  Coins,
  Download,
  ExternalLink,
  FileText,
  GraduationCap,
  MapPin,
  MinusCircle,
  Pencil,
  Play,
  Upload,
  UploadCloud,
  Users,
  Video,
  X,
  XCircle,
} from "lucide-react";

export const Route = createFileRoute("/hr/training/$id")({
  component: TrainingCourseDetailPage,
});

function TrainingCourseDetailPage() {
  const { id } = Route.useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const courseQuery = useTrainingCourse(id);
  const catalogQuery = useTrainingCourses();
  const materialsQuery = useTrainingCourseMaterials(id);
  const staffsQuery = useStaffs();
  const orgQuery = useEmployeeOrganization();
  const rolesQuery = useRoles();
  const employeesQuery = useEmployees();

  const updateCourseMutation = useUpdateTrainingCourse();
  const publishCourseMutation = usePublishTrainingCourse();
  const archiveCourseMutation = useArchiveTrainingCourse();
  const createSessionMutation = useCreateTrainingSession();
  const advanceSessionMutation = useAdvanceTrainingSessionStatus();
  const cancelSessionMutation = useCancelTrainingSession();
  const uploadMaterialMutation = useUploadTrainingMaterial();
  const markAttendanceMutation = useMarkTrainingAttendance();
  const assignSessionMutation = useAssignEnrollmentSession();
  const completeEnrollmentMutation = useCompleteTrainingEnrollment();
  const issueCertificateMutation = useIssueTrainingCertificate();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<TrainingSession | null>(
    null,
  );
  const [selectedSessionModal, setSelectedSessionModal] =
    useState<TrainingSession | null>(null);
  const [sessionFilterId, setSessionFilterId] = useState<string>("all");

  // Per-participant inline panels
  const [certTargetId, setCertTargetId] = useState<string | null>(null);
  const [certUrl, setCertUrl] = useState("");
  const [completeTargetId, setCompleteTargetId] = useState<string | null>(null);
  const [completionNotes, setCompletionNotes] = useState("");

  const staffNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const staff of staffsQuery.data ?? []) {
      const fullName =
        `${staff.firstName ?? ""} ${staff.lastName ?? ""}`.trim();
      map[staff.id] = fullName || staff.email || staff.id;
    }
    return map;
  }, [staffsQuery.data]);

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
    if (type === "role") {
      const roleMap = new Map(
        (rolesQuery.data ?? []).map((r) => [r.id, r.name]),
      );
      const names = ids.map((tid) => roleMap.get(tid)).filter(Boolean);
      return names.length > 0 ? names.join(", ") : `${ids.length} role(s)`;
    }
    if (type === "selected") {
      const empMap = new Map(
        (employeesQuery.data ?? []).map((e) => [
          e.id,
          `${e.firstName ?? ""} ${e.lastName ?? ""}`.trim() ||
            e.email ||
            e.employeeNumber ||
            e.id,
        ]),
      );
      const names = ids.map((tid) => empMap.get(tid)).filter(Boolean);
      return names.length > 0
        ? names.join(", ")
        : `${ids.length} selected employee(s)`;
    }
    return type;
  }, [
    courseQuery.data,
    orgQuery.data?.departments,
    rolesQuery.data,
    employeesQuery.data,
  ]);

  const catalogEntry = useMemo(
    () => (catalogQuery.data ?? []).find((c) => c.course.id === id),
    [catalogQuery.data, id],
  );

  const handleUpdateCourse = async (
    courseId: string,
    payload: UpdateTrainingCoursePayload,
  ) => {
    try {
      const updated = await updateCourseMutation.mutateAsync({
        id: courseId,
        ...payload,
      });
      toast.success(`"${updated.title}" updated`);
    } catch (err) {
      toast.error(extract_message(err));
      throw err;
    }
  };

  const handlePublish = async () => {
    try {
      await publishCourseMutation.mutateAsync(id);
      toast.success("Course published successfully!");
    } catch (err) {
      toast.error(extract_message(err));
    }
  };

  const handleArchive = async () => {
    try {
      await archiveCourseMutation.mutateAsync(id);
      toast.success("Course archived.");
    } catch (err) {
      toast.error(extract_message(err));
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

  const handleAdvanceSession = async (
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
      setCancelTarget(null);
    } catch (err) {
      toast.error(extract_message(err));
    }
  };

  const handleUploadMaterial = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadMaterialMutation.mutateAsync({ courseId: id, file });
      toast.success("Training material uploaded");
    } catch (err) {
      toast.error(extract_message(err));
    } finally {
      e.target.value = "";
    }
  };

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

  const handleAttendance = async (
    sessionId: string,
    enrollmentId: string,
    status: "attended" | "absent" | "excused",
  ) => {
    try {
      await markAttendanceMutation.mutateAsync({
        sessionId,
        enrollmentId,
        status,
      });
      toast.success(`Attendance marked as ${status}`);
    } catch (err) {
      toast.error(extract_message(err));
    }
  };

  const handleAssignSession = async (
    enrollmentId: string,
    sessionId: string,
  ) => {
    if (!sessionId) return;
    try {
      await assignSessionMutation.mutateAsync({ enrollmentId, sessionId });
      toast.success("Participant session updated");
    } catch (err) {
      toast.error(extract_message(err));
    }
  };

  const handleCompleteEnrollment = async (enrollmentId: string) => {
    try {
      await completeEnrollmentMutation.mutateAsync({
        enrollmentId,
        notes: completionNotes.trim() || undefined,
      });
      toast.success("Enrollment marked as completed");
      setCompleteTargetId(null);
      setCompletionNotes("");
    } catch (err) {
      toast.error(extract_message(err));
    }
  };

  const handleIssueCertificate = async (enrollmentId: string) => {
    if (!certUrl.trim()) {
      toast.error("Please enter a certificate URL.");
      return;
    }
    try {
      await issueCertificateMutation.mutateAsync({
        enrollmentId,
        certificateUrl: certUrl.trim(),
      });
      toast.success("Certificate issued");
      setCertTargetId(null);
      setCertUrl("");
    } catch (err) {
      toast.error(extract_message(err));
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <Link
          to="/hr/training"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-base-content/75 hover:text-primary transition-colors"
        >
          <ArrowLeft className="size-4" />
          <span>Back to Training & Development</span>
        </Link>
      </div>

      <QueryCompLayout query={courseQuery}>
        {(detail) => {
          const participants = (detail.participants ?? []).map(
            normalizeTrainingParticipant,
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
          const activeAssignableSessions = sessions.filter(
            (s) => s.status !== "Cancelled",
          );
          const sessionMap = new Map(sessions.map((s) => [s.id, s]));

          const materials =
            materialsQuery.data && materialsQuery.data.length > 0
              ? materialsQuery.data
              : (detail.materials ?? []);

          const completedCount = participants.filter(
            (p) => p.status.toLowerCase() === "completed",
          ).length;
          const totalEnrolled =
            catalogEntry?.enrolled ?? participants.length ?? 0;
          const completionPercent =
            catalogEntry?.completionPercent ??
            (totalEnrolled > 0
              ? Math.round((completedCount / totalEnrolled) * 100)
              : 0);

          const uiCourse = mapCourseRecordToUi(detail, {
            enrolled: totalEnrolled,
            completionPercent,
          });

          const statusLower = String(detail.status ?? "draft").toLowerCase();
          const hasScheduledSession = sessions.some(
            (s) => s.status === "Scheduled",
          );

          const filteredParticipants =
            sessionFilterId === "all"
              ? participants
              : sessionFilterId === "unassigned"
                ? participants.filter((p) => !p.sessionId)
                : participants.filter((p) => p.sessionId === sessionFilterId);

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
              {/* Header */}
              <PageHeader
                title={detail.title}
                description={`${mapBackendCategoryToUi(detail.category)} • ${mapBackendDeliveryModeToUi(detail.defaultDeliveryMode)} • Target: ${targetSummary}`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  {statusLower !== "archived" && (
                    <button
                      type="button"
                      onClick={() => setIsEditOpen(true)}
                      className="btn btn-sm btn-outline border-base-300 hover:bg-base-200 rounded-xl gap-1.5"
                    >
                      <Pencil className="size-4" />
                      <span>Edit course</span>
                    </button>
                  )}

                  {statusLower !== "archived" && (
                    <button
                      type="button"
                      onClick={() => setIsScheduleOpen(true)}
                      className="btn btn-sm btn-outline border-base-300 hover:bg-base-200 rounded-xl gap-1.5"
                    >
                      <CalendarPlus className="size-4" />
                      <span>Schedule session</span>
                    </button>
                  )}

                  {statusLower === "draft" && (
                    <button
                      type="button"
                      onClick={handlePublish}
                      disabled={publishCourseMutation.isPending}
                      className="btn btn-sm bg-primary text-white hover:bg-primary/90 border-0 rounded-xl gap-1.5 shadow-sm shadow-primary/20"
                    >
                      <UploadCloud className="size-4" />
                      <span>
                        {publishCourseMutation.isPending
                          ? "Publishing..."
                          : "Publish course"}
                      </span>
                    </button>
                  )}

                  {statusLower !== "archived" && (
                    <button
                      type="button"
                      onClick={handleArchive}
                      disabled={archiveCourseMutation.isPending}
                      className="btn btn-sm btn-outline btn-error rounded-xl gap-1.5"
                    >
                      <Archive className="size-4" />
                      <span>
                        {archiveCourseMutation.isPending
                          ? "Archiving..."
                          : "Archive"}
                      </span>
                    </button>
                  )}
                </div>
              </PageHeader>

              {/* Status & Draft Warning Banner */}
              {statusLower === "draft" && !hasScheduledSession && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 flex flex-wrap items-center justify-between gap-2">
                  <span>
                    This course is currently a <strong>Draft</strong>. Schedule
                    at least one session before publishing it to staff.
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsScheduleOpen(true)}
                    className="btn btn-sm bg-amber-600 text-white border-0 rounded-lg"
                  >
                    Schedule first session
                  </button>
                </div>
              )}

              {/* KPI Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                  title="Course Status"
                  value={
                    <span className="capitalize">
                      {detail.status || "draft"}
                    </span>
                  }
                  desc={
                    detail.mandatory
                      ? "Mandatory compliance course"
                      : "Optional learning"
                  }
                  icon={<GraduationCap className="size-5" />}
                  variant="primary"
                />

                <StatCard
                  title="Enrolled Staff"
                  value={totalEnrolled}
                  desc={`${completedCount} completed (${Math.round(completionPercent)}%)`}
                  icon={<Users className="size-5" />}
                  variant="info"
                />

                <StatCard
                  title="Sessions"
                  value={sessions.length}
                  desc={`${sessions.filter((s) => s.status === "Scheduled" || s.status === "In Progress").length} active / upcoming`}
                  icon={<Calendar className="size-5" />}
                  variant="success"
                />

                <StatCard
                  title="Cost / Participant"
                  value={formatCourseCost(detail.costPerPersonKobo)}
                  desc={
                    detail.certificateOnCompletion
                      ? "Certificate issued on completion"
                      : "No certificate issued"
                  }
                  icon={<Coins className="size-5" />}
                  variant="warning"
                />
              </div>

              {/* Overview & Materials Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Curriculum / Objectives */}
                <div className="lg:col-span-2 card bg-base-100 border border-base-200 shadow-sm p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-base-200">
                    <div className="flex items-center gap-2">
                      <BookOpen className="size-5 text-primary" />
                      <h2 className="text-base font-bold text-base-content">
                        Curriculum & Overview
                      </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="badge  badge-outline font-semibold">
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
                        <span className="badge  badge-success badge-outline gap-1">
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

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-base-200 text-xs">
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
                        Created Date
                      </span>
                      <span className="font-semibold text-base-content">
                        {formatSessionDate(detail.createdAt)}
                      </span>
                    </div>
                    <div>
                      <span className="text-base-content/60 block">
                        {detail.archivedAt ? "Archived Date" : "Published Date"}
                      </span>
                      <span className="font-semibold text-base-content">
                        {detail.archivedAt
                          ? formatSessionDate(detail.archivedAt)
                          : formatSessionDate(detail.publishedAt ?? undefined)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Course Materials */}
                <div className="card bg-base-100 border border-base-200 shadow-sm p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-base-200">
                    <h2 className="text-base font-bold text-base-content">
                      Materials ({materials.length})
                    </h2>
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={handleUploadMaterial}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadMaterialMutation.isPending}
                        className="btn btn-sm btn-outline rounded-lg gap-1"
                      >
                        <Upload className="size-3.5" />
                        <span>
                          {uploadMaterialMutation.isPending
                            ? "Uploading..."
                            : "Upload"}
                        </span>
                      </button>
                    </div>
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

              {/* Sessions Management */}
              <div className="card bg-base-100 border border-base-200 shadow-sm p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-base-200">
                  <div>
                    <div className="flex items-center gap-2">
                      <Calendar className="size-5 text-primary" />
                      <h2 className="text-base font-bold text-base-content">
                        Training Sessions ({sessions.length})
                      </h2>
                    </div>
                    <p className="text-xs text-base-content/75 mt-0.5">
                      Start scheduled cohorts, mark completed sessions, or
                      manage session rosters.
                    </p>
                  </div>

                  {statusLower !== "archived" && (
                    <button
                      type="button"
                      onClick={() => setIsScheduleOpen(true)}
                      className="btn btn-sm bg-primary text-white hover:bg-primary/90 rounded-lg gap-1"
                    >
                      <CalendarPlus className="size-3.5" />
                      <span>Add session</span>
                    </button>
                  )}
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
                        className="rounded-xl border border-base-200 bg-base-200/20 p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
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
                          <div>
                            <span className="text-base-content/60">
                              Capacity:{" "}
                            </span>
                            <span className="font-medium">
                              {session.enrolled ?? 0} /{" "}
                              {session.capacity ?? "—"}
                            </span>
                          </div>
                          <div>
                            <span className="text-base-content/60">Mode: </span>
                            <span className="font-medium">{session.mode}</span>
                          </div>
                        </div>

                        {session.cancellationReason && (
                          <div className="rounded-lg bg-error/10 border border-error/20 px-2.5 py-1.5 text-xs text-error">
                            Cancelled: {session.cancellationReason}
                          </div>
                        )}

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-base-200">
                          <button
                            type="button"
                            onClick={() => setSelectedSessionModal(session)}
                            className="btn btn-sm btn-ghost text-primary rounded-lg gap-1"
                          >
                            <Users className="size-3.5" />
                            <span>Manage session roster</span>
                          </button>

                          <div className="flex flex-wrap items-center gap-1.5">
                            {session.status === "Scheduled" && (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleAdvanceSession(
                                      session.id,
                                      "in_progress",
                                    )
                                  }
                                  disabled={advanceSessionMutation.isPending}
                                  className="btn  bg-primary text-white hover:bg-primary/90 rounded-lg gap-1"
                                >
                                  <Play className="size-3" />
                                  <span>Start session</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setCancelTarget(session)}
                                  className="btn  btn-outline btn-error rounded-lg gap-1"
                                >
                                  <XCircle className="size-3" />
                                  <span>Cancel</span>
                                </button>
                              </>
                            )}
                            {session.status === "In Progress" && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleAdvanceSession(session.id, "completed")
                                }
                                disabled={advanceSessionMutation.isPending}
                                className="btn btn-sm bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg gap-1"
                              >
                                <CheckCircle2 className="size-3" />
                                <span>Complete session</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Participants & Enrollments Section */}
              <div className="card bg-base-100 border border-base-200 shadow-sm p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-base-200">
                  <div>
                    <div className="flex items-center gap-2">
                      <Users className="size-5 text-primary" />
                      <h2 className="text-base font-bold text-base-content">
                        Participants & Enrollments (
                        {filteredParticipants.length})
                      </h2>
                    </div>
                    <p className="text-xs text-base-content/75 mt-0.5">
                      Assign cohorts, record attendance, mark completions, and
                      issue certificates.
                    </p>
                  </div>

                  {sessions.length > 0 && (
                    <select
                      value={sessionFilterId}
                      onChange={(e) => setSessionFilterId(e.target.value)}
                      className="select select-sm select-bordered rounded-xl bg-base-200/80 text-xs w-full sm:w-64"
                    >
                      <option value="all">
                        All participants ({participants.length})
                      </option>
                      {sessions.map((s) => (
                        <option key={s.id} value={s.id}>
                          Session: {s.date} ({s.status})
                        </option>
                      ))}
                      <option value="unassigned">Unassigned to session</option>
                    </select>
                  )}
                </div>

                {filteredParticipants.length === 0 ? (
                  <p className="text-sm text-base-content/70 py-6 text-center">
                    No participants enrolled yet. Publishing the course
                    automatically enrolls eligible staff.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {filteredParticipants.map((p) => {
                      const assignedSession = p.sessionId
                        ? sessionMap.get(p.sessionId)
                        : undefined;
                      const isCompleted =
                        p.status.toLowerCase() === "completed";

                      return (
                        <div
                          key={p.enrollmentId || p.employeeId}
                          className="rounded-xl border border-base-200 bg-base-100 p-3.5 space-y-2.5"
                        >
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-bold text-sm text-base-content">
                                  {p.name}
                                </span>
                                {p.employeeNumber && (
                                  <span className="badge badge-sm badge-ghost font-mono">
                                    {p.employeeNumber}
                                  </span>
                                )}
                                {p.department && (
                                  <span className="badge badge-sm badge-outline">
                                    {p.department}
                                  </span>
                                )}
                                <span
                                  className={`badge badge-sm font-semibold capitalize ${
                                    isCompleted
                                      ? "badge-success badge-outline"
                                      : "badge-info badge-outline"
                                  }`}
                                >
                                  {p.status.replace(/_/g, " ")}
                                </span>
                                <span className="badge badge-sm badge-ghost capitalize">
                                  Attendance:{" "}
                                  {p.attendanceStatus.replace(/_/g, " ")}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-3 text-xs text-base-content/70">
                                <span>
                                  Session:{" "}
                                  <strong>
                                    {assignedSession
                                      ? `${assignedSession.date} (${assignedSession.mode})`
                                      : "Unassigned"}
                                  </strong>
                                </span>
                                {p.certificateUrl && (
                                  <a
                                    href={p.certificateUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-primary font-medium hover:underline"
                                  >
                                    <Award className="size-3.5" />
                                    <span>View certificate</span>
                                    <ExternalLink className="size-3" />
                                  </a>
                                )}
                              </div>
                            </div>

                            {p.enrollmentId && (
                              <div className="flex flex-wrap items-center gap-1.5">
                                {activeAssignableSessions.length > 0 && (
                                  <select
                                    value={p.sessionId || ""}
                                    onChange={(e) =>
                                      handleAssignSession(
                                        p.enrollmentId,
                                        e.target.value,
                                      )
                                    }
                                    disabled={assignSessionMutation.isPending}
                                    className="select select-bordered select-xs rounded-lg bg-base-200/80"
                                    title="Assign or change training session"
                                  >
                                    <option value="">Assign session...</option>
                                    {activeAssignableSessions.map((s) => (
                                      <option key={s.id} value={s.id}>
                                        {s.date} — {s.trainer}
                                      </option>
                                    ))}
                                  </select>
                                )}

                                {p.sessionId && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleAttendance(
                                          p.sessionId!,
                                          p.enrollmentId,
                                          "attended",
                                        )
                                      }
                                      disabled={
                                        markAttendanceMutation.isPending
                                      }
                                      className={`btn btn-sm rounded-lg gap-1 ${
                                        p.attendanceStatus === "attended"
                                          ? "btn-success text-white"
                                          : "btn-outline btn-success"
                                      }`}
                                    >
                                      <Check className="size-3" />
                                      <span>Attended</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleAttendance(
                                          p.sessionId!,
                                          p.enrollmentId,
                                          "absent",
                                        )
                                      }
                                      disabled={
                                        markAttendanceMutation.isPending
                                      }
                                      className={`btn btn-sm rounded-lg gap-1 ${
                                        p.attendanceStatus === "absent"
                                          ? "btn-error text-white"
                                          : "btn-outline btn-error"
                                      }`}
                                    >
                                      <X className="size-3" />
                                      <span>Absent</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleAttendance(
                                          p.sessionId!,
                                          p.enrollmentId,
                                          "excused",
                                        )
                                      }
                                      disabled={
                                        markAttendanceMutation.isPending
                                      }
                                      className={`btn btn-sm rounded-lg gap-1 ${
                                        p.attendanceStatus === "excused"
                                          ? "btn-warning text-white"
                                          : "btn-outline btn-warning"
                                      }`}
                                    >
                                      <MinusCircle className="size-3" />
                                      <span>Excused</span>
                                    </button>
                                  </>
                                )}

                                {!isCompleted && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCompleteTargetId(p.enrollmentId);
                                      setCompletionNotes("");
                                      setCertTargetId(null);
                                    }}
                                    className="btn btn-sm btn-outline rounded-lg gap-1"
                                  >
                                    <CheckCircle2 className="size-3" />
                                    <span>Complete</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => {
                                    setCertTargetId(p.enrollmentId);
                                    setCertUrl(p.certificateUrl || "");
                                    setCompleteTargetId(null);
                                  }}
                                  className="btn btn-sm btn-ghost text-primary rounded-lg gap-1"
                                >
                                  <Award className="size-3" />
                                  <span>
                                    {p.certificateUrl
                                      ? "Update cert"
                                      : "Certificate"}
                                  </span>
                                </button>
                              </div>
                            )}
                          </div>

                          {completeTargetId === p.enrollmentId && (
                            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-base-200">
                              <input
                                type="text"
                                value={completionNotes}
                                onChange={(e) =>
                                  setCompletionNotes(e.target.value)
                                }
                                placeholder="Completion notes (optional)..."
                                className="input input-bordered input-xs flex-1 rounded-lg bg-base-200/80"
                              />
                              <button
                                type="button"
                                disabled={completeEnrollmentMutation.isPending}
                                onClick={() =>
                                  handleCompleteEnrollment(p.enrollmentId)
                                }
                                className="btn btn-sm bg-primary text-white rounded-lg"
                              >
                                Confirm completion
                              </button>
                              <button
                                type="button"
                                onClick={() => setCompleteTargetId(null)}
                                className="btn btn-sm btn-ghost rounded-lg"
                              >
                                Cancel
                              </button>
                            </div>
                          )}

                          {certTargetId === p.enrollmentId && (
                            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-base-200">
                              <input
                                type="url"
                                value={certUrl}
                                onChange={(e) => setCertUrl(e.target.value)}
                                placeholder="https://example.com/certificates/..."
                                className="input input-bordered input-xs flex-1 rounded-lg bg-base-200/80"
                              />
                              <button
                                type="button"
                                disabled={issueCertificateMutation.isPending}
                                onClick={() =>
                                  handleIssueCertificate(p.enrollmentId)
                                }
                                className="btn btn-sm bg-primary text-white rounded-lg"
                              >
                                Issue certificate
                              </button>
                              <button
                                type="button"
                                onClick={() => setCertTargetId(null)}
                                className="btn btn-sm btn-ghost rounded-lg"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Modals */}
              <EditCourseModal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                course={uiCourse}
                onUpdateCourse={handleUpdateCourse}
              />

              <ScheduleSessionModal
                isOpen={isScheduleOpen}
                onClose={() => setIsScheduleOpen(false)}
                courses={[uiCourse]}
                defaultCourseId={detail.id}
                onScheduleSession={handleScheduleSession}
              />

              <CancelSessionModal
                isOpen={Boolean(cancelTarget)}
                onClose={() => setCancelTarget(null)}
                sessionLabel={
                  cancelTarget
                    ? `${cancelTarget.course} (${cancelTarget.date})`
                    : undefined
                }
                isPending={cancelSessionMutation.isPending}
                onConfirm={async (reason) => {
                  if (cancelTarget) {
                    await handleCancelSession(cancelTarget.id, reason);
                  }
                }}
              />

              <SessionDetailModal
                isOpen={Boolean(selectedSessionModal)}
                onClose={() => setSelectedSessionModal(null)}
                session={selectedSessionModal}
                onAdvanceStatus={handleAdvanceSession}
                onCancelSession={handleCancelSession}
              />
            </div>
          );
        }}
      </QueryCompLayout>
    </div>
  );
}
