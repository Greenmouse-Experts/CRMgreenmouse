import { useRef, useEffect, useState } from "react";
import {
  FormProvider,
  useForm,
  Controller,
  type SubmitHandler,
} from "react-hook-form";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import SimpleInput from "@/components/inputs/SimpleInput";
import SimpleSelect from "@/components/inputs/SimpleSelect";
import LocalSelect from "@/components/inputs/LocalSelect";
import type { EmployeeRecord } from "@/api/employeesApi";
import RichTextEditor from "@/components/inputs/RichTextEditor";
import {
  HR_EMPLOYMENT_TYPES,
  HR_LOCATIONS,
  REASON_OPTIONS,
  CHANNEL_OPTIONS,
} from "./recruitmentData";
import type {
  CreateVacancyPayload,
  RecruitmentVacancy,
} from "@/api/recruitmentApi";
import { Save, Send } from "lucide-react";

interface Option {
  id: string;
  name: string;
}

interface CreateVacancyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateVacancy: (payload: CreateVacancyPayload) => Promise<any> | void;
  onUpdateVacancy?: (
    id: string,
    payload: Partial<CreateVacancyPayload>,
  ) => Promise<any> | void;
  initialVacancy?: RecruitmentVacancy | null;
  departments?: Option[];
  approvers?: Option[];
  managers?: Option[];
}

interface VacancyFormValues {
  jobTitle: string;
  departmentId: string;
  openings: number;
  employmentType: string;
  workLocation: string;
  reasonForHire: string;
  salaryMinimum: string;
  salaryMaximum: string;
  salaryCurrency: string;
  salaryPeriod: "hourly" | "weekly" | "monthly" | "annual";
  jobDescription: string;
  closingDate: string;
  hiringManagerId: string;
  approverId: string;
  publishingChannel: string;
  saveAsDraft: boolean;
}

const SALARY_PERIODS = ["hourly", "weekly", "monthly", "annual"] as const;

const emptyForm = (
  departments: Option[],
  approvers: Option[],
  managers: Option[],
  initialVacancy?: RecruitmentVacancy | null,
): VacancyFormValues => {
  if (initialVacancy) {
    const rawPeriod = String(
      initialVacancy.salaryPeriod ?? "monthly",
    ).toLowerCase();
    const salaryPeriod = (SALARY_PERIODS as readonly string[]).includes(
      rawPeriod,
    )
      ? (rawPeriod as VacancyFormValues["salaryPeriod"])
      : "monthly";

    return {
      jobTitle: initialVacancy.jobTitle ?? initialVacancy.title ?? "",
      departmentId: initialVacancy.departmentId ?? departments[0]?.id ?? "",
      openings: initialVacancy.openings ?? 1,
      employmentType:
        initialVacancy.employmentType ?? HR_EMPLOYMENT_TYPES[0] ?? "Full-time",
      workLocation:
        initialVacancy.workLocation ??
        initialVacancy.location ??
        HR_LOCATIONS[0] ??
        "Lagos",
      reasonForHire:
        initialVacancy.reasonForHire ?? REASON_OPTIONS[0] ?? "New position",
      salaryMinimum:
        initialVacancy.salaryMinimum != null
          ? String(initialVacancy.salaryMinimum)
          : "",
      salaryMaximum:
        initialVacancy.salaryMaximum != null
          ? String(initialVacancy.salaryMaximum)
          : "",
      salaryCurrency: initialVacancy.salaryCurrency || "NGN",
      salaryPeriod,
      jobDescription: initialVacancy.jobDescription ?? "",
      closingDate: initialVacancy.closingDate
        ? String(initialVacancy.closingDate).slice(0, 10)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .slice(0, 10),
      hiringManagerId: initialVacancy.hiringManagerId ?? managers[0]?.id ?? "",
      approverId: initialVacancy.approverId ?? approvers[0]?.id ?? "",
      publishingChannel:
        initialVacancy.publishingChannel ??
        CHANNEL_OPTIONS[0] ??
        "Careers page",
      saveAsDraft:
        String(initialVacancy.status ?? "").toLowerCase() === "draft",
    };
  }

  return {
    jobTitle: "",
    departmentId: departments[0]?.id ?? "",
    openings: 1,
    employmentType: HR_EMPLOYMENT_TYPES[0] ?? "Full-time",
    workLocation: HR_LOCATIONS[0] ?? "Lagos",
    reasonForHire: REASON_OPTIONS[0] ?? "New position",
    salaryMinimum: "",
    salaryMaximum: "",
    salaryCurrency: "NGN",
    salaryPeriod: "monthly",
    jobDescription: "",
    closingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10),
    hiringManagerId: managers[0]?.id ?? "",
    approverId: approvers[0]?.id ?? "",
    publishingChannel: CHANNEL_OPTIONS[0] ?? "Careers page",
    saveAsDraft: false,
  };
};

