import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import SimpleInput from "@/components/inputs/SimpleInput";
import SimpleTextArea from "@/components/inputs/SimpleTextArea";
import { CalendarClock } from "lucide-react";

interface ExtendProbationModalProps {
  isOpen: boolean;
  onClose: () => void;
  hireName: string;
  onExtend: (values: {
    newEndDate: string;
    reason?: string;
  }) => Promise<void>;
}

interface ExtendForm {
  newEndDate: string;
  reason: string;
}

export default function ExtendProbationModal({
  isOpen,
  onClose,
  hireName,
  onExtend,
}: ExtendProbationModalProps) {
  const modalRef = useRef<ModalHandle>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<ExtendForm>({ defaultValues: { newEndDate: "", reason: "" } });

  useEffect(() => {
    if (isOpen) {
      reset({ newEndDate: "", reason: "" });
      modalRef.current?.open();
    } else {
      modalRef.current?.close();
    }
  }, [isOpen, reset]);

  const onSubmit = async (values: ExtendForm) => {
    await onExtend({
      newEndDate: values.newEndDate,
      reason: values.reason.trim() || undefined,
    });
  };

  return (
    <Modal
      ref={modalRef}
      title="Extend Probation"
      maxWidth="max-w-xl"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <p className="text-base-content/80 -mt-1 mb-3">
          Extend the probation period for{" "}
          <span className="font-semibold text-base-content">{hireName}</span>.
          The new end date is sent to the backend with the decision.
        </p>

        <SimpleInput
          label="New Probation End Date *"
          type="date"
          {...register("newEndDate", {
            required: "A new end date is required",
          })}
        />

        <SimpleTextArea
          label="Reason"
          placeholder="e.g. Additional time needed to meet role objectives..."
          rows={3}
          {...register("reason")}
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
            className="btn btn-sm bg-warning text-white hover:bg-warning/90 border-0 rounded-xl px-5 gap-1.5 shadow-sm"
          >
            <CalendarClock className="size-3.5" />
            <span>{isSubmitting ? "Extending..." : "Extend Probation"}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
