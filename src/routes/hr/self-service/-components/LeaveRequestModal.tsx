import { useEffect, useRef } from "react";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import { getLeaveStatusBadge } from "./StatusBadges";
import { formatDate } from "./selfServiceData";
import type { LeaveRequest } from "./types";

interface LeaveRequestModalProps {
  request: LeaveRequest | null;
  onClose: () => void;
  onCancel: (request: LeaveRequest) => void;
}

export default function LeaveRequestModal({
  request,
  onClose,
  onCancel,
}: LeaveRequestModalProps) {
  const modalRef = useRef<ModalHandle>(null);

  useEffect(() => {
    if (request) {
      modalRef.current?.open();
    } else {
      modalRef.current?.close();
    }
  }, [request]);

  if (!request) {
    return <Modal ref={modalRef} title="Leave Request" onClose={onClose} />;
  }

  return (
    <Modal
      ref={modalRef}
      title={`Leave Request · ${request.id}`}
      maxWidth="max-w-lg"
      onClose={onClose}
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-base-200 bg-base-200/80 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="font-mono text-sm font-semibold text-base-content">
              {request.id}
            </div>
            {getLeaveStatusBadge(request.status)}
          </div>
          <div className="mt-1  text-base-content/80">
            {request.type} · {request.days}{" "}
            {request.days === 1 ? "day" : "days"}
          </div>
        </div>

        <div className="space-y-1.5 text-sm">
          <div className="flex items-center justify-between py-1">
            <span className="text-base-content/80">Start</span>
            <span className="text-base-content">
              {formatDate(request.startDate)}
            </span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-base-content/80">End</span>
            <span className="text-base-content">
              {formatDate(request.endDate)}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-base-200 py-1.5">
            <span className="font-semibold text-base-content">Reason</span>
            <span className="text-right text-base-content/80">
              {request.reason}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-4 border-t border-base-200">
        <button
          type="button"
          onClick={onClose}
          className="btn btn-sm btn-ghost rounded-xl"
        >
          Close
        </button>
        {request.status === "Pending" && (
          <button
            type="button"
            onClick={() => onCancel(request)}
            className="btn btn-sm btn-error rounded-xl px-5"
          >
            Cancel Request
          </button>
        )}
      </div>
    </Modal>
  );
}
