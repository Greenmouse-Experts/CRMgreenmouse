import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import type { AttendanceRecord } from "./types";
import { Save } from "lucide-react";

interface EditAttendanceModalProps {
  record: AttendanceRecord | null;
  onClose: () => void;
  onSave: (payload: {
    id: string;
    clockInAt: string;
    clockOutAt: string;
  }) => Promise<void>;
}

interface EditAttendanceForm {
  date: string;
  clockInTime: string;
  clockOutTime: string;
}

const toTimeInput = (isoOrTime?: string | null, fallback = "09:00") => {
  if (!isoOrTime) return fallback;
  if (!isoOrTime.includes("T")) return isoOrTime.slice(0, 5);
  const d = new Date(isoOrTime);
  if (Number.isNaN(d.getTime())) return fallback;
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
};

export default function EditAttendanceModal({
  record,
  onClose,
  onSave,
}: EditAttendanceModalProps) {
  const modalRef = useRef<ModalHandle>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<EditAttendanceForm>({
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      clockInTime: "09:00",
      clockOutTime: "17:00",
    },
  });

  useEffect(() => {
    if (record) {
      reset({
        date:
          record.rawDate?.slice(0, 10) ||
          new Date().toISOString().slice(0, 10),
        clockInTime: toTimeInput(record.clockInAt, "09:00"),
        clockOutTime: toTimeInput(record.clockOutAt, "17:00"),
      });
      modalRef.current?.open();
    } else {
      modalRef.current?.close();
    }
  }, [record, reset]);

  const onSubmit = async (values: EditAttendanceForm) => {
    if (!record) return;
    const clockInAt = new Date(`${values.date}T${values.clockInTime}:00`).toISOString();
    const clockOutAt = new Date(`${values.date}T${values.clockOutTime}:00`).toISOString();
    await onSave({
      id: record.id,
      clockInAt,
      clockOutAt,
    });
  };

  return (
    <Modal
      ref={modalRef}
      title="Edit Attendance Record"
      maxWidth="max-w-lg"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {record && (
          <p className="text-base-content/80 -mt-1 mb-3">
            Adjust clock-in and clock-out times for{" "}
            <span className="font-semibold text-base-content">
              {record.name}
            </span>{" "}
            ({record.date}).
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="font-semibold text-base-content/80 mb-1 block">
              Date <span className="text-error">*</span>
            </label>
            <input
              type="date"
              {...register("date", { required: true })}
              className="input input-bordered w-full rounded-xl bg-base-200/80"
            />
          </div>

          <div>
            <label className="font-semibold text-base-content/80 mb-1 block">
              Clock In <span className="text-error">*</span>
            </label>
            <input
              type="time"
              {...register("clockInTime", { required: true })}
              className="input input-bordered w-full rounded-xl bg-base-200/80"
            />
          </div>

          <div>
            <label className="font-semibold text-base-content/80 mb-1 block">
              Clock Out <span className="text-error">*</span>
            </label>
            <input
              type="time"
              {...register("clockOutTime", { required: true })}
              className="input input-bordered w-full rounded-xl bg-base-200/80"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-base-200">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm btn-ghost rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-sm bg-primary text-white hover:bg-primary/90 rounded-xl px-5 gap-1.5 shadow-sm shadow-primary/20"
          >
            <Save className="size-3.5" />
            <span>{isSubmitting ? "Saving..." : "Save changes"}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
