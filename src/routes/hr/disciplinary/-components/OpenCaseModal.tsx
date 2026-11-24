import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import LocalSelect from "@/components/inputs/LocalSelect";
import {
  useDisciplinaryEmployees,
  type CreateDisciplinaryCasePayload,
  type DisciplinaryEmployee,
  type DisciplinaryOptions,
} from "@/api/disciplinaryApi";
import { toast } from "sonner";
import { Plus, Settings, ShieldAlert } from "lucide-react";

interface OpenCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCase: (payload: CreateDisciplinaryCasePayload) => Promise<void>;
  options: DisciplinaryOptions;
  isLoadingOptions?: boolean;
  onOpenOptions?: () => void;
}

interface OpenCaseFormValues {
  employeeId: string;
  category: string;
  incidentDate: string;
  severity: string;
  reportedByEmployeeId: string;
  investigatorEmployeeId: string;
  description: string;
  witnesses: string;
  confidentialityConfirmed: boolean;
}

const getEmployeeLabel = (emp: DisciplinaryEmployee) => {
  const full = `${emp.firstName ?? ""} ${emp.lastName ?? ""}`.trim();
  return full || emp.name || emp.email || emp.id;
};

export default function OpenCaseModal({
  isOpen,
  onClose,
  onOpenCase,
  options,
  isLoadingOptions = false,
  onOpenOptions,
}: OpenCaseModalProps) {
  const modalRef = useRef<ModalHandle>(null);
  const employeesQuery = useDisciplinaryEmployees();
  const employees = employeesQuery.data ?? [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<OpenCaseFormValues>({
    defaultValues: {
      employeeId: "",
      category: options.categories[0] ?? "",
      incidentDate: new Date().toISOString().slice(0, 10),
      severity: options.severities[0] ?? "",
      reportedByEmployeeId: "",
      investigatorEmployeeId: "",
      description: "",
      witnesses: "",
      confidentialityConfirmed: false,
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        employeeId: "",
        category: options.categories[0] ?? "",
        incidentDate: new Date().toISOString().slice(0, 10),
        severity: options.severities[0] ?? "",
        reportedByEmployeeId: "",
        investigatorEmployeeId: "",
        description: "",
        witnesses: "",
        confidentialityConfirmed: false,
      });
      modalRef.current?.open();
    } else {
      modalRef.current?.close();
    }
  }, [isOpen, options.categories, options.severities, reset]);

  const missingOptions =
    !isLoadingOptions &&
    (options.categories.length === 0 || options.severities.length === 0);

  const onSubmit = async (values: OpenCaseFormValues) => {
    if (!values.category || !values.severity) {
      toast.error(
        "Please configure categories and severities before opening a case.",
      );
      return;
    }

    if (!values.description.trim()) {
      toast.error("Please provide a description of the incident.");
      return;
    }

    if (!values.confidentialityConfirmed) {
      toast.error(
        "You must confirm confidentiality and fair-hearing acknowledgment.",
      );
      return;
    }

    const witnessesList = values.witnesses
      .split(",")
      .map((w) => w.trim())
      .filter(Boolean);

    await onOpenCase({
      employeeId: values.employeeId,
      category: values.category,
      incidentDate: values.incidentDate,
      severity: values.severity,
      reportedByEmployeeId: values.reportedByEmployeeId,
      investigatorEmployeeId: values.investigatorEmployeeId,
      description: values.description.trim(),
      witnesses: witnessesList.length > 0 ? witnessesList : undefined,
      confidentialityConfirmed: values.confidentialityConfirmed,
    });
  };

  return (
    <Modal
      ref={modalRef}
      title="Open Disciplinary Case"
      maxWidth="max-w-2xl"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <p className="text-sm text-base-content/80 -mt-1">
          Restricted to HR. All actions on this case are audited and logged for
          compliance.
        </p>

        {missingOptions && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm">
            <span className="text-base-content">
              No categories or severities configured yet.
            </span>
            {onOpenOptions && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenOptions();
                }}
                className="btn btn-xs btn-outline rounded-lg gap-1"
              >
                <Settings className="size-3.5" />
                <span>Configure options</span>
              </button>
            )}
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center gap-1.5 pb-1 border-b border-base-200">
            <ShieldAlert className="size-4 text-primary" />
            <h4 className="font-semibold uppercase tracking-wider text-base-content/80">
              Incident Details
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="font-semibold text-base-content/80 mb-1 block">
                Employee concerned <span className="text-error">*</span>
              </label>
              <LocalSelect {...register("employeeId", { required: true })}>
                <option value="">Select employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {getEmployeeLabel(emp)}
                  </option>
                ))}
              </LocalSelect>
            </div>

            <div>
              <label className="font-semibold text-base-content/80 mb-1 block">
                Category <span className="text-error">*</span>
              </label>
              <LocalSelect
                {...register("category", { required: true })}
                disabled={isLoadingOptions || options.categories.length === 0}
              >
                <option value="">
                  {isLoadingOptions
                    ? "Loading categories..."
                    : options.categories.length === 0
                      ? "No categories configured"
                      : "Select category"}
                </option>
                {options.categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </LocalSelect>
            </div>

            <div>
              <label className="font-semibold text-base-content/80 mb-1 block">
                Incident date <span className="text-error">*</span>
              </label>
              <input
                type="date"
                {...register("incidentDate", { required: true })}
                className="input input-bordered w-full rounded-xl bg-base-200/80"
              />
            </div>

            <div>
              <label className="font-semibold text-base-content/80 mb-1 block">
                Severity <span className="text-error">*</span>
              </label>
              <LocalSelect
                {...register("severity", { required: true })}
                disabled={isLoadingOptions || options.severities.length === 0}
              >
                <option value="">
                  {isLoadingOptions
                    ? "Loading severities..."
                    : options.severities.length === 0
                      ? "No severities configured"
                      : "Select severity"}
                </option>
                {options.severities.map((sev) => (
                  <option key={sev} value={sev}>
                    {sev}
                  </option>
                ))}
              </LocalSelect>
            </div>

            <div>
              <label className="font-semibold text-base-content/80 mb-1 block">
                Reported by <span className="text-error">*</span>
              </label>
              <LocalSelect
                {...register("reportedByEmployeeId", { required: true })}
              >
                <option value="">Select reporter</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {getEmployeeLabel(emp)}
                  </option>
                ))}
              </LocalSelect>
            </div>

            <div>
              <label className="font-semibold text-base-content/80 mb-1 block">
                Assigned investigator <span className="text-error">*</span>
              </label>
              <LocalSelect
                {...register("investigatorEmployeeId", { required: true })}
              >
                <option value="">Select investigator</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {getEmployeeLabel(emp)}
                  </option>
                ))}
              </LocalSelect>
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-base-content/80 mb-1 block">
                Description of incident <span className="text-error">*</span>
              </label>
              <textarea
                {...register("description", { required: true })}
                rows={3}
                placeholder="Specific facts, dates, impacted personnel, or policy sections breached..."
                className="textarea textarea-bordered w-full rounded-xl bg-base-200/80"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-base-content/80 mb-1 block">
                Witnesses (optional)
              </label>
              <input
                type="text"
                {...register("witnesses")}
                placeholder="Names, separated by commas"
                className="input input-bordered w-full rounded-xl bg-base-200/80"
              />
            </div>
          </div>
        </div>

        <div className="pt-1">
          <label className="label cursor-pointer justify-start gap-2.5 p-3 rounded-xl border border-base-200 bg-base-200/30 hover:bg-base-200/80 transition-colors">
            <input
              type="checkbox"
              {...register("confidentialityConfirmed", { required: true })}
              className="checkbox checkbox-sm checkbox-primary rounded"
            />
            <span className="text-sm text-base-content font-medium leading-tight">
              I confirm this case is confidential and the employee will be given
              the right to respond in accordance with HR policy.
            </span>
          </label>
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
            disabled={
              isSubmitting || employeesQuery.isLoading || missingOptions
            }
            className="btn btn-sm bg-primary text-white hover:bg-primary/90 rounded-xl px-5 gap-1.5 shadow-sm shadow-primary/20"
          >
            <Plus className="size-4" />
            <span>{isSubmitting ? "Opening..." : "Open case"}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
