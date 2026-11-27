import { useEffect, useRef } from "react";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import {
  useChecklistItem,
  type ChecklistItemRecord,
} from "@/api/checklistApi";
import { extract_message } from "@/helpers/errors";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Hash,
  Pencil,
  Power,
  Trash2,
  UserCheck,
} from "lucide-react";
import {
  formatChecklistDate,
  formatChecklistOwner,
  getOwnerBadgeClass,
} from "./checklistHelpers";

interface ChecklistDetailModalProps {
  item: ChecklistItemRecord | null;
  onClose: () => void;
  onEdit: (item: ChecklistItemRecord) => void;
  onToggleActive: (item: ChecklistItemRecord) => void;
  onDelete: (item: ChecklistItemRecord) => void;
  isToggling?: boolean;
}

export default function ChecklistDetailModal({
  item,
  onClose,
  onEdit,
  onToggleActive,
  onDelete,
  isToggling = false,
}: ChecklistDetailModalProps) {
  const modalRef = useRef<ModalHandle>(null);
  const isOpen = Boolean(item?.id);
  const detailQuery = useChecklistItem(item?.id);

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.open();
    } else {
      modalRef.current?.close();
    }
  }, [isOpen]);

  const activeItem = detailQuery.data ?? item;

  return (
    <Modal
      ref={modalRef}
      title={
        <div className="flex flex-wrap items-center gap-2">
          <span>Checklist Item Details</span>
          {activeItem && (
            <span
              className={`badge badge-sm rounded-lg border font-semibold ${
                activeItem.active
                  ? "bg-success/15 text-success border-success/25"
                  : "bg-base-200 text-base-content/70 border-base-300"
              }`}
            >
              {activeItem.active ? "Active" : "Inactive"}
            </span>
          )}
          {detailQuery.isFetching && (
            <span className="loading loading-spinner loading-xs text-primary" />
          )}
        </div>
      }
      maxWidth="max-w-xl"
      onClose={onClose}
    >
      {activeItem ? (
        <div className="space-y-5">
          {detailQuery.isError && (
            <div className="alert alert-warning rounded-xl text-sm py-2.5">
              <AlertCircle className="size-4 shrink-0" />
              <span>
                Showing cached details ({extract_message(detailQuery.error)}).
              </span>
            </div>
          )}

          <div className="rounded-xl border border-base-200 bg-base-200/30 p-4 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className="font-bold text-base text-base-content">
                {activeItem.title}
              </h3>
              <span
                className={`badge badge-sm rounded-lg border font-semibold ${getOwnerBadgeClass(
                  activeItem.owner,
                )}`}
              >
                {formatChecklistOwner(activeItem.owner)}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-base-200/80 text-sm">
              <div>
                <span className="text-base-content/70 flex items-center gap-1 text-xs">
                  <UserCheck className="size-3.5" />
                  Owner
                </span>
                <span className="font-semibold text-base-content">
                  {formatChecklistOwner(activeItem.owner)}
                </span>
              </div>
              <div>
                <span className="text-base-content/70 flex items-center gap-1 text-xs">
                  <Hash className="size-3.5" />
                  Sort Order
                </span>
                <span className="font-semibold text-base-content">
                  {activeItem.sortOrder}
                </span>
              </div>
              <div>
                <span className="text-base-content/70 flex items-center gap-1 text-xs">
                  <CheckCircle2 className="size-3.5" />
                  Active Flag
                </span>
                <span className="font-semibold text-base-content">
                  {activeItem.isActive} (
                  {activeItem.active ? "Active" : "Inactive"})
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-bold uppercase tracking-wider text-xs text-base-content/80 flex items-center gap-1.5">
              <FileText className="size-4 text-primary" />
              <span>Description</span>
            </h4>
            <div className="p-3.5 rounded-xl border border-base-200 bg-base-100 text-sm text-base-content/90 leading-relaxed whitespace-pre-wrap">
              {activeItem.description || "No additional description provided."}
            </div>
          </div>

          {(activeItem.createdAt || activeItem.updatedAt) && (
            <div className="grid grid-cols-2 gap-3 rounded-xl border border-base-200 bg-base-200/20 p-3.5 text-sm">
              <div>
                <span className="text-base-content/70 block text-xs">
                  Created
                </span>
                <span className="font-medium text-base-content">
                  {formatChecklistDate(activeItem.createdAt)}
                </span>
              </div>
              <div>
                <span className="text-base-content/70 block text-xs">
                  Last Updated
                </span>
                <span className="font-medium text-base-content">
                  {formatChecklistDate(activeItem.updatedAt)}
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-base-200">
            <button
              type="button"
              onClick={() => onDelete(activeItem)}
              className="btn btn-sm btn-ghost text-error hover:bg-error/10 rounded-xl gap-1.5"
            >
              <Trash2 className="size-3.5" />
              <span>Delete</span>
            </button>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={isToggling}
                onClick={() => onToggleActive(activeItem)}
                className="btn btn-sm btn-outline rounded-xl gap-1.5"
              >
                <Power className="size-3.5" />
                <span>
                  {isToggling
                    ? "Updating..."
                    : activeItem.active
                      ? "Deactivate"
                      : "Activate"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onEdit(activeItem)}
                className="btn btn-sm bg-primary text-white hover:bg-primary/90 border-0 rounded-xl px-4 gap-1.5"
              >
                <Pencil className="size-3.5" />
                <span>Edit Item</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
