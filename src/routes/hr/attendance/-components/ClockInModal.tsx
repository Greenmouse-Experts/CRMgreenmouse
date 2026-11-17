import { useState, useRef, useEffect } from "react";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import SimpleInput from "@/components/inputs/SimpleInput";
import LocalSelect from "@/components/inputs/LocalSelect";
import { SHIFT_OPTIONS, WORK_MODES, LOCATION_OPTIONS } from "./attendanceData";
import type { AttendanceRecord } from "./types";
import { toast } from "sonner";
import { Send } from "lucide-react";

interface ClockInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClockIn: (record: AttendanceRecord) => void;
}

export default function ClockInModal({
  isOpen,
  onClose,
  onClockIn,
}: ClockInModalProps) {
  const modalRef = useRef<ModalHandle>(null);

  const [form, setForm] = useState<{
    name: string;
    shift: string;
    date: string;
    time: string;
    mode: "On-site" | "Remote" | "Field work";
    location: string;
    note: string;
  }>({
    name: "Grace Danjuma",
    shift: SHIFT_OPTIONS[0] || "Morning 09:00–17:00",
    date: new Date().toISOString().slice(0, 10),
    time: new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    mode: "On-site",
    location: "Lagos HQ",
    note: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.open();
    } else {
      modalRef.current?.close();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("Please provide your name or employee ID");
      return;
    }

    setIsSubmitting(true);

    try {
      // Determine if Late or Present based on time
      const [h, m] = form.time.split(":").map(Number);
      const isLate = h > 9 || (h === 9 && m > 15);

      const newRecord: AttendanceRecord = {
        id: `ATT-${Date.now()}`,
        name: form.name.trim(),
        shift: form.shift.includes("09:00") ? "09:00–17:00" : form.shift,
        timeIn: form.time,
        timeOut: "—",
        status: isLate ? "Late" : "Present",
        workMode: form.mode,
        location: form.location,
        date: form.date,
      };

      onClockIn(newRecord);
      toast.success("Clocked in successfully", {
        description: `Punch registered at ${form.time} (${newRecord.status}).`,
      });

      onClose();
    } catch {
      toast.error("Failed to clock in");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      ref={modalRef}
      title="Clock In"
      maxWidth="max-w-xl"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-base-content/60 -mt-1 mb-3">
          Record the official start of your work shift, schedule, and reporting
          location.
        </p>

        <div>
          <label className="text-xs font-semibold text-base-content/80 mb-1 block">
            Employee name <span className="text-error">*</span>
          </label>
          <SimpleInput
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="e.g. Grace Danjuma"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-base-content/80 mb-1 block">
              Shift
            </label>
            <LocalSelect
              value={form.shift}
              onChange={(e) =>
                setForm((p) => ({ ...p, shift: e.target.value }))
              }
            >
              {SHIFT_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </LocalSelect>
          </div>

          <div>
            <label className="text-xs font-semibold text-base-content/80 mb-1 block">
              Work mode
            </label>
            <LocalSelect
              value={form.mode}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  mode: e.target.value as "On-site" | "Remote" | "Field work",
                }))
              }
            >
              {WORK_MODES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </LocalSelect>
          </div>

          <div>
            <label className="text-xs font-semibold text-base-content/80 mb-1 block">
              Date <span className="text-error">*</span>
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
              className="input input-bordered w-full text-xs rounded-xl bg-base-200/50"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-base-content/80 mb-1 block">
              Clock-in time <span className="text-error">*</span>
            </label>
            <input
              type="time"
              value={form.time}
              onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))}
              className="input input-bordered w-full text-xs rounded-xl bg-base-200/50"
              required
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-base-content/80 mb-1 block">
              Location
            </label>
            <LocalSelect
              value={form.location}
              onChange={(e) =>
                setForm((p) => ({ ...p, location: e.target.value }))
              }
            >
              {LOCATION_OPTIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </LocalSelect>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-base-content/80 mb-1 block">
            Note (optional)
          </label>
          <textarea
            value={form.note}
            onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
            placeholder="Reason if late or working remotely..."
            rows={2}
            className="textarea textarea-bordered w-full text-xs rounded-xl bg-base-200/50"
          />
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
            <Send className="size-3.5" />
            <span>Clock in now</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
