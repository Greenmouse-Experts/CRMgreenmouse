import { useEffect, useRef, useState } from "react";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import type { TrainingSession } from "./types";
import {
  useCompleteTrainingEnrollment,
  useIssueTrainingCertificate,
  useMarkTrainingAttendance,
  useTrainingSessionParticipants,
  type TrainingParticipantItem,
} from "@/api/trainingApi";
import { extract_message } from "@/helpers/errors";
import { toast } from "sonner";
import {
  Award,
  Calendar,
  Check,
  CheckCircle2,
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
  onCancelSession?: (sessionId: string, reason: string) => void;
}

const getParticipantName = (p: TrainingParticipantItem) => {
  if (p.employeeName) return p.employeeName;
  if (p.employee) {
    const full =
      `${p.employee.firstName ?? ""} ${p.employee.lastName ?? ""}`.trim();
    return full || p.employee.name || p.employee.email || "Staff";
  }
  return p.employeeId || "Staff";
};

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

  const participantsQuery = useTrainingSessionParticipants(
    isOpen ? session?.id : undefined,
  );
  const markAttendanceMutation = useMarkTrainingAttendance();
  const completeMutation = useCompleteTrainingEnrollment();
  const certificateMutation = useIssueTrainingCertificate();

  useEffect(() => {
    if (isOpen) {
      setCertTargetId(null);
      setCertUrl("");
      modalRef.current?.open();
    } else {
      modalRef.current?.close();
    }
  }, [isOpen]);

  if (!session) return null;

  const participants: TrainingParticipantItem[] = participantsQuery.data ?? [];

  const handleAttendance = async (
    enrollmentId: string,
    status: "attended" | "absent",
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
    <Modal
      ref={modalRef}
      title={
        <div className="flex items-center gap-2">
          <Calendar className="size-5 text-primary" />
          <span>{session.course}</span>
        </div>
      }
      maxWidth="max-w-2xl"
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

        {/* Participants */}
        <div className="space-y-2.5">
          <h4 className="font-bold uppercase tracking-wider text-base-content/80 flex items-center gap-1.5">
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
            <ul className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {participants.map((p) => {
                const enrollmentId = p.enrollmentId || p.id || "";
                const name = getParticipantName(p);
                const attStatus = p.attendanceStatus || p.status || "enrolled";

                return (
                  <li
                    key={enrollmentId || name}
                    className="rounded-xl border border-base-200 bg-base-100 p-3 space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold text-base-content">
                          {name}
                        </p>
                        <p className="text-sm text-base-content/70 capitalize">
                          Status: {attStatus.replace(/_/g, " ")}
                        </p>
                      </div>

                      {enrollmentId && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              handleAttendance(enrollmentId, "attended")
                            }
                            disabled={markAttendanceMutation.isPending}
                            className="btn btn-xs btn-outline btn-success rounded-lg gap-1"
                          >
                            <Check className="size-3" />
                            <span>Attended</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleAttendance(enrollmentId, "absent")
                            }
                            disabled={markAttendanceMutation.isPending}
                            className="btn btn-xs btn-outline btn-error rounded-lg gap-1"
                          >
                            <X className="size-3" />
                            <span>Absent</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleComplete(enrollmentId)}
                            disabled={completeMutation.isPending}
                            className="btn btn-xs btn-outline rounded-lg gap-1"
                          >
                            <CheckCircle2 className="size-3" />
                            <span>Complete</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCertTargetId(enrollmentId);
                              setCertUrl(p.certificateUrl || "");
                            }}
                            className="btn btn-xs btn-ghost text-primary rounded-lg gap-1"
                          >
                            <Award className="size-3" />
                            <span>Certificate</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {certTargetId === enrollmentId && (
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
                          onClick={() => handleIssueCertificate(enrollmentId)}
                          className="btn btn-xs bg-primary text-white rounded-lg"
                        >
                          Issue
                        </button>
                        <button
                          type="button"
                          onClick={() => setCertTargetId(null)}
                          className="btn btn-xs btn-ghost rounded-lg"
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
          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm btn-ghost rounded-xl"
          >
            Close
          </button>

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
                onClick={() => {
                  const reason = window.prompt(
                    "Reason for cancelling session:",
                    "Rescheduling",
                  );
                  if (reason && reason.trim()) {
                    onCancelSession(session.id, reason.trim());
                    onClose();
                  }
                }}
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
  );
}
