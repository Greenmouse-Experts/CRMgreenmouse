import { useEffect, useRef } from "react";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import { RichTextContent } from "@/components/inputs/RichTextEditor";
import type { Course } from "./types";
import {
  downloadTrainingMaterial,
  useTrainingCourse,
  useTrainingCourseMaterials,
  useUploadTrainingMaterial,
  type TrainingMaterialItem,
} from "@/api/trainingApi";
import { extract_message } from "@/helpers/errors";
import { toast } from "sonner";
import {
  Archive,
  Award,
  CalendarPlus,
  Download,
  FileText,
  GraduationCap,
  Upload,
  UploadCloud,
} from "lucide-react";

interface CourseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null;
  onPublish?: (courseId: string) => void;
  onArchive?: (courseId: string) => void;
  onScheduleSession?: (courseId: string) => void;
}

export default function CourseDetailModal({
  isOpen,
  onClose,
  course,
  onPublish,
  onArchive,
  onScheduleSession,
}: CourseDetailModalProps) {
  const modalRef = useRef<ModalHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const courseDetailQuery = useTrainingCourse(isOpen ? course?.id : undefined);
  const materialsQuery = useTrainingCourseMaterials(
    isOpen ? course?.id : undefined,
  );
  const uploadMaterialMutation = useUploadTrainingMaterial();

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.open();
    } else {
      modalRef.current?.close();
    }
  }, [isOpen]);

  if (!course) return null;

  const detail = courseDetailQuery.data;
  const objectives = detail?.learningObjectives || course.learningObjectives;
  const deliveryMode = course.mode || detail?.defaultDeliveryMode || "—";
  const costNaira =
    typeof detail?.costPerPersonKobo === "number" &&
    detail.costPerPersonKobo > 0
      ? `₦${(detail.costPerPersonKobo / 100).toLocaleString()}`
      : "Free";
  const statusLower = String(course.status ?? "draft").toLowerCase();
  const materials = materialsQuery.data ?? [];

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !course) return;
    try {
      await uploadMaterialMutation.mutateAsync({ courseId: course.id, file });
      toast.success("Training material uploaded");
    } catch (error) {
      toast.error(extract_message(error as any));
    } finally {
      e.target.value = "";
    }
  };

  const handleDownload = async (material: TrainingMaterialItem) => {
    try {
      const response = await downloadTrainingMaterial(material.id);
      const blob = new Blob([response.data]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        material.fileName || material.title || material.name || "material";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      if (material.fileUrl || material.url) {
        window.open(material.fileUrl || material.url, "_blank");
      } else {
        toast.error(extract_message(error as any));
      }
    }
  };

  return (
    <Modal
      ref={modalRef}
      title={
        <div className="flex items-center gap-2">
          <GraduationCap className="size-5 text-primary" />
          <span>{course.title}</span>
        </div>
      }
      maxWidth="max-w-2xl"
      onClose={onClose}
    >
      <div className="space-y-5">
        <div className="rounded-xl border border-base-200 bg-base-200/30 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="badge badge-sm badge-outline font-semibold">
                {course.category}
              </span>
              <span className="badge badge-sm badge-ghost">{deliveryMode}</span>
              {course.mandatory && (
                <span className="badge badge-sm badge-error badge-outline">
                  Mandatory
                </span>
              )}
              {course.certificateOnCompletion && (
                <span className="badge badge-sm badge-success badge-outline gap-1">
                  <Award className="size-3" />
                  Certificate
                </span>
              )}
            </div>
            <span className="badge badge-sm badge-info font-semibold">
              {course.status}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-base-200/80 text-sm">
            <div>
              <span className="text-base-content/70 block">Enrolled</span>
              <span className="font-bold text-base-content">
                {course.enrolled} staff
              </span>
            </div>
            <div>
              <span className="text-base-content/70 block">Completion</span>
              <span className="font-bold text-base-content">
                {course.completionRate}%
              </span>
            </div>
            <div>
              <span className="text-base-content/70 block">Cost / person</span>
              <span className="font-bold text-base-content">{costNaira}</span>
            </div>
          </div>
        </div>

        {objectives && (
          <div className="space-y-1.5">
            <h4 className="font-bold uppercase tracking-wider text-base-content/80 flex items-center gap-1.5">
              <FileText className="size-4 text-primary" />
              <span>Learning Objectives</span>
            </h4>
            <div className="p-3 rounded-xl border border-base-200 bg-base-100 leading-relaxed">
              <RichTextContent value={objectives} />
            </div>
          </div>
        )}

        {/* Course Materials */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-bold uppercase tracking-wider text-base-content/80">
              Course Materials ({materials.length})
            </h4>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleUpload}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadMaterialMutation.isPending}
                className="btn btn-sm btn-outline rounded-lg gap-1"
              >
                <Upload className="size-3.5" />
                <span>
                  {uploadMaterialMutation.isPending
                    ? "Uploading..."
                    : "Upload material"}
                </span>
              </button>
            </div>
          </div>

          {materialsQuery.isLoading ? (
            <p className="text-sm text-base-content/70">Loading materials...</p>
          ) : materials.length === 0 ? (
            <p className="text-sm text-base-content/70">
              No materials uploaded for this course yet.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {materials.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between rounded-lg border border-base-200 bg-base-200/40 px-3 py-2 text-sm"
                >
                  <span className="truncate font-medium">
                    {m.title || m.fileName || m.name || "Course material"}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDownload(m)}
                    className="btn btn-sm btn-ghost gap-1 text-primary shrink-0"
                  >
                    <Download className="size-3.5" />
                    <span>Download</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-base-200">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm btn-ghost rounded-xl"
          >
            Close
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {onScheduleSession && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onScheduleSession(course.id);
                }}
                className="btn btn-sm btn-outline rounded-xl gap-1.5"
              >
                <CalendarPlus className="size-4" />
                <span>Schedule session</span>
              </button>
            )}
            {statusLower === "draft" && onPublish && (
              <button
                type="button"
                onClick={() => {
                  onPublish(course.id);
                  onClose();
                }}
                className="btn btn-sm bg-primary text-white hover:bg-primary/90 rounded-xl gap-1.5"
              >
                <UploadCloud className="size-4" />
                <span>Publish</span>
              </button>
            )}
            {statusLower !== "archived" && onArchive && (
              <button
                type="button"
                onClick={() => {
                  onArchive(course.id);
                  onClose();
                }}
                className="btn btn-sm btn-outline btn-error rounded-xl gap-1.5"
              >
                <Archive className="size-4" />
                <span>Archive</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
