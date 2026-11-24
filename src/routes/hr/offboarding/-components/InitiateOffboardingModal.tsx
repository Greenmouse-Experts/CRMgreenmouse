import { Fragment, useEffect, useRef } from "react";
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
} from "react-hook-form";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import LocalSelect from "@/components/inputs/LocalSelect";
import SimpleSelect from "@/components/inputs/SimpleSelect";
import SimpleTextArea from "@/components/inputs/SimpleTextArea";
import { CLEARANCE_DEPARTMENTS, SEPARATION_TYPES } from "./offboardingData";
import type {
  ClearanceDepartment,
  OffboardingCase,
  SeparationType,
} from "./types";
import type { EmployeeRecord } from "@/api/employeesApi";
import {
  useInitiateOffboarding,
  type OffboardingTaskInput,
} from "@/api/offboardingApi";
import { extract_message } from "@/helpers/errors";
import { toast } from "sonner";
import { ClipboardList, FileText, Plus, Trash2, UserMinus } from "lucide-react";

interface InitiateOffboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (created: OffboardingCase) => void;
}

const TASK_TYPES = [
  { value: "handover", label: "Handover" },
  { value: "asset_return", label: "Asset return" },
  { value: "clearance", label: "Clearance" },
  { value: "exit_interview", label: "Exit interview" },
  { value: "access_revocation", label: "Access revocation" },
] as const;

interface TaskRow {
  taskType: string;
  department: ClearanceDepartment;
  title: string;
  assignedTo: string;
  dueDate: string;
  required: boolean;
}

interface InitiateFormData {
  employeeId: string;
  separationType: SeparationType;
  noticeDate: string;
  lastWorkingDate: string;
  confidentialReason: string;
  tasks: TaskRow[];
  confirm: boolean;
}

const toCategory = (type: SeparationType): string => {
  switch (type) {
    case "End of Contract":
      return "end_of_contract";
    case "Redundancy":
      return "redundancy";
    case "Termination":
      return "termination";
    case "Retirement":
      return "retirement";
    case "Resignation":
    default:
      return "resignation";
  }
};

const defaultDates = () => ({
  noticeDate: new Date().toISOString().slice(0, 10),
  lastWorkingDate: new Date(Date.now() + 30 * 86400000)
    .toISOString()
    .slice(0, 10),
});

