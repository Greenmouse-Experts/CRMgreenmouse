import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import CancelSessionModal from "./CancelSessionModal";
import type { TrainingSession } from "./types";
import {
  mapBackendSessionRecordToUi,
  normalizeTrainingParticipant,
} from "./mappers";
import {
  useAssignEnrollmentSession,
  useCompleteTrainingEnrollment,
  useIssueTrainingCertificate,
  useMarkTrainingAttendance,
  useTrainingCourse,
  useTrainingSessionParticipants,
} from "@/api/trainingApi";
import { extract_message } from "@/helpers/errors";
import { toast } from "sonner";
import {
  ArrowRightLeft,
  Award,
  Calendar,
  Check,
  CheckCircle2,
  ExternalLink,
  MinusCircle,
  Play,
  Users,
  X,
  XCircle,
} from "lucide-react";

interface SessionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: TrainingSession | null;
  onAdvanceStatus?: (
    sessionId: string,
    status: "in_progress" | "completed",
  ) => void;
  onCancelSession?: (sessionId: string, reason: string) => Promise<void> | void;
}

export default function SessionDetailModal({
  isOpen,
  onClose,
  session,
  onAdvanceStatus,
  onCancelSession,
}: SessionDetailModalProps) {
  const modalRef = useRef<ModalHandle>(null);
  const [certTargetId, setCertTargetId] = useState<string | null>(null);
  const [certUrl, setCertUrl] = useState("");
  const [reassignTargetId, setReassignTargetId] = useState<string | null>(null);
  const [targetSessionId, setTargetSessionId] = useState("");
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const participantsQuery = useTrainingSessionParticipants(
    isOpen ? session?.id : undefined,
  );
  const courseQuery = useTrainingCourse(isOpen ? session?.courseId : undefined);
  const markAttendanceMutation = useMarkTrainingAttendance();
  const assignSessionMutation = useAssignEnrollmentSession();
  const completeMutation = useCompleteTrainingEnrollment();
  const certificateMutation = useIssueTrainingCertificate();

  useEffect(() => {
    if (isOpen) {
      setCertTargetId(null);
      setCertUrl("");
      setReassignTargetId(null);
      setTargetSessionId("");
      setIsCancelModalOpen(false);
      modalRef.current?.open();
    } else {
      modalRef.current?.close();
    }
  }, [isOpen]);

  if (!session) return null;

  const participants = (participantsQuery.data ?? []).map(
    normalizeTrainingParticipant,
  );
  const siblingSessions = (courseQuery.data?.sessions ?? [])
    .filter((s) => s.id !== session.id && s.status !== "cancelled")
    .map((s) => mapBackendSessionRecordToUi(s, session.course));

  const handleAttendance = async (
    enrollmentId: string,
    status: "attended" | "absent" | "excused",
  ) => {
    try {
      await markAttendanceMutation.mutateAsync({
        sessionId: session.id,
        enrollmentId,
        status,
      });
      toast.success(`Marked as ${status}`);
    } catch (error) {
      toast.error(extract_message(error as any));
    }
  };

  const handleAssignSession = async (enrollmentId: string) => {
    if (!targetSessionId) {
      toast.error("Please select a target session.");
      return;
    }
    try {
      await assignSessionMutation.mutateAsync({
        enrollmentId,
        sessionId: targetSessionId,
      });
      toast.success("Participant moved to selected session");
      setReassignTargetId(null);
      setTargetSessionId("");
    } catch (error) {
      toast.error(extract_message(error as any));
    }
  };

  const handleComplete = async (enrollmentId: string) => {
    try {
      await completeMutation.mutateAsync({ enrollmentId });
      toast.success("Enrollment marked as completed");
    } catch (error) {
      toast.error(extract_message(error as any));
    }
  };

  const handleIssueCertificate = async (enrollmentId: string) => {
    if (!certUrl.trim()) {
      toast.error("Please enter a certificate URL.");
      return;
    }
    try {
      await certificateMutation.mutateAsync({
        enrollmentId,
        certificateUrl: certUrl.trim(),
      });
      toast.success("Certificate issued");
      setCertTargetId(null);
      setCertUrl("");
    } catch (error) {
      toast.error(extract_message(error as any));
    }
  };

  return (
    <>
      <Modal
        ref={modalRef}
        title={
          <div className="flex items-center gap-2">
            <Calendar className="size-5 text-primary" />
            <span>{session.course}</span>
          </div>
        }
        maxWidth="max-w-3xl"
        onClose={onClose}
      >
        <div className="space-y-5">
          <div className="rounded-xl border border-base-200 bg-base-200/30 p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div>
              <span className="text-base-content/70 block">Date</span>
              <span className="font-semibold text-base-content">
                {session.date}
              </span>
            </div>
            <div>
              <span className="text-base-content/70 block">Trainer</span>
              <span className="font-semibold text-base-content">
                {session.trainer}
              </span>
            </div>
            <div>
              <span className="text-base-content/70 block">Mode</span>
              <span className="font-semibold text-base-content">
                {session.mode}
              </span>
            </div>
            <div>
              <span className="text-base-content/70 block">Status</span>
              <span className="badge badge-sm badge-info font-semibold">
                {session.status}
              </span>
            </div>
          </div>

          {session.cancellationReason && (
            <div className="rounded-xl border border-error/30 bg-error/5 px-3.5 py-2.5 text-xs text-error">
              <span className="font-semibold">Cancellation reason:</span>{" "}
              {session.cancellationReason}
            </div>
          )}

          {/* Participants */}
          <div className="space-y-2.5">
            <h4 className="font-bold uppercase tracking-wider text-xs text-base-content/80 flex items-center gap-1.5">
              <Users className="size-4 text-primary" />
              <span>Participants ({participants.length})</span>
            </h4>

            {participantsQuery.isLoading ? (
              <p className="text-sm text-base-content/70">
                Loading participants...
              </p>
            ) : participants.length === 0 ? (
              <p className="text-sm text-base-content/70">
                No participants enrolled in this session yet.
              </p>
            ) : (
              <ul className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {participants.map((p) => {
                  const isCompleted = p.status.toLowerCase() === "completed";

                  return (
                    <li
                      key={p.enrollmentId || p.name}
                      className="rounded-xl border border-base-200 bg-base-100 p-3 space-y-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm text-base-content">
                              {p.name}
                            </p>
                            {p.employeeNumber && (
                              <span className="badge badge-sm badge-ghost font-mono">
                                {p.employeeNumber}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-base-content/70 capitalize">
                            {p.department ? `${p.department} • ` : ""}
                            Enrollment: {p.status.replace(/_/g, " ")} •
                            Attendance: {p.attendanceStatus.replace(/_/g, " ")}
                          </p>
                        </div>

                        {p.enrollmentId && (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                handleAttendance(p.enrollmentId, "attended")
                              }
                              disabled={markAttendanceMutation.isPending}
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
                                handleAttendance(p.enrollmentId, "absent")
                              }
                              disabled={markAttendanceMutation.isPending}
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
                                handleAttendance(p.enrollmentId, "excused")
                              }
                              disabled={markAttendanceMutation.isPending}
                              className={`btn btn-sm rounded-lg gap-1 ${
                                p.attendanceStatus === "excused"
                                  ? "btn-warning text-white"
                                  : "btn-outline btn-warning"
                              }`}
                            >
                              <MinusCircle className="size-3" />
                              <span>Excused</span>
                            </button>
                            {siblingSessions.length > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  setReassignTargetId(p.enrollmentId);
                                  setTargetSessionId(
                                    siblingSessions[0]?.id || "",
                                  );
                                }}
                                className="btn btn-sm btn-outline rounded-lg gap-1"
                                title="Move to another session"
                              >
                                <ArrowRightLeft className="size-3" />
                                <span>Move</span>
                              </button>
                            )}
                            {!isCompleted && (
                              <button
                                type="button"
                                onClick={() => handleComplete(p.enrollmentId)}
                                disabled={completeMutation.isPending}
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

                      {reassignTargetId === p.enrollmentId && (
                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-base-200">
                          <select
                            value={targetSessionId}
                            onChange={(e) => setTargetSessionId(e.target.value)}
                            className="select select-bordered select-xs flex-1 rounded-lg bg-base-200/80"
                          >
                            {siblingSessions.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.date} — {s.mode} ({s.trainer})
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            disabled={assignSessionMutation.isPending}
                            onClick={() => handleAssignSession(p.enrollmentId)}
                            className="btn btn-sm bg-primary text-white rounded-lg"
                          >
                            Assign
                          </button>
                          <button
                            type="button"
                            onClick={() => setReassignTargetId(null)}
                            className="btn btn-sm btn-ghost rounded-lg"
                          >
                            Cancel
                          </button>
                        </div>
                      )}

                      {certTargetId === p.enrollmentId && (
                        <div className="flex items-center gap-2 pt-2 border-t border-base-200">
                          <input
                            type="url"
                            value={certUrl}
                            onChange={(e) => setCertUrl(e.target.value)}
                            placeholder="https://..."
                            className="input input-bordered input-xs flex-1 rounded-lg bg-base-200/80"
                          />
                          <button
                            type="button"
                            disabled={certificateMutation.isPending}
                            onClick={() =>
                              handleIssueCertificate(p.enrollmentId)
                            }
                            className="btn btn-sm bg-primary text-white rounded-lg"
                          >
                            Issue
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
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-base-200">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-sm btn-ghost rounded-xl"
              >
                Close
              </button>
              {session.courseId && (
                <Link
                  to="/hr/training/$id"
                  params={{ id: session.courseId }}
                  onClick={onClose}
                  className="btn btn-sm btn-ghost text-primary rounded-xl gap-1"
                >
                  <span>View course page</span>
                  <ExternalLink className="size-3.5" />
                </Link>
              )}
            </div>

            <div className="flex items-center gap-2">
              {session.status === "Scheduled" && onAdvanceStatus && (
                <button
                  type="button"
                  onClick={() => {
                    onAdvanceStatus(session.id, "in_progress");
                    onClose();
                  }}
                  className="btn btn-sm bg-primary text-white hover:bg-primary/90 rounded-xl gap-1.5"
                >
                  <Play className="size-4" />
                  <span>Start session</span>
                </button>
              )}
              {session.status === "In Progress" && onAdvanceStatus && (
                <button
                  type="button"
                  onClick={() => {
                    onAdvanceStatus(session.id, "completed");
                    onClose();
                  }}
                  className="btn btn-sm bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl gap-1.5"
                >
                  <CheckCircle2 className="size-4" />
                  <span>Complete session</span>
                </button>
              )}
              {session.status === "Scheduled" && onCancelSession && (
                <button
                  type="button"
                  onClick={() => setIsCancelModalOpen(true)}
                  className="btn btn-sm btn-outline btn-error rounded-xl gap-1.5"
                >
                  <XCircle className="size-4" />
                  <span>Cancel session</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </Modal>

      <CancelSessionModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        sessionLabel={`${session.course} (${session.date})`}
        onConfirm={async (reason) => {
          if (onCancelSession) {
            await onCancelSession(session.id, reason);
            setIsCancelModalOpen(false);
            onClose();
          }
        }}
      />
    </>
  );
}
