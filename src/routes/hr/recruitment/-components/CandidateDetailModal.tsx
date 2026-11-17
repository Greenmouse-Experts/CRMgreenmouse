import { useState, useRef, useEffect } from "react";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import { PIPELINE_STAGES } from "./recruitmentData";
import type { Candidate, PipelineStage } from "./types";
import { toast } from "sonner";
import { Mail, Phone, Calendar, Award, Send } from "lucide-react";

interface CandidateDetailModalProps {
  candidate: Candidate | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStage: (candidateId: string, newStage: PipelineStage) => void;
}

export default function CandidateDetailModal({
  candidate,
  isOpen,
  onClose,
  onUpdateStage,
}: CandidateDetailModalProps) {
  const modalRef = useRef<ModalHandle>(null);
  const [selectedStage, setSelectedStage] = useState<PipelineStage>(
    candidate?.stage || "Screening",
  );

  useEffect(() => {
    if (candidate) {
      setSelectedStage(candidate.stage);
    }
  }, [candidate]);

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.open();
    } else {
      modalRef.current?.close();
    }
  }, [isOpen]);

  if (!candidate) return null;

  const handleStageChange = (newStage: PipelineStage) => {
    setSelectedStage(newStage);
    onUpdateStage(candidate.id, newStage);
    toast.success(`Candidate moved to ${newStage}`);
  };

  return (
    <Modal
      ref={modalRef}
      title="Candidate Profile"
      maxWidth="max-w-xl"
      onClose={onClose}
    >
      <div className="space-y-5 text-xs">
        {/* Candidate Profile summary */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-base-200/50 border border-base-200">
          <div className="size-14 rounded-full bg-primary/20 text-primary font-bold text-lg flex items-center justify-center shrink-0">
            {candidate.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold text-base-content truncate">
              {candidate.name}
            </h3>
            <p className="text-xs text-base-content/70 mt-0.5">
              {candidate.role}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="badge badge-sm badge-primary font-semibold">
                {candidate.stage}
              </span>
              <span className="badge badge-sm badge-ghost font-mono">
                Score: {candidate.score}/100
              </span>
            </div>
          </div>
        </div>

        {/* Contact & Meta */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-base-200/30 p-3.5 rounded-xl border border-base-200">
          <div className="flex items-center gap-2 text-base-content/80">
            <Mail className="size-4 text-base-content/50" />
            <span className="truncate">{candidate.email || "No email"}</span>
          </div>
          <div className="flex items-center gap-2 text-base-content/80">
            <Phone className="size-4 text-base-content/50" />
            <span>{candidate.phone || "No phone"}</span>
          </div>
          <div className="flex items-center gap-2 text-base-content/80">
            <Calendar className="size-4 text-base-content/50" />
            <span>Applied: {candidate.appliedDate || "Recent"}</span>
          </div>
          <div className="flex items-center gap-2 text-base-content/80">
            <Award className="size-4 text-base-content/50" />
            <span>{candidate.experience || "Experience provided"}</span>
          </div>
        </div>

        {/* Pipeline Stage Movement */}
        <div>
          <label className="text-xs font-bold text-base-content block mb-2">
            Update Pipeline Stage
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PIPELINE_STAGES.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => handleStageChange(st)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold text-center transition-all ${
                  selectedStage === st
                    ? "bg-primary text-white shadow-xs"
                    : "bg-base-200 text-base-content/70 hover:bg-base-300"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-base-200">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm btn-ghost rounded-xl"
          >
            Close
          </button>

          <button
            type="button"
            onClick={() => {
              toast.success(`Evaluation email sent to ${candidate.name}`);
              onClose();
            }}
            className="btn btn-sm bg-primary text-white hover:bg-primary/90 rounded-xl px-4 gap-1.5 shadow-sm shadow-primary/20"
          >
            <Send className="size-3.5" />
            <span>Send Email</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