export default function InitiateOffboardingModal({
  isOpen,
  onClose,
  onSuccess,
}: InitiateOffboardingModalProps) {
  const modalRef = useRef<ModalHandle>(null);
  const initiateOffboarding = useInitiateOffboarding();

  const methods = useForm<InitiateFormData>({
    mode: "onSubmit",
    defaultValues: {
      employeeId: "",
      separationType: "Resignation",
      ...defaultDates(),
      confidentialReason: "",
      tasks: [],
      confirm: false,
    },
  });

  const { control, register, handleSubmit, watch, reset } = methods;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "tasks",
  });

  const lastWorkingDate = watch("lastWorkingDate");

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.open();
      reset({
        employeeId: "",
        separationType: "Resignation",
        ...defaultDates(),
        confidentialReason: "",
        tasks: [],
        confirm: false,
      });
    } else {
      modalRef.current?.close();
    }
  }, [isOpen, reset]);

  const handleAddTask = () => {
    append({
      taskType: "handover",
      department: "Manager",
      title: "",
      assignedTo: "",
      dueDate: lastWorkingDate || defaultDates().lastWorkingDate,
      required: true,
    });
  };

  const onSubmit = async (values: InitiateFormData) => {
    if (!values.employeeId) {
      toast.error("Please select an employee");
      return;
    }
    if (!values.confirm) {
      toast.error(
        "Please confirm that separation notice has been acknowledged",
      );
      return;
    }

    for (let i = 0; i < values.tasks.length; i++) {
      const t = values.tasks[i];
      if (!t.title.trim()) {
        toast.error(`Task #${i + 1}: please enter a title`);
        return;
      }
      if (!t.assignedTo) {
        toast.error(`Task #${i + 1}: please select an assignee`);
        return;
      }
    }

    try {
      const tasks: OffboardingTaskInput[] | undefined =
        values.tasks.length > 0
          ? values.tasks.map((t) => ({
              taskType: t.taskType,
              department: t.department,
              title: t.title.trim(),
              assignedTo: t.assignedTo,
              dueDate: t.dueDate || values.lastWorkingDate,
              required: t.required,
            }))
          : undefined;

      const created = await initiateOffboarding.mutateAsync({
        employeeId: values.employeeId,
        category: toCategory(values.separationType),
        noticeDate: values.noticeDate,
        lastWorkingDate: values.lastWorkingDate,
        confidentialReason: values.confidentialReason.trim() || undefined,
        tasks,
      });

      toast.success("Offboarding initiated");
      onSuccess?.(created);
      onClose();
    } catch (error) {
      toast.error(extract_message(error));
    }
  };

  return (
    <Modal
      ref={modalRef}
      title="Initiate Offboarding"
      maxWidth="max-w-3xl"
      onClose={onClose}
    >
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <p className="text-base-content/80 -mt-1">
            Initiate exit pipeline, assign clearance milestones, and schedule
            system access revocation.
          </p>

          <div className="space-y-3">
            <div className="flex items-center gap-1.5 pb-1 border-b border-base-200">
              <UserMinus className="size-4 text-primary" />
              <h4 className="font-semibold uppercase tracking-wider text-base-content/80">
                Employee & Separation Details
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Controller
                name="employeeId"
                control={control}
                rules={{ required: "Employee is required" }}
                render={({ field }) => (
                  <SimpleSelect<EmployeeRecord>
                    route="/employees"
                    value={field.value}
                    onChange={field.onChange}
                    label="Employee *"
                    render={(emp, index) => {
                      const name =
                        [emp.firstName, emp.lastName]
                          .filter(Boolean)
                          .join(" ") ||
                        emp.email ||
                        "Unnamed";
                      return (
                        <Fragment key={emp.id}>
                          {index === 0 && (
                            <option value="">Select Employee</option>
                          )}
                          <option value={emp.id}>{name}</option>
                        </Fragment>
                      );
                    }}
                  />
                )}
              />

              <LocalSelect
                label="Separation Type *"
                {...register("separationType")}
              >
                {SEPARATION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </LocalSelect>

              <div>
                <label className="font-semibold text-base-content/80 mb-1 block">
                  Notice / Resignation Date{" "}
                  <span className="text-error">*</span>
                </label>
                <input
                  type="date"
                  {...register("noticeDate", { required: true })}
                  className="input input-bordered w-full rounded-xl bg-base-200/80"
                />
              </div>

              <div>
                <label className="font-semibold text-base-content/80 mb-1 block">
                  Last Working Day <span className="text-error">*</span>
                </label>
                <input
                  type="date"
                  {...register("lastWorkingDate", { required: true })}
                  className="input input-bordered w-full rounded-xl bg-base-200/80"
                />
              </div>

              <div className="sm:col-span-2">
                <SimpleTextArea
                  label="Notes / Reason for exit"
                  rows={2}
                  placeholder="Brief summary of resignation or handover agreement..."
                  {...register("confidentialReason")}
                />
              </div>
            </div>
          </div>

          {/* Initial Offboarding Tasks */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-base-200">
              <div className="flex items-center gap-1.5">
                <ClipboardList className="size-4 text-primary" />
                <h4 className="font-semibold uppercase tracking-wider text-base-content/80">
                  Initial Clearance & Handover Tasks ({fields.length})
                </h4>
              </div>
              <button
                type="button"
                onClick={handleAddTask}
                className="btn btn-xs btn-outline rounded-lg gap-1"
              >
                <Plus className="size-3.5" />
                <span>Add task</span>
              </button>
            </div>

            {fields.length === 0 ? (
              <p className="text-sm text-base-content/70">
                No initial tasks added. Click &ldquo;Add task&rdquo; to assign
                handover, asset return, or clearance tasks now.
              </p>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {fields.map((fieldItem, idx) => (
                  <div
                    key={fieldItem.id}
                    className="rounded-xl border border-base-200 bg-base-200/30 p-3 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-base-content/80">
                        Task #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => remove(idx)}
                        className="btn btn-xs btn-ghost text-error gap-1 rounded-lg"
                      >
                        <Trash2 className="size-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          {...register(`tasks.${idx}.title` as const)}
                          placeholder="Task title (e.g. Return company laptop)"
                          className="input input-bordered input-sm w-full rounded-xl bg-base-100"
                        />
                      </div>

                      <LocalSelect
                        label="Task Type"
                        {...register(`tasks.${idx}.taskType` as const)}
                      >
                        {TASK_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </LocalSelect>

                      <LocalSelect
                        label="Department"
                        {...register(`tasks.${idx}.department` as const)}
                      >
                        {CLEARANCE_DEPARTMENTS.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </LocalSelect>

                      <Controller
                        name={`tasks.${idx}.assignedTo` as const}
                        control={control}
                        render={({ field }) => (
                          <SimpleSelect<EmployeeRecord>
                            route="/employees"
                            value={field.value}
                            onChange={field.onChange}
                            label="Assigned To *"
                            render={(emp, index) => {
                              const name =
                                [emp.firstName, emp.lastName]
                                  .filter(Boolean)
                                  .join(" ") ||
                                emp.email ||
                                "Unnamed";
                              return (
                                <Fragment key={emp.id}>
                                  {index === 0 && (
                                    <option value="">Select Assignee</option>
                                  )}
                                  <option value={emp.id}>{name}</option>
                                </Fragment>
                              );
                            }}
                          />
                        )}
                      />

                      <div>
                        <label className="font-semibold text-base-content/80 mb-1 block">
                          Due Date
                        </label>
                        <input
                          type="date"
                          {...register(`tasks.${idx}.dueDate` as const)}
                          className="input input-bordered input-sm w-full rounded-xl bg-base-100"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            {...register(`tasks.${idx}.required` as const)}
                            className="checkbox checkbox-xs checkbox-primary rounded"
                          />
                          <span className="text-sm text-base-content/80">
                            Required for offboarding completion
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-1.5 pb-1 border-b border-base-200">
              <FileText className="size-4 text-primary" />
              <h4 className="font-semibold uppercase tracking-wider text-base-content/80">
                Compliance Confirmation
              </h4>
            </div>

            <label className="flex items-start cursor-pointer gap-2.5 p-3 rounded-xl border border-base-200 bg-base-200/30 hover:bg-base-200/80 transition-colors whitespace-normal">
              <input
                type="checkbox"
                {...register("confirm")}
                className="checkbox checkbox-sm checkbox-primary rounded shrink-0 mt-0.5"
              />
              <span className="text-sm text-base-content font-medium leading-snug min-w-0 flex-1">
                I confirm that notice has been acknowledged, records will be
                retained, and system credentials will be scheduled for
                revocation upon final day.
              </span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-base-200">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-sm btn-ghost rounded-xl"
              disabled={initiateOffboarding.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={initiateOffboarding.isPending}
              className="btn btn-sm bg-primary text-white hover:bg-primary/90 rounded-xl px-5 gap-1.5 shadow-sm shadow-primary/20"
            >
              <Plus className="size-4" />
              <span>
                {initiateOffboarding.isPending
                  ? "Initiating..."
                  : "Initiate pipeline"}
              </span>
            </button>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
}
