import { useState, useRef, useEffect } from "react";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import SimpleInput from "@/components/inputs/SimpleInput";
import LocalSelect from "@/components/inputs/LocalSelect";
import {
  EMPLOYEES_SELECTION,
  GOAL_CATEGORIES,
  REVIEW_CYCLES,
} from "./performanceData";
import type { TeamGoal } from "./types";
import { toast } from "sonner";
import { Send } from "lucide-react";

interface AssignGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssignGoal: (goal: TeamGoal) => void;
}

export default function AssignGoalModal({
  isOpen,
  onClose,
  onAssignGoal,
}: AssignGoalModalProps) {
  const modalRef = useRef<ModalHandle>(null);

  const [form, setForm] = useState({
    emp: EMPLOYEES_SELECTION[0] || "Whole team",
    cycle: "Q4 2026",
    title: "",
    category: "Business" as const,
    kpi: "",
    target: "",
    weight: 25,
    start: new Date().toISOString().slice(0, 10),
    due: "2026-12-15",
    desc: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.open();
    } else {
      modalRef.current?.close();
    }
  }, [isOpen]);

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim() || !form.target.trim()) {
      toast.error("Please provide a goal title and target value");
      return;
    }

    setIsSubmitting(true);

    try {
      const newGoal: TeamGoal = {
        id: `GOAL-${Date.now()}`,
        title: form.title.trim(),
        progress: 0,
        assignedTo: form.emp,
        cycle: form.cycle,
        category: form.category,
        kpi: form.kpi.trim() || undefined,
        target: form.target.trim(),
        weight: Number(form.weight) || 20,
        due: form.due,
      };

      onAssignGoal(newGoal);
      toast.success("Goal assigned", {
        description: `${newGoal.title} has been assigned to ${newGoal.assignedTo}.`,
      });

      // Reset
      setForm({
        emp: EMPLOYEES_SELECTION[0] || "Whole team",
        cycle: "Q4 2026",
        title: "",
        category: "Business",
        kpi: "",
        target: "",
        weight: 25,
        start: new Date().toISOString().slice(0, 10),
        due: "2026-12-15",
        desc: "",
      });
      onClose();
    } catch {
      toast.error("Failed to assign goal");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      ref={modalRef}
      title="Assign Goal"
      maxWidth="max-w-2xl"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className=" text-base-content/80 -mt-1 mb-3">
          Goals should be specific, measurable, achievable, relevant and
          time-bound.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className=" font-semibold text-base-content/80 mb-1 block">
              Assign to <span className="text-error">*</span>
            </label>
            <LocalSelect
              value={form.emp}
              onChange={(e) => handleChange("emp", e.target.value)}
            >
              {EMPLOYEES_SELECTION.map((emp) => (
                <option key={emp} value={emp}>
                  {emp}
                </option>
              ))}
            </LocalSelect>
          </div>

          <div>
            <label className=" font-semibold text-base-content/80 mb-1 block">
              Review cycle <span className="text-error">*</span>
            </label>
            <LocalSelect
              value={form.cycle}
              onChange={(e) => handleChange("cycle", e.target.value)}
            >
              {REVIEW_CYCLES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </LocalSelect>
          </div>

          <div className="sm:col-span-2">
            <label className=" font-semibold text-base-content/80 mb-1 block">
              Goal title <span className="text-error">*</span>
            </label>
            <SimpleInput
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="e.g. Grow Q4 revenue to ₦180m"
              required
            />
          </div>

          <div>
            <label className=" font-semibold text-base-content/80 mb-1 block">
              Category <span className="text-error">*</span>
            </label>
            <LocalSelect
              value={form.category}
              onChange={(e) => handleChange("category", e.target.value)}
            >
              {GOAL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </LocalSelect>
          </div>

          <div>
            <label className=" font-semibold text-base-content/80 mb-1 block">
              Measure (KPI)
            </label>
            <SimpleInput
              value={form.kpi}
              onChange={(e) => handleChange("kpi", e.target.value)}
              placeholder="e.g. Revenue closed or CSAT"
            />
          </div>

          <div>
            <label className=" font-semibold text-base-content/80 mb-1 block">
              Target value <span className="text-error">*</span>
            </label>
            <SimpleInput
              value={form.target}
              onChange={(e) => handleChange("target", e.target.value)}
              placeholder="e.g. 180,000,000 or 95%"
              required
            />
          </div>

          <div>
            <label className=" font-semibold text-base-content/80 mb-1 block">
              Weight (%) <span className="text-error">*</span>
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={form.weight}
              onChange={(e) => handleChange("weight", e.target.value)}
              className="input input-bordered w-full  rounded-xl bg-base-200/80"
              required
            />
            <span className="text-[10px] text-base-content/80 mt-1 block">
              All goals for one person should total 100%
            </span>
          </div>

          <div>
            <label className=" font-semibold text-base-content/80 mb-1 block">
              Start date
            </label>
            <input
              type="date"
              value={form.start}
              onChange={(e) => handleChange("start", e.target.value)}
              className="input input-bordered w-full  rounded-xl bg-base-200/80"
            />
          </div>

          <div>
            <label className=" font-semibold text-base-content/80 mb-1 block">
              Due date <span className="text-error">*</span>
            </label>
            <input
              type="date"
              value={form.due}
              onChange={(e) => handleChange("due", e.target.value)}
              className="input input-bordered w-full  rounded-xl bg-base-200/80"
              required
            />
          </div>

          <div className="sm:col-span-2">
            <label className=" font-semibold text-base-content/80 mb-1 block">
              Description & success criteria
            </label>
            <textarea
              value={form.desc}
              onChange={(e) => handleChange("desc", e.target.value)}
              placeholder="Detail expected milestones, quality standards, and dependencies..."
              rows={3}
              className="textarea textarea-bordered w-full  rounded-xl bg-base-200/80"
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
            <Send className="size-3.5" />
            <span>Assign goal</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
