import { useState, useRef, useEffect } from "react";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import SimpleInput from "@/components/inputs/SimpleInput";
import LocalSelect from "@/components/inputs/LocalSelect";
import RichTextEditor, {
  sanitizeRichText,
} from "@/components/inputs/RichTextEditor";
import TargetAudiencePicker from "./TargetAudiencePicker";
import { COURSE_CATEGORIES, DELIVERY_MODES } from "./trainingData";
import type { CourseCategory, DeliveryMode } from "./types";
import { toBackendCategory, toBackendDeliveryMode } from "./mappers";
import type {
  BackendTargetType,
  CreateTrainingCoursePayload,
  CreateTrainingSessionPayload,
} from "@/api/trainingApi";
import { toast } from "sonner";
import { BookOpen, Calendar, Plus } from "lucide-react";

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitCourse: (
    coursePayload: CreateTrainingCoursePayload,
    sessionPayload?: Omit<CreateTrainingSessionPayload, "courseId">,
  ) => Promise<void>;
}

const initialForm = {
  title: "",
  category: "Compliance" as CourseCategory,
  mode: "Virtual" as DeliveryMode,
  trainer: "",
  duration: 4,
  capacity: 25,
  cost: "",
  mandatory: false,
  desc: "",
  start: new Date().toISOString().slice(0, 10),
  end: "",
  targetType: "all" as BackendTargetType,
  targetIds: [] as string[],
  cert: true,
  location: "Main Training Hall, Lagos HQ",
  meetingUrl: "",
};

