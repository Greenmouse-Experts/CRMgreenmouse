import { useEffect, useRef, useState } from "react";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import {
  useCalibrationHistory,
  useSelfAssessAppraisal,
  useSignOffAppraisal,
} from "@/api/performanceApi";
import type { PersonalAppraisalItem } from "./PersonalAppraisalsSection";
import { extract_message } from "@/helpers/errors";
import { toast } from "sonner";
import { Award, CheckCircle2, ClipboardCheck, History, Send } from "lucide-react";

interface AppraisalDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  appraisal: PersonalAppraisalItem | null;
}

export default function AppraisalDetailModal({
  isOpen,
  onClose,
  appraisal,
}: AppraisalDetailModalProps) {
  const modalRef = useRef<ModalHandle>(null);
  const selfAssessMutation = useSelfAssessAppraisal();
  const signOffMutation = useSignOffAppraisal();
  const calibrationQuery = useCalibrationHistory(
    isOpen ? appraisal?.id : undefined,
  );

  const [selfRating, setSelfRating] = useState("4");
  const [selfNotes, setSelfNotes] = useState("");
  const [signOffFeedback, setSignOffFeedback] = useState("");

  useEffect(() => {
    if (isOpen && appraisal) {
      setSelfRating(appraisal.selfScore ? String(appraisal.selfScore) : "4");
      setSelfNotes(appraisal.selfAssessment ?? "");
      setSignOffFeedback("");
      modalRef.current?.open();
    } else {
      modalRef.current?.close();
    }
  }, [isOpen, appraisal]);

  if (!appraisal) return null;

  const canSelfAssess =
    appraisal.status !== "Completed" && !appraisal.selfScore;
  const canSignOff =
    appraisal.status !== "Completed" &&
    Boolean(appraisal.managerScore || appraisal.rating !== "—");
  const calibrationHistory = calibrationQuery.data ?? [];

  const handleSubmitSelfAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericRating = Number(selfRating);
    if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
      toast.error("Self rating must be between 1 and 5");
      return;
    }
    try {
      await selfAssessMutation.mutateAsync({
        appraisalId: appraisal.id,
        rating: numericRating,
        assessment: selfNotes.trim() || undefined,
      });
      toast.success("Self-assessment submitted");
      onClose();
    } catch (err) {
      toast.error(extract_message(err));
    }
  };

  const handleSignOff = async () => {
    try {
      await signOffMutation.mutateAsync({
        appraisalId: appraisal.id,
        feedback: signOffFeedback.trim() || undefined,
      });
      toast.success("Performance review signed off");
      onClose();
    } catch (err) {
      toast.error(extract_message(err));
    }
  };

  return (
    <Modal
      ref={modalRef}
      title={`${appraisal.cycle || "Performance"} Appraisal Review`}
      maxWidth="max-w-2xl"
      onClose={onClose}
    >
      <div className="space-y-5">
        {/* Top Summary */}
        <div className="rounded-xl border border-base-200 bg-base-200/30 p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div>
            <span className="text-xs text-base-content/70 block">Reviewer</span>
            <span className="font-semibold text-base-content">
              {appraisal.reviewer}
            </span>
          </div>
          <div>
            <span className="text-xs text-base-content/70 block">Self Score</span>
            <span className="font-semibold text-base-content">
              {appraisal.selfScore ? `${appraisal.selfScore} / 5.0` : "—"}
            </span>
          </div>
          <div>
            <span className="text-xs text-base-content/70 block">
              Manager Score
            </span>
            <span className="font-semibold text-base-content">
              {appraisal.managerScore ? `${appraisal.managerScore} / 5.0` : "—"}
            </span>
          </div>
          <div>
            <span className="text-xs text-base-content/70 block">
              Final Rating
            </span>
            <span className="font-bold text-primary inline-flex items-center gap-1">
              <Award className="size-3.5" />
              {appraisal.rating !== "—" ? `${appraisal.rating} / 5.0` : "Pending"}
            </span>
          </div>
        </div>

        {/* Manager Comments */}
        <div className="space-y-1.5">
          <h4 className="font-bold uppercase tracking-wider text-xs text-base-content/75 flex items-center gap-1.5">
            <ClipboardCheck className="size-4 text-primary" />
            <span>Manager Evaluation & Comments</span>
          </h4>
          <div className="p-3.5 rounded-xl border border-base-200 bg-base-100 text-sm text-base-content/85">
            {appraisal.managerComments ||
              "No manager evaluation comments recorded yet."}
          </div>
        </div>

        {/* Self Assessment Display or Form */}
        {canSelfAssess ? (
          <form
            onSubmit={handleSubmitSelfAssessment}
            className="space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-4"
          >
            <h4 className="font-bold text-sm text-base-content">
              Submit Self-Assessment
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-base-content/80 block mb-1">
                  Self Rating (1–5)
                </label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  step="0.1"
                  value={selfRating}
                  onChange={(e) => setSelfRating(e.target.value)}
                  className="input input-sm input-bordered w-full rounded-xl bg-base-100"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-base-content/80 block mb-1">
                  Self-Assessment Summary
                </label>
                <textarea
                  rows={2}
                  value={selfNotes}
                  onChange={(e) => setSelfNotes(e.target.value)}
                  placeholder="Summarize your key achievements and reflections..."
                  className="textarea textarea-bordered w-full rounded-xl bg-base-100 text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={selfAssessMutation.isPending}
                className="btn btn-sm bg-primary text-white hover:bg-primary/90 border-0 rounded-xl gap-1.5"
              >
                <Send className="size-3.5" />
                <span>
                  {selfAssessMutation.isPending
                    ? "Submitting..."
                    : "Submit Self-Assessment"}
                </span>
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-1.5">
            <h4 className="font-bold uppercase tracking-wider text-xs text-base-content/75">
              My Self-Assessment Notes
            </h4>
            <div className="p-3.5 rounded-xl border border-base-200 bg-base-200/30 text-sm text-base-content/85">
              {appraisal.selfAssessment || "No self-assessment text recorded."}
            </div>
          </div>
        )}

        {/* Calibration History */}
        {calibrationHistory.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-bold uppercase tracking-wider text-xs text-base-content/75 flex items-center gap-1.5">
              <History className="size-4 text-primary" />
              <span>Calibration History</span>
            </h4>
            <ul className="space-y-1.5 max-h-32 overflow-y-auto">
              {calibrationHistory.map((item: any, idx: number) => (
                <li
                  key={item.id ?? idx}
                  className="rounded-lg border border-base-200 bg-base-200/30 px-3 py-2 text-xs flex items-center justify-between gap-2"
                >
                  <span>
                    Adjusted to <strong>{item.rating ?? item.newRating}</strong>
                    {item.reason ? ` — ${item.reason}` : ""}
                  </span>
                  <span className="text-base-content/60">
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString()
                      : ""}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Sign-off Action */}
        {canSignOff && (
          <div className="space-y-2 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
            <h4 className="font-bold text-sm text-base-content">
              Acknowledge & Sign Off Review
            </h4>
            <textarea
              rows={2}
              value={signOffFeedback}
              onChange={(e) => setSignOffFeedback(e.target.value)}
              placeholder="Optional feedback or acknowledgement notes..."
              className="textarea textarea-bordered w-full rounded-xl bg-base-100 text-sm"
            />
            <div className="flex justify-end">
              <button
                type="button"
                disabled={signOffMutation.isPending}
                onClick={handleSignOff}
                className="btn btn-sm bg-emerald-600 text-white hover:bg-emerald-700 border-0 rounded-xl gap-1.5"
              >
                <CheckCircle2 className="size-3.5" />
                <span>
                  {signOffMutation.isPending ? "Signing off..." : "Sign off"}
                </span>
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-base-200">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm btn-ghost rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
