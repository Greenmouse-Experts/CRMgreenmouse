import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import SimpleTextArea from "@/components/inputs/SimpleTextArea";
import type { ProbationReview } from "@/api/onboardingApi";
import { CheckCircle2 } from "lucide-react";

interface CompleteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: ProbationReview | null;
  onComplete: (reviewId: string, notes: string) => Promise<void>;
}

interface ReviewForm {
  notes: string;
}

export default function CompleteReviewModal({
  isOpen,
  onClose,
  review,
  onComplete,
}: CompleteReviewModalProps) {
  const modalRef = useRef<ModalHandle>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<ReviewForm>({ defaultValues: { notes: "" } });

  useEffect(() => {
    if (isOpen) {
      reset({ notes: "" });
      modalRef.current?.open();
    } else {
      modalRef.current?.close();
    }
  }, [isOpen, reset]);

  const onSubmit = async (values: ReviewForm) => {
    if (!review) return;
    await onComplete(review.id, values.notes.trim());
  };

  const reviewTitle =
    review?.title ?? review?.milestone ?? review?.stage ?? "Probation review";

  return (
    <Modal
      ref={modalRef}
      title="Complete Review"
      maxWidth="max-w-xl"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <p className="text-base-content/80 -mt-1 mb-3">
          Record the outcome of{" "}
          <span className="font-semibold text-base-content">{reviewTitle}</span>{" "}
          and mark it complete.
        </p>

        <SimpleTextArea
          label="Review Notes"
          placeholder="Summary of the check-in, objectives met, concerns..."
          rows={4}
          {...register("notes")}
        />

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-base-200">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm btn-ghost rounded-xl"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-sm bg-emerald-600 text-white hover:bg-emerald-700 border-0 rounded-xl px-5 gap-1.5 shadow-sm"
          >
            <CheckCircle2 className="size-3.5" />
            <span>{isSubmitting ? "Completing..." : "Mark Complete"}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