export default function CreateCourseModal({
  isOpen,
  onClose,
  onSubmitCourse,
}: CreateCourseModalProps) {
  const modalRef = useRef<ModalHandle>(null);

  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.open();
    } else {
      modalRef.current?.close();
    }
  }, [isOpen]);

  const handleChange = <K extends keyof typeof initialForm>(
    field: K,
    value: (typeof initialForm)[K],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim()) {
      toast.error("Please provide a course title");
      return;
    }

    if (!form.trainer.trim()) {
      toast.error("Please specify a trainer or training provider");
      return;
    }

    if (form.targetType !== "all" && form.targetIds.length === 0) {
      toast.error("Please select at least one target recipient");
      return;
    }

    setIsSubmitting(true);

    try {
      const sanitizedCost = form.cost
        ? String(form.cost).replace(/[^0-9.]/g, "")
        : "0";
      const normalizedCost = /^(0|[1-9]\d*)(\.\d{1,6})?$/.test(sanitizedCost)
        ? sanitizedCost
        : String(Number(sanitizedCost) || 0);

      const sanitizedObjectives = sanitizeRichText(form.desc);

      const coursePayload: CreateTrainingCoursePayload = {
        title: form.title.trim(),
        category: toBackendCategory(form.category),
        defaultDeliveryMode: toBackendDeliveryMode(form.mode),
        learningObjectives:
          sanitizedObjectives ||
          `Core syllabus and learning objectives for ${form.title.trim()}`,
        mandatory: Boolean(form.mandatory),
        certificateOnCompletion: Boolean(form.cert),
        targetType: form.targetType,
        targetIds: form.targetType === "all" ? [] : form.targetIds,
        costPerPerson: normalizedCost,
      };

      let sessionPayload:
        | Omit<CreateTrainingSessionPayload, "courseId">
        | undefined;
      if (form.start) {
        const startsAt = new Date(`${form.start}T09:00:00.000Z`).toISOString();
        const endsAt = form.end
          ? new Date(`${form.end}T17:00:00.000Z`).toISOString()
          : new Date(
              new Date(startsAt).getTime() +
                (Number(form.duration) || 3) * 3600 * 1000,
            ).toISOString();

        sessionPayload = {
          startsAt,
          endsAt,
          deliveryMode: toBackendDeliveryMode(form.mode),
          location:
            form.mode === "Virtual"
              ? undefined
              : form.location || "Main Training Hall, Lagos HQ",
          meetingUrl:
            form.mode === "Virtual"
              ? form.meetingUrl || "https://meet.google.com"
              : undefined,
          capacity: Number(form.capacity) || 25,
          trainerType: "external",
          externalProvider: form.trainer.trim() || "External Trainer",
        };
      }

      await onSubmitCourse(coursePayload, sessionPayload);

      setForm({
        ...initialForm,
        start: new Date().toISOString().slice(0, 10),
      });

      onClose();
    } catch {
      // Errors handled by mutation / toast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      ref={modalRef}
      title="Create Course"
      maxWidth="max-w-2xl"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <p className="text-xs text-base-content/80 -mt-1">
          Add a new training course, specify delivery mode, trainer details, and
          scheduling.
        </p>

        {/* Section 1: Course Information */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 pb-1 border-b border-base-200">
            <BookOpen className="size-3.5 text-primary" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-base-content/80">
              Course Details
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div className="sm:col-span-2">
              <label className="font-semibold text-base-content/80 mb-1 block">
                Course title <span className="text-error">*</span>
              </label>
              <SimpleInput
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="e.g. Information Security & Phishing Awareness"
                required
              />
            </div>

            <div>
              <label className="font-semibold text-base-content/80 mb-1 block">
                Category <span className="text-error">*</span>
              </label>
              <LocalSelect
                value={form.category}
                onChange={(e) =>
                  handleChange("category", e.target.value as CourseCategory)
                }
              >
                {COURSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </LocalSelect>
            </div>

            <div>
              <label className="font-semibold text-base-content/80 mb-1 block">
                Delivery mode <span className="text-error">*</span>
              </label>
              <LocalSelect
                value={form.mode}
                onChange={(e) =>
                  handleChange("mode", e.target.value as DeliveryMode)
                }
              >
                {DELIVERY_MODES.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))}
              </LocalSelect>
            </div>

            <div>
              <label className="font-semibold text-base-content/80 mb-1 block">
                Trainer / Provider <span className="text-error">*</span>
              </label>
              <SimpleInput
                value={form.trainer}
                onChange={(e) => handleChange("trainer", e.target.value)}
                placeholder="e.g. KPMG Nigeria or Internal Lead"
                required
              />
            </div>

            <div>
              <label className="font-semibold text-base-content/80 mb-1 block">
                Duration (hours)
              </label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={form.duration}
                onChange={(e) =>
                  handleChange("duration", Number(e.target.value) || 1)
                }
                className="input input-sm input-bordered w-full rounded-xl bg-base-200/80 text-xs"
                placeholder="e.g. 4"
              />
            </div>

            <div>
              <label className="font-semibold text-base-content/80 mb-1 block">
                Max Capacity
              </label>
              <input
                type="number"
                min="1"
                value={form.capacity}
                onChange={(e) =>
                  handleChange("capacity", Number(e.target.value) || 1)
                }
                className="input input-sm input-bordered w-full rounded-xl bg-base-200/80 text-xs"
                placeholder="e.g. 30"
              />
            </div>

            <div>
              <label className="font-semibold text-base-content/80 mb-1 block">
                Cost per participant (₦)
              </label>
              <SimpleInput
                value={form.cost}
                onChange={(e) => handleChange("cost", e.target.value)}
                placeholder="e.g. 25000 (Free if 0)"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-base-content/80 mb-1 block">
                Learning objectives & description
              </label>
              <RichTextEditor
                value={form.desc}
                onChange={(val) => handleChange("desc", val)}
                placeholder="Key outcomes, syllabus outline, or prerequisites..."
                compact
              />
            </div>
          </div>
        </div>

        {/* Section 2: Scheduling & Target Audience */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 pb-1 border-b border-base-200">
            <Calendar className="size-3.5 text-primary" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-base-content/80">
              Schedule & Enrollment
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div>
              <label className="font-semibold text-base-content/80 mb-1 block">
                Start date <span className="text-error">*</span>
              </label>
              <input
                type="date"
                value={form.start}
                onChange={(e) => handleChange("start", e.target.value)}
                className="input input-sm input-bordered w-full rounded-xl bg-base-200/80 text-xs"
                required
              />
            </div>

            <div>
              <label className="font-semibold text-base-content/80 mb-1 block">
                End date (optional)
              </label>
              <input
                type="date"
                value={form.end}
                onChange={(e) => handleChange("end", e.target.value)}
                className="input input-sm input-bordered w-full rounded-xl bg-base-200/80 text-xs"
              />
            </div>

            {form.mode === "Virtual" ? (
              <div className="sm:col-span-2">
                <label className="font-semibold text-base-content/80 mb-1 block">
                  Virtual Meeting URL
                </label>
                <SimpleInput
                  value={form.meetingUrl}
                  onChange={(e) => handleChange("meetingUrl", e.target.value)}
                  placeholder="https://meet.google.com/..."
                />
              </div>
            ) : (
              <div className="sm:col-span-2">
                <label className="font-semibold text-base-content/80 mb-1 block">
                  Physical Venue / Room
                </label>
                <SimpleInput
                  value={form.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  placeholder="Main Training Hall, Lagos HQ"
                />
              </div>
            )}

            <div className="sm:col-span-2">
              <TargetAudiencePicker
                targetType={form.targetType}
                targetIds={form.targetIds}
                onChangeTargetType={(nextType) =>
                  handleChange("targetType", nextType)
                }
                onChangeTargetIds={(nextIds) =>
                  handleChange("targetIds", nextIds)
                }
              />
            </div>

            <div className="sm:col-span-2 flex items-center gap-6 pt-1">
              <label className="label cursor-pointer justify-start gap-2 p-0">
                <input
                  type="checkbox"
                  checked={form.mandatory}
                  onChange={(e) => handleChange("mandatory", e.target.checked)}
                  className="checkbox checkbox-sm checkbox-primary rounded"
                />
                <span className="font-medium text-base-content text-xs">
                  Mandatory for staff
                </span>
              </label>

              <label className="label cursor-pointer justify-start gap-2 p-0">
                <input
                  type="checkbox"
                  checked={form.cert}
                  onChange={(e) => handleChange("cert", e.target.checked)}
                  className="checkbox checkbox-sm checkbox-primary rounded"
                />
                <span className="font-medium text-base-content text-xs">
                  Certificate issued
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-base-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="btn btn-sm btn-ghost rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-sm bg-primary text-white hover:bg-primary/90 rounded-xl px-5 gap-1.5 shadow-sm shadow-primary/20"
          >
            {isSubmitting ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              <Plus className="size-3.5" />
            )}
            <span>Create course</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
