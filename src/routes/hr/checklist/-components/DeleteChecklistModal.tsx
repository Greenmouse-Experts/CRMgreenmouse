import { useEffect, useRef } from "react";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import {
  useDeleteChecklistItem,
  type ChecklistItemRecord,
} from "@/api/checklistApi";
import { extract_message } from "@/helpers/errors";
import { AlertTriangle, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface DeleteChecklistModalProps {
  item: ChecklistItemRecord | null;
  onClose: () => void;
  onDeleted?: (deletedId: string) => void;
}

export default function DeleteChecklistModal({
  item,
  onClose,
  onDeleted,
}: DeleteChecklistModalProps) {
  const modalRef = useRef<ModalHandle>(null);
  const deleteMutation = useDeleteChecklistItem();
  const isOpen = Boolean(item?.id);

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.open();
    } else {
      modalRef.current?.close();
    }
  }, [isOpen]);

  const handleConfirmDelete = async () => {
    if (!item?.id || deleteMutation.isPending) return;

    try {
      await toast
        .promise(deleteMutation.mutateAsync(item.id), {
          loading: "Deleting checklist item...",
          success: "Checklist item deleted",
          error: (error) => extract_message(error),
        })
        .unwrap();
      onDeleted?.(item.id);
      onClose();
    } catch {
      // Error toast shown by toast.promise
    }
  };

  return (
    <Modal
      ref={modalRef}
      title="Delete Checklist Item"
      maxWidth="max-w-md"
      onClose={onClose}
    >
      {item ? (
        <div className="space-y-5">
          <div className="flex items-start gap-3 rounded-xl border border-error/25 bg-error/10 p-4 text-sm">
            <AlertTriangle className="size-5 text-error shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-base-content">
                Are you sure you want to delete this checklist item?
              </p>
              <p className="text-base-content/75">
                <strong className="text-base-content">{item.title}</strong> will
                be permanently removed from the onboarding checklist.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-base-200">
            <button
              type="button"
              onClick={onClose}
              disabled={deleteMutation.isPending}
              className="btn btn-sm btn-ghost rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
              className="btn btn-sm btn-error text-white rounded-xl px-4 gap-1.5"
            >
              <Trash2 className="size-3.5" />
              <span>
                {deleteMutation.isPending ? "Deleting..." : "Delete Item"}
              </span>
            </button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