export default function CreateVacancyModal({
  isOpen,
  onClose,
  onCreateVacancy,
  onUpdateVacancy,
  initialVacancy = null,
  departments = [],
  approvers = [],
  managers,
}: CreateVacancyModalProps) {
  const modalRef = useRef<ModalHandle>(null);
  const managerChoices = managers && managers.length > 0 ? managers : approvers;
  const isEditing = Boolean(initialVacancy?.id);

  const [activeTab, setActiveTab] = useState<"requisition" | "advert">(
    "requisition",
  );

  const methods = useForm<VacancyFormValues>({
    mode: "onSubmit",
    defaultValues: emptyForm(
      departments,
      approvers,
      managerChoices,
      initialVacancy,
    ),
  });
  const {
    register,
    handleSubmit,
    control,
    reset,
    trigger,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.open();
      reset(emptyForm(departments, approvers, managerChoices, initialVacancy));
      setActiveTab("requisition");
    } else {
      modalRef.current?.close();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialVacancy?.id]);

  const setupIncomplete =
    departments.length === 0 ||
    approvers.length === 0 ||
    managerChoices.length === 0;

  const handleNext = async () => {
    const valid = await trigger([
      "jobTitle",
      "departmentId",
      "openings",
      "employmentType",
      "reasonForHire",
    ]);
    if (valid) setActiveTab("advert");
  };

  const onSubmit: SubmitHandler<VacancyFormValues> = async (values) => {
    const payload: CreateVacancyPayload = {
      jobTitle: values.jobTitle.trim(),
      departmentId: values.departmentId,
      openings: Number(values.openings),
      employmentType: values.employmentType,
      reasonForHire: values.reasonForHire,
      jobDescription: values.jobDescription,
      closingDate: values.closingDate,
      hiringManagerId: values.hiringManagerId,
      approverId: values.approverId,
      salaryPeriod: values.salaryPeriod,
      ...(isEditing ? {} : { saveAsDraft: values.saveAsDraft }),
      ...(values.workLocation ? { workLocation: values.workLocation } : {}),
      ...(values.salaryMinimum !== ""
        ? { salaryMinimum: Number(values.salaryMinimum) }
        : {}),
      ...(values.salaryMaximum !== ""
        ? { salaryMaximum: Number(values.salaryMaximum) }
        : {}),
      ...(values.salaryCurrency
        ? { salaryCurrency: values.salaryCurrency }
        : {}),
      ...(values.publishingChannel
        ? { publishingChannel: values.publishingChannel }
        : {}),
    };

    try {
      if (isEditing && initialVacancy && onUpdateVacancy) {
        await onUpdateVacancy(initialVacancy.id, payload);
      } else {
        await onCreateVacancy(payload);
      }
      reset(emptyForm(departments, approvers, managerChoices, null));
      setActiveTab("requisition");
      onClose();
    } catch {
      // Kept open on failure so inputs are preserved
    }
  };

  return (
    <Modal
      ref={modalRef}
      title={isEditing ? "Edit Vacancy" : "Create Vacancy"}
      maxWidth="max-w-2xl"
      onClose={onClose}
    >
      <FormProvider {...methods}>
        <div className="space-y-4">
          {/* Stepper Tabs & description */}
          <div className="flex flex-col gap-3 -mt-1 pb-3 border-b border-base-200">
            <p className="text-base-content/80">
              {isEditing
                ? "Update requisition details, compensation range, or hiring owners."
                : "Raise a requisition. It goes to the approver before it can be published."}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("requisition")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activeTab === "requisition"
                    ? "bg-primary text-white shadow-xs"
                    : "bg-base-200 text-base-content/80 hover:bg-base-300"
                }`}
              >
                1. Requisition Details
              </button>
              <button
                type="button"
                onClick={handleNext}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activeTab === "advert"
                    ? "bg-primary text-white shadow-xs"
                    : "bg-base-200 text-base-content/80 hover:bg-base-300"
                }`}
              >
                2. Advert & Approval
              </button>
            </div>
          </div>

          {setupIncomplete && (
            <p className="rounded-xl bg-warning/10 border border-warning/30 px-4 py-3 text-sm text-base-content/80">
              Recruitment setup is incomplete — departments, approvers and
              hiring managers must exist before a vacancy can be saved.
            </p>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {activeTab === "requisition" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="font-semibold text-base-content/80 mb-1 block">
                      Job title <span className="text-error">*</span>
                    </label>
                    <SimpleInput
                      placeholder="e.g. Senior Backend Engineer"
                      {...register("jobTitle", {
                        required: "Please provide a vacancy job title",
                        maxLength: {
                          value: 160,
                          message: "Title must be 160 characters or fewer",
                        },
                      })}
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-base-content/80 mb-1 block">
                      Department <span className="text-error">*</span>
                    </label>
                    <LocalSelect
                      {...register("departmentId", {
                        required: "Please select a department",
                      })}
                    >
                      <option value="">Select department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </LocalSelect>
                  </div>

                  <div>
                    <label className="font-semibold text-base-content/80 mb-1 block">
                      Number of openings <span className="text-error">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      {...register("openings", {
                        required: "Please provide the number of openings",
                        valueAsNumber: true,
                        min: { value: 1, message: "At least 1 opening" },
                        max: { value: 1000, message: "At most 1000 openings" },
                        validate: (v) =>
                          Number.isInteger(Number(v)) ||
                          "Openings must be a whole number",
                      })}
                      className="input input-bordered w-full rounded-xl bg-base-200/80"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-base-content/80 mb-1 block">
                      Employment type <span className="text-error">*</span>
                    </label>
                    <LocalSelect
                      {...register("employmentType", {
                        required: "Please select an employment type",
                        maxLength: {
                          value: 80,
                          message: "Must be 80 characters or fewer",
                        },
                      })}
                    >
                      {HR_EMPLOYMENT_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </LocalSelect>
                  </div>

                  <div>
                    <label className="font-semibold text-base-content/80 mb-1 block">
                      Work location
                    </label>
                    <LocalSelect {...register("workLocation")}>
                      {HR_LOCATIONS.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </LocalSelect>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-semibold text-base-content/80 mb-1 block">
                      Reason for hiring <span className="text-error">*</span>
                    </label>
                    <LocalSelect
                      {...register("reasonForHire", {
                        required: "Please select a reason for hiring",
                        maxLength: {
                          value: 120,
                          message: "Must be 120 characters or fewer",
                        },
                      })}
                    >
                      {REASON_OPTIONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </LocalSelect>
                  </div>

                  <div>
                    <label className="font-semibold text-base-content/80 mb-1 block">
                      Salary minimum
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 1200000"
                      {...register("salaryMinimum", {
                        validate: (v) =>
                          v === "" || Number(v) >= 0 || "Cannot be negative",
                      })}
                      className="input input-bordered w-full rounded-xl bg-base-200/80"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-base-content/80 mb-1 block">
                      Salary maximum
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 1600000"
                      {...register("salaryMaximum", {
                        validate: (v) =>
                          v === "" || Number(v) >= 0 || "Cannot be negative",
                      })}
                      className="input input-bordered w-full rounded-xl bg-base-200/80"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-base-content/80 mb-1 block">
                      Currency
                    </label>
                    <SimpleInput
                      placeholder="NGN"
                      {...register("salaryCurrency")}
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-base-content/80 mb-1 block">
                      Salary period
                    </label>
                    <LocalSelect {...register("salaryPeriod")}>
                      {SALARY_PERIODS.map((p) => (
                        <option key={p} value={p}>
                          {p.charAt(0).toUpperCase() + p.slice(1)}
                        </option>
                      ))}
                    </LocalSelect>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-base-200">
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn btn-sm btn-ghost rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="btn btn-sm bg-primary text-white hover:bg-primary/90 rounded-xl px-5"
                  >
                    Next: Advert & Approval →
                  </button>
                </div>
              </div>
            )}

            {activeTab === "advert" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <Controller
                  name="jobDescription"
                  control={control}
                  rules={{
                    validate: (v) =>
                      Boolean(v && v.replace(/<[^>]*>/g, "").trim()) ||
                      "Please provide a job description",
                  }}
                  render={({ field, fieldState }) => (
                    <div>
                      <RichTextEditor
                        label="Job description & key requirements *"
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Outline responsibilities, must-have skills, qualifications, and team fit..."
                        minHeight="min-h-[140px]"
                      />
                      {fieldState.error && (
                        <p className="text-error text-xs mt-1">
                          {fieldState.error.message}
                        </p>
                      )}
                    </div>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-base-content/80 mb-1 block">
                      Application deadline <span className="text-error">*</span>
                    </label>
                    <input
                      type="date"
                      {...register("closingDate", {
                        required: "Please set an application deadline",
                      })}
                      className="input input-bordered w-full rounded-xl bg-base-200/80"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-base-content/80 mb-1 block">
                      Hiring manager <span className="text-error">*</span>
                    </label>
                    <Controller
                      control={methods.control}
                      name="hiringManagerId"
                      rules={{ required: "Please select a hiring manager" }}
                      render={({ field }) => (
                        <SimpleSelect<EmployeeRecord>
                          route="/employees"
                          value={field.value}
                          onChange={field.onChange}
                          label="Hiring manager *"
                          render={(employee, index) => {
                            const name =
                              [employee.firstName, employee.lastName]
                                .filter(Boolean)
                                .join(" ") ||
                              employee.email ||
                              "Unnamed";
                            return (
                              <>
                                {index === 0 && (
                                  <option value="">
                                    Select hiring manager
                                  </option>
                                )}
                                <option key={employee.id} value={employee.id}>
                                  {name}
                                </option>
                              </>
                            );
                          }}
                        />
                      )}
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-base-content/80 mb-1 block">
                      Approver (HR Lead / VP){" "}
                      <span className="text-error">*</span>
                    </label>
                    <LocalSelect
                      {...register("approverId", {
                        required: "Please select an approver",
                      })}
                    >
                      <option value="">Select approver</option>
                      {approvers.map((app) => (
                        <option key={app.id} value={app.id}>
                          {app.name}
                        </option>
                      ))}
                    </LocalSelect>
                  </div>

                  <div>
                    <label className="font-semibold text-base-content/80 mb-1 block">
                      Publication channel
                    </label>
                    <LocalSelect {...register("publishingChannel")}>
                      {CHANNEL_OPTIONS.map((ch) => (
                        <option key={ch} value={ch}>
                          {ch}
                        </option>
                      ))}
                    </LocalSelect>
                  </div>

                  {!isEditing && (
                    <div className="sm:col-span-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          {...register("saveAsDraft")}
                          className="checkbox checkbox-sm checkbox-primary"
                        />
                        <span className="text-sm font-medium text-base-content/80">
                          Save as draft (skip submission for approval)
                        </span>
                      </label>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-base-200">
                  <button
                    type="button"
                    onClick={() => setActiveTab("requisition")}
                    className="btn btn-sm btn-ghost rounded-xl"
                  >
                    ← Back to Requisition
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="btn btn-sm btn-outline rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || setupIncomplete}
                      className="btn btn-sm bg-primary text-white hover:bg-primary/90 rounded-xl px-5 gap-1.5 shadow-sm shadow-primary/20"
                    >
                      {isSubmitting ? (
                        <span className="loading loading-spinner loading-xs" />
                      ) : isEditing ? (
                        <Save className="size-3.5" />
                      ) : (
                        <Send className="size-3.5" />
                      )}
                      <span>
                        {isSubmitting
                          ? isEditing
                            ? "Saving..."
                            : "Submitting..."
                          : isEditing
                            ? "Save changes"
                            : "Submit requisition"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </FormProvider>
    </Modal>
  );
}
