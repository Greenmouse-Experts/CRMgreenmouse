import { Fragment, useEffect, useRef } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import LocalSelect from "@/components/inputs/LocalSelect";
import SimpleSelect from "@/components/inputs/SimpleSelect";
import SimpleTextArea from "@/components/inputs/SimpleTextArea";
import { SEPARATION_TYPES } from "./offboardingData";
import type { OffboardingCase, SeparationType } from "./types";
import type { EmployeeRecord } from "@/api/employeesApi";
import { useInitiateOffboarding } from "@/api/offboardingApi";
import { extract_message } from "@/helpers/errors";
import { toast } from "sonner";
import { FileText, Plus, UserMinus } from "lucide-react";

interface InitiateOffboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (created: OffboardingCase) => void;
}

interface InitiateFormData {
  employeeId: string;
  separationType: SeparationType;
  noticeDate: string;
  lastWorkingDate: string;
  handoverToId: string;
  confidentialReason: string;
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
      handoverToId: "",
      confidentialReason: "",
      confirm: false,
    },
  });

  const { control, register, handleSubmit, reset } = methods;

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.open();
      reset({
        employeeId: "",
        separationType: "Resignation",
        ...defaultDates(),
        handoverToId: "",
        confidentialReason: "",
        confirm: false,
      });
    } else {
      modalRef.current?.close();
    }
  }, [isOpen, reset]);

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

    try {
      const tasks = values.handoverToId
        ? [
            {
              taskType: "handover",
              department: "Manager",
              title: "Handover projects & documentation",
              assignedTo: values.handoverToId,
              dueDate: values.lastWorkingDate,
              required: true,
            },
          ]
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
      maxWidth="max-w-2xl"
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
                <Controller
                  name="handoverToId"
                  control={control}
                  render={({ field }) => (
                    <SimpleSelect<EmployeeRecord>
                      route="/employees"
                      value={field.value}
                      onChange={field.onChange}
                      label="Handover Assignee (optional)"
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
                              <option value="">No initial handover task</option>
                            )}
                            <option value={emp.id}>{name}</option>
                          </Fragment>
                        );
                      }}
                    />
                  )}
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

          <div className="space-y-3">
            <div className="flex items-center gap-1.5 pb-1 border-b border-base-200">
              <FileText className="size-4 text-primary" />
              <h4 className="font-semibold uppercase tracking-wider text-base-content/80">
                Compliance Confirmation
              </h4>
            </div>

            <label className="label cursor-pointer justify-start gap-2.5 p-3 rounded-xl border border-base-200 bg-base-200/30 hover:bg-base-200/80 transition-colors">
              <input
                type="checkbox"
                {...register("confirm")}
                className="checkbox checkbox-sm checkbox-primary rounded"
              />
              <span className="text-base-content font-medium leading-tight whitespace-normal">
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
