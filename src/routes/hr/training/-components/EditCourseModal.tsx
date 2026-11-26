import { useEffect, useRef, useState } from "react";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import SimpleInput from "@/components/inputs/SimpleInput";
import LocalSelect from "@/components/inputs/LocalSelect";
import RichTextEditor, {
  sanitizeRichText,
} from "@/components/inputs/RichTextEditor";
import TargetAudiencePicker from "./TargetAudiencePicker";
import { COURSE_CATEGORIES, DELIVERY_MODES } from "./trainingData";
import type { Course, CourseCategory, DeliveryMode } from "./types";
import { toBackendCategory, toBackendDeliveryMode } from "./mappers";
import type {
  BackendTargetType,
  UpdateTrainingCoursePayload,
} from "@/api/trainingApi";
import { toast } from "sonner";
import { BookOpen, Save } from "lucide-react";

interface EditCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null;
  onUpdateCourse: (
    courseId: string,
    payload: UpdateTrainingCoursePayload,
  ) => Promise<void>;
}

const VALID_TARGET_TYPES: BackendTargetType[] = [
  "all",
  "department",
  "role",
  "selected",
];

function normalizeTargetType(raw?: string): BackendTargetType {
  const lower = String(raw || "all").toLowerCase() as BackendTargetType;
  return VALID_TARGET_TYPES.includes(lower) ? lower : "all";
}

export default function EditCourseModal({
  isOpen,
  onClose,
  course,
  onUpdateCourse,
}: EditCourseModalProps) {
  const modalRef = useRef<ModalHandle>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<CourseCategory>("Compliance");
  const [mode, setMode] = useState<DeliveryMode>("Virtual");
  const [cost, setCost] = useState("0");
  const [learningObjectives, setLearningObjectives] = useState("");
  const [mandatory, setMandatory] = useState(false);
  const [cert, setCert] = useState(true);
  const [targetType, setTargetType] = useState<BackendTargetType>("all");
  const [targetIds, setTargetIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && course) {
      setTitle(course.title || "");
      setCategory(course.category || "Compliance");
      setMode(course.mode || "Virtual");
      setCost(
        typeof course.costPerPersonKobo === "number" &&
          course.costPerPersonKobo > 0
          ? String(course.costPerPersonKobo / 100)
          : "0",
      );
      setLearningObjectives(course.learningObjectives || "");
      setMandatory(Boolean(course.mandatory));
      setCert(Boolean(course.certificateOnCompletion));
      setTargetType(normalizeTargetType(course.targetType));
      setTargetIds(Array.isArray(course.targetIds) ? course.targetIds : []);
      modalRef.current?.open();
    } else {
      modalRef.current?.close();
    }
  }, [isOpen, course]);

  if (!course) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please provide a course title");
      return;
    }

    if (targetType !== "all" && targetIds.length === 0) {
      toast.error("Please select at least one target recipient");
      return;
    }

    const sanitizedCost = cost.replace(/[^0-9.]/g, "") || "0";
    const normalizedCost = /^(0|[1-9]\d*)(\.\d{1,6})?$/.test(sanitizedCost)
      ? sanitizedCost
      : String(Number(sanitizedCost) || 0);

    const sanitizedObjectives = sanitizeRichText(learningObjectives);

    const payload: UpdateTrainingCoursePayload = {
      title: title.trim(),
      category: toBackendCategory(category),
      defaultDeliveryMode: toBackendDeliveryMode(mode),
      learningObjectives:
        sanitizedObjectives ||
        `Core syllabus and learning objectives for ${title.trim()}`,
      mandatory,
      certificateOnCompletion: cert,
      targetType,
      targetIds: targetType === "all" ? [] : targetIds,
      costPerPerson: normalizedCost,
    };

    setIsSubmitting(true);
    try {
      await onUpdateCourse(course.id, payload);
      onClose();
    } catch {
      // Errors handled by mutation / caller toast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      ref={modalRef}
      title="Edit Course"
      maxWidth="max-w-2xl"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <p className="text-xs text-base-content/80 -mt-1">
          Update course details, target audience, cost, and certification
          settings.
        </p>

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
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Information Security & Phishing Awareness"
                required
              />
            </div>

            <div>
              <label className="font-semibold text-base-content/80 mb-1 block">
                Category <span className="text-error">*</span>
              </label>
              <LocalSelect
                value={category}
                onChange={(e) => setCategory(e.target.value as CourseCategory)}
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
                Default delivery mode <span className="text-error">*</span>
              </label>
              <LocalSelect
                value={mode}
                onChange={(e) => setMode(e.target.value as DeliveryMode)}
              >
                {DELIVERY_MODES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </LocalSelect>
            </div>

            <div>
              <label className="font-semibold text-base-content/80 mb-1 block">
                Cost per participant (₦)
              </label>
              <SimpleInput
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="e.g. 25000 (0 if Free)"
              />
            </div>

            <div className="flex items-center gap-4 pt-4 sm:pt-6">
              <label className="label cursor-pointer justify-start gap-2 p-0">
                <input
                  type="checkbox"
                  checked={mandatory}
                  onChange={(e) => setMandatory(e.target.checked)}
                  className="checkbox checkbox-sm checkbox-primary rounded"
                />
                <span className="font-medium text-base-content text-xs">
                  Mandatory for staff
                </span>
              </label>

              <label className="label cursor-pointer justify-start gap-2 p-0">
                <input
                  type="checkbox"
                  checked={cert}
                  onChange={(e) => setCert(e.target.checked)}
                  className="checkbox checkbox-sm checkbox-primary rounded"
                />
                <span className="font-medium text-base-content text-xs">
                  Certificate issued
                </span>
              </label>
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-base-content/80 mb-1 block">
                Learning objectives & description
              </label>
              <RichTextEditor
                value={learningObjectives}
                onChange={setLearningObjectives}
                placeholder="Key outcomes, syllabus outline, or prerequisites..."
                compact
              />
            </div>

            <div className="sm:col-span-2">
              <TargetAudiencePicker
                targetType={targetType}
                targetIds={targetIds}
                onChangeTargetType={setTargetType}
                onChangeTargetIds={setTargetIds}
              />
            </div>
          </div>
        </div>

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
              <Save className="size-3.5" />
            )}
            <span>Save changes</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
