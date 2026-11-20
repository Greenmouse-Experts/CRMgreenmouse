import { useState, useRef, useEffect } from "react";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import SimpleInput from "@/components/inputs/SimpleInput";
import LocalSelect from "@/components/inputs/LocalSelect";
import {
  COURSE_CATEGORIES,
  DELIVERY_MODES,
  TARGET_AUDIENCE_OPTIONS,
} from "./trainingData";
import type {
  Course,
  CourseCategory,
  DeliveryMode,
  TrainingSession,
} from "./types";
import { toast } from "sonner";
import { BookOpen, Calendar, Plus } from "lucide-react";

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateCourse: (course: Course, session?: TrainingSession) => void;
}

export default function CreateCourseModal({
  isOpen,
  onClose,
  onCreateCourse,
}: CreateCourseModalProps) {
  const modalRef = useRef<ModalHandle>(null);

  const [form, setForm] = useState({
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
    audience: "All staff",
    cert: true,
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

    if (!form.title.trim()) {
      toast.error("Please provide a course title");
      return;
    }

    if (!form.trainer.trim()) {
      toast.error("Please specify a trainer or training provider");
      return;
    }

    setIsSubmitting(true);

    try {
      const courseId = `CRS-${Date.now().toString().slice(-4)}`;
      const newCourse: Course = {
        id: courseId,
        title: form.title.trim(),
        category: form.category,
        enrolled: 0,
        completionRate: 0,
        mode: form.mode,
        trainer: form.trainer.trim(),
        duration: Number(form.duration) || 2,
        mandatory: form.mandatory,
      };

      // Also create an upcoming training session if a start date is set
      let newSession: TrainingSession | undefined;
      if (form.start) {
        const dateObj = new Date(form.start);
        const formattedDate = dateObj.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });

        newSession = {
          id: `SES-${Date.now().toString().slice(-4)}`,
          course: form.title.trim(),
          date: formattedDate,
          trainer: form.trainer.trim(),
          status: "Scheduled",
          mode: form.mode,
          location:
            form.mode === "Virtual"
              ? "Virtual Room (Link to follow)"
              : form.mode === "Self-paced online"
                ? "LMS Portal"
                : "Main Training Hall, Lagos HQ",
        };
      }

      onCreateCourse(newCourse, newSession);
      toast.success("Course created successfully", {
        description: `"${newCourse.title}" has been added to training catalog.`,
      });

      // Reset form
      setForm({
        title: "",
        category: "Compliance",
        mode: "Virtual",
        trainer: "",
        duration: 4,
        capacity: 25,
        cost: "",
        mandatory: false,
        desc: "",
        start: new Date().toISOString().slice(0, 10),
        end: "",
        audience: "All staff",
        cert: true,
      });

      onClose();
    } catch {
      toast.error("Failed to create course");
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
        <p className=" text-base-content/80 -mt-1">
          Add a new training course, specify delivery mode, trainer details, and
          scheduling.
        </p>

        {/* Section 1: Course Information */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 pb-1 border-b border-base-200">
            <BookOpen className="size-3.5 text-primary" />
            <h4 className=" font-semibold uppercase tracking-wider text-base-content/70">
              Course Details
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="sm:col-span-2">
              <label className=" font-semibold text-base-content/80 mb-1 block">
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
              <label className=" font-semibold text-base-content/80 mb-1 block">
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
              <label className=" font-semibold text-base-content/80 mb-1 block">
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
              <label className=" font-semibold text-base-content/80 mb-1 block">
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
              <label className=" font-semibold text-base-content/80 mb-1 block">
                Duration (hours)
              </label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={form.duration}
                onChange={(e) => handleChange("duration", e.target.value)}
                className="input input-bordered w-full  rounded-xl bg-base-200/80"
                placeholder="e.g. 4"
              />
            </div>

            <div>
              <label className=" font-semibold text-base-content/80 mb-1 block">
                Max Capacity
              </label>
              <input
                type="number"
                min="1"
                value={form.capacity}
                onChange={(e) => handleChange("capacity", e.target.value)}
                className="input input-bordered w-full  rounded-xl bg-base-200/80"
                placeholder="e.g. 30"
              />
            </div>

            <div>
              <label className=" font-semibold text-base-content/80 mb-1 block">
                Cost per participant (₦)
              </label>
              <SimpleInput
                value={form.cost}
                onChange={(e) => handleChange("cost", e.target.value)}
                placeholder="e.g. 25,000 (Free if 0)"
              />
            </div>

            <div className="sm:col-span-2">
              <label className=" font-semibold text-base-content/80 mb-1 block">
                Learning objectives & description
              </label>
              <textarea
                value={form.desc}
                onChange={(e) => handleChange("desc", e.target.value)}
                rows={2}
                placeholder="Key outcomes, syllabus outline, or prerequisites..."
                className="textarea textarea-bordered w-full  rounded-xl bg-base-200/80"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Scheduling & Target Audience */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 pb-1 border-b border-base-200">
            <Calendar className="size-3.5 text-primary" />
            <h4 className=" font-semibold uppercase tracking-wider text-base-content/70">
              Schedule & Enrollment
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className=" font-semibold text-base-content/80 mb-1 block">
                Start date <span className="text-error">*</span>
              </label>
              <input
                type="date"
                value={form.start}
                onChange={(e) => handleChange("start", e.target.value)}
                className="input input-bordered w-full  rounded-xl bg-base-200/80"
                required
              />
            </div>

            <div>
              <label className=" font-semibold text-base-content/80 mb-1 block">
                End date (optional)
              </label>
              <input
                type="date"
                value={form.end}
                onChange={(e) => handleChange("end", e.target.value)}
                className="input input-bordered w-full  rounded-xl bg-base-200/80"
              />
            </div>

            <div>
              <label className=" font-semibold text-base-content/80 mb-1 block">
                Target audience
              </label>
              <LocalSelect
                value={form.audience}
                onChange={(e) => handleChange("audience", e.target.value)}
              >
                {TARGET_AUDIENCE_OPTIONS.map((aud) => (
                  <option key={aud} value={aud}>
                    {aud}
                  </option>
                ))}
              </LocalSelect>
            </div>

            <div className="flex items-center gap-4 pt-4 sm:pt-6">
              <label className="label cursor-pointer justify-start gap-2 p-0">
                <input
                  type="checkbox"
                  checked={form.mandatory}
                  onChange={(e) => handleChange("mandatory", e.target.checked)}
                  className="checkbox checkbox-sm checkbox-primary rounded"
                />
                <span className=" font-medium text-base-content">
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
                <span className=" font-medium text-base-content">
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
            className="btn btn-sm btn-ghost rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-sm bg-primary text-white hover:bg-primary/90 rounded-xl px-5 gap-1.5 shadow-sm shadow-primary/20"
          >
            <Plus className="size-3.5" />
            <span>Create course</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
