import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import LocalSelect from "@/components/inputs/LocalSelect";
import type { Course } from "./types";
import type {
  BackendDeliveryMode,
  CreateTrainingSessionPayload,
} from "@/api/trainingApi";
import { useStaffs } from "@/api/tenantApi";
import { Calendar, Plus } from "lucide-react";

interface ScheduleSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  defaultCourseId?: string;
  onScheduleSession: (payload: CreateTrainingSessionPayload) => Promise<void>;
}

interface ScheduleSessionFormValues {
  courseId: string;
  date: string;
  startTime: string;
  endTime: string;
  deliveryMode: BackendDeliveryMode;
  location: string;
  meetingUrl: string;
  capacity: number;
  trainerType: "internal" | "external";
  internalTrainerId: string;
  externalProvider: string;
}

export default function ScheduleSessionModal({
  isOpen,
  onClose,
  courses,
  defaultCourseId,
  onScheduleSession,
}: ScheduleSessionModalProps) {
  const modalRef = useRef<ModalHandle>(null);
  const staffQuery = useStaffs();
  const staffs = staffQuery.data ?? [];

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { isSubmitting },
  } = useForm<ScheduleSessionFormValues>({
    defaultValues: {
      courseId: defaultCourseId ?? courses[0]?.id ?? "",
      date: new Date().toISOString().slice(0, 10),
      startTime: "10:00",
      endTime: "12:00",
      deliveryMode: "virtual",
      location: "",
      meetingUrl: "",
      capacity: 25,
      trainerType: "internal",
      internalTrainerId: "",
      externalProvider: "",
    },
  });

  const deliveryMode = watch("deliveryMode");
  const trainerType = watch("trainerType");

  useEffect(() => {
    if (isOpen) {
      reset({
        courseId: defaultCourseId ?? courses[0]?.id ?? "",
        date: new Date().toISOString().slice(0, 10),
        startTime: "10:00",
        endTime: "12:00",
        deliveryMode: "virtual",
        location: "",
        meetingUrl: "",
        capacity: 25,
        trainerType: "internal",
        internalTrainerId: "",
        externalProvider: "",
      });
      modalRef.current?.open();
    } else {
      modalRef.current?.close();
    }
  }, [isOpen, defaultCourseId, courses, reset]);

  const onSubmit = async (values: ScheduleSessionFormValues) => {
    const startsAt = new Date(
      `${values.date}T${values.startTime}:00`,
    ).toISOString();
    const endsAt = new Date(
      `${values.date}T${values.endTime}:00`,
    ).toISOString();

    await onScheduleSession({
      courseId: values.courseId,
      startsAt,
      endsAt,
      deliveryMode: values.deliveryMode,
      location: values.location.trim() || undefined,
      meetingUrl: values.meetingUrl.trim() || undefined,
      capacity: Number(values.capacity) || 25,
      trainerType: values.trainerType,
      internalTrainerId:
        values.trainerType === "internal" && values.internalTrainerId
          ? values.internalTrainerId
          : undefined,
      externalProvider:
        values.trainerType === "external" && values.externalProvider.trim()
          ? values.externalProvider.trim()
          : undefined,
    });
    onClose();
  };

  return (
    <Modal
      ref={modalRef}
      title="Schedule Training Session"
      maxWidth="max-w-2xl"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <p className="text-sm text-base-content/80 -mt-1">
          Schedule a live virtual, in-person, or hybrid cohort session for a
          course.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="sm:col-span-2">
            <label className="font-semibold text-base-content/80 mb-1 flex items-center gap-1.5">
              <Calendar className="size-4 text-primary" />
              <span>
                Course <span className="text-error">*</span>
              </span>
            </label>
            <LocalSelect {...register("courseId", { required: true })}>
              <option value="">Select a course</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </LocalSelect>
          </div>

          <div>
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
              Capacity <span className="text-error">*</span>
            </label>
            <input
              type="number"
              min={1}
              {...register("capacity", { required: true, valueAsNumber: true })}
              className="input input-bordered w-full rounded-xl bg-base-200/80"
            />
          </div>

          <div>
            <label className="font-semibold text-base-content/80 mb-1 block">
              Start time <span className="text-error">*</span>
            </label>
            <input
              type="time"
              {...register("startTime", { required: true })}
              className="input input-bordered w-full rounded-xl bg-base-200/80"
            />
          </div>

          <div>
            <label className="font-semibold text-base-content/80 mb-1 block">
              End time <span className="text-error">*</span>
            </label>
            <input
              type="time"
              {...register("endTime", { required: true })}
              className="input input-bordered w-full rounded-xl bg-base-200/80"
            />
          </div>

          <div>
            <label className="font-semibold text-base-content/80 mb-1 block">
              Delivery mode <span className="text-error">*</span>
            </label>
            <LocalSelect {...register("deliveryMode", { required: true })}>
              <option value="virtual">Virtual</option>
              <option value="in_person">In-person</option>
              <option value="hybrid">Hybrid</option>
            </LocalSelect>
          </div>

          <div>
            <label className="font-semibold text-base-content/80 mb-1 block">
              Trainer type <span className="text-error">*</span>
            </label>
            <LocalSelect {...register("trainerType", { required: true })}>
              <option value="internal">Internal staff</option>
              <option value="external">External provider</option>
            </LocalSelect>
          </div>

          {(deliveryMode === "in_person" || deliveryMode === "hybrid") && (
            <div className="sm:col-span-2">
              <label className="font-semibold text-base-content/80 mb-1 block">
                Location
              </label>
              <input
                type="text"
                {...register("location")}
                placeholder="e.g. HQ Training Room B"
                className="input input-bordered w-full rounded-xl bg-base-200/80"
              />
            </div>
          )}

          {(deliveryMode === "virtual" || deliveryMode === "hybrid") && (
            <div className="sm:col-span-2">
              <label className="font-semibold text-base-content/80 mb-1 block">
                Meeting URL
              </label>
              <input
                type="url"
                {...register("meetingUrl")}
                placeholder="https://meet.google.com/..."
                className="input input-bordered w-full rounded-xl bg-base-200/80"
              />
            </div>
          )}

          {trainerType === "internal" ? (
            <div className="sm:col-span-2">
              <label className="font-semibold text-base-content/80 mb-1 block">
                Internal trainer
              </label>
              <LocalSelect {...register("internalTrainerId")}>
                <option value="">Select staff trainer</option>
                {staffs.map((member) => (
                  <option key={member.id} value={member.id}>
                    {`${member.firstName ?? ""} ${member.lastName ?? ""}`.trim() ||
                      member.email}
                  </option>
                ))}
              </LocalSelect>
            </div>
          ) : (
            <div className="sm:col-span-2">
              <label className="font-semibold text-base-content/80 mb-1 block">
                External provider name
              </label>
              <input
                type="text"
                {...register("externalProvider")}
                placeholder="e.g. Lagos Business School"
                className="input input-bordered w-full rounded-xl bg-base-200/80"
              />
            </div>
          )}
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
            disabled={isSubmitting || courses.length === 0}
            className="btn btn-sm bg-primary text-white hover:bg-primary/90 rounded-xl px-5 gap-1.5 shadow-sm shadow-primary/20"
          >
            <Plus className="size-4" />
            <span>{isSubmitting ? "Scheduling..." : "Schedule session"}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
