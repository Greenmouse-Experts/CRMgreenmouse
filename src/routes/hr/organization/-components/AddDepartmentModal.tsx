import { useEffect, useRef } from "react";
import { FormProvider, useForm, type SubmitHandler } from "react-hook-form";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import SimpleInput from "@/components/inputs/SimpleInput";
import LocalSelect from "@/components/inputs/LocalSelect";
import { AVAILABLE_HEADS, LOCATION_OPTIONS } from "./organizationData";
import type { Department, DepartmentStatus } from "./types";
import { toast } from "sonner";
import { Send } from "lucide-react";

interface AddDepartmentFormValues {
  name: string;
  code: string;
  head: string;
  parent: string;
  costCentre: string;
  location: string;
  headcount: string;
  status: string;
  description: string;
}

const DEFAULT_VALUES: AddDepartmentFormValues = {
  name: "",
  code: "",
  head: AVAILABLE_HEADS[0] || "Tunde Adeyemi",
  parent: "None (top level)",
  costCentre: "",
  location: "Lagos",
  headcount: "10",
  status: "Active",
  description: "",
};

interface AddDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDepartment: (newDept: Department) => void;
  existingDepartments: Department[];
}

export default function AddDepartmentModal({
  isOpen,
  onClose,
  onAddDepartment,
  existingDepartments,
}: AddDepartmentModalProps) {
  const modalRef = useRef<ModalHandle>(null);
  const methods = useForm<AddDepartmentFormValues>({
    mode: "onSubmit",
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.open();
      methods.reset(DEFAULT_VALUES);
    } else {
      modalRef.current?.close();
    }
  }, [isOpen]);

  const onSubmit: SubmitHandler<AddDepartmentFormValues> = (values) => {
    const newDept: Department = {
      id: `DEP-${Date.now()}`,
      name: values.name.trim(),
      code: values.code.trim().toUpperCase(),
      head: values.head,
      count: Number(values.headcount) || 0,
      status: values.status as DepartmentStatus,
      parent: values.parent,
      costCentre: values.costCentre.trim() || undefined,
      location: values.location,
      description: values.description.trim() || undefined,
    };

    onAddDepartment(newDept);
    toast.success("Department created", {
      description: `${newDept.name} (${newDept.code}) with head ${newDept.head} has been registered.`,
    });

    methods.reset(DEFAULT_VALUES);
    onClose();
  };

  return (
    <Modal
      ref={modalRef}
      title="Add Department"
      maxWidth="max-w-2xl"
      onClose={onClose}
    >
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
          <p className=" text-base-content/80 -mt-1 mb-3">
            Create a department and assign its reporting head and operational
            details.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className=" font-semibold text-base-content/80 mb-1 block">
                Department name <span className="text-error">*</span>
              </label>
              <SimpleInput
                placeholder="e.g. Quality Assurance"
                required
                {...methods.register("name", {
                  required: "Please provide a department name",
                })}
              />
            </div>

            <div>
              <label className=" font-semibold text-base-content/80 mb-1 block">
                Department code <span className="text-error">*</span>
              </label>
              <SimpleInput
                placeholder="e.g. QA"
                required
                {...methods.register("code", {
                  required: "Please provide a unique department code",
                })}
              />
              <span className="text-[10px] text-base-content/80 mt-1 block">
                Must be unique (2-4 uppercase characters)
              </span>
            </div>

            <div>
              <label className=" font-semibold text-base-content/80 mb-1 block">
                Department Head <span className="text-error">*</span>
              </label>
              <LocalSelect {...methods.register("head")}>
                {AVAILABLE_HEADS.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </LocalSelect>
            </div>

            <div>
              <label className=" font-semibold text-base-content/80 mb-1 block">
                Parent department
              </label>
              <LocalSelect {...methods.register("parent")}>
                <option value="None (top level)">None (top level)</option>
                {existingDepartments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </LocalSelect>
            </div>

            <div>
              <label className=" font-semibold text-base-content/80 mb-1 block">
                Cost Centre code
              </label>
              <SimpleInput
                placeholder="e.g. CC-401"
                {...methods.register("costCentre")}
              />
            </div>

            <div>
              <label className=" font-semibold text-base-content/80 mb-1 block">
                Location
              </label>
              <LocalSelect {...methods.register("location")}>
                {LOCATION_OPTIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </LocalSelect>
            </div>

            <div>
              <label className=" font-semibold text-base-content/80 mb-1 block">
                Initial headcount
              </label>
              <input
                type="number"
                min="0"
                {...methods.register("headcount", {
                  valueAsNumber: true,
                })}
                className="input input-bordered w-full  rounded-xl bg-base-200/80"
              />
            </div>

            <div>
              <label className=" font-semibold text-base-content/80 mb-1 block">
                Status
              </label>
              <LocalSelect {...methods.register("status")}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </LocalSelect>
            </div>
          </div>

          <div>
            <label className=" font-semibold text-base-content/80 mb-1 block">
              Description
            </label>
            <textarea
              {...methods.register("description")}
              placeholder="Responsibilities, scope, and objectives of this department..."
              rows={3}
              className="textarea textarea-bordered w-full  rounded-xl bg-base-200/80"
            />
          </div>

          {/* Action Buttons */}
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
              disabled={methods.formState.isSubmitting}
              className="btn btn-sm bg-primary text-white hover:bg-primary/90 rounded-xl px-5 gap-1.5 shadow-sm shadow-primary/20"
            >
              <Send className="size-3.5" />
              <span>Create department</span>
            </button>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
}
