import { useEffect, useRef } from "react";
import { FormProvider, useForm, type SubmitHandler } from "react-hook-form";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import SimpleInput from "@/components/inputs/SimpleInput";
import LocalSelect from "@/components/inputs/LocalSelect";
import type { Department } from "./types";
import { toast } from "sonner";
import { Save } from "lucide-react";

interface EditDepartmentFormValues {
  name: string;
  code: string;
  status: string;
}

const EDIT_DEFAULTS: EditDepartmentFormValues = {
  name: "",
  code: "",
  status: "Active",
};

interface EditDepartmentModalProps {
  isOpen: boolean;
  department: Department | null;
  onClose: () => void;
  onEditDepartment: (updated: {
    id: string;
    name: string;
    code: string;
    status: string;
  }) => void;
}

export default function EditDepartmentModal({
  isOpen,
  department,
  onClose,
  onEditDepartment,
}: EditDepartmentModalProps) {
  const modalRef = useRef<ModalHandle>(null);
  const methods = useForm<EditDepartmentFormValues>({
    mode: "onSubmit",
    defaultValues: EDIT_DEFAULTS,
  });

  useEffect(() => {
    if (isOpen && department) {
      modalRef.current?.open();
      methods.reset({
        name: department.name ?? "",
        code: department.code ?? "",
        status: department.status ?? "Active",
      });
    } else if (!isOpen) {
      modalRef.current?.close();
    }
  }, [isOpen, department]);

  const onSubmit: SubmitHandler<EditDepartmentFormValues> = (values) => {
    const id = department?.id;
    if (!id) return;

    const updated = {
      id,
      name: values.name.trim(),
      code: values.code.trim().toUpperCase(),
      status: values.status,
    };

    onEditDepartment(updated);
    toast.success("Department updated", {
      description: `${updated.name} (${updated.code}) has been updated.`,
    });

    methods.reset(EDIT_DEFAULTS);
    onClose();
  };

  return (
    <Modal
      ref={modalRef}
      title="Edit Department"
      maxWidth="max-w-2xl"
      onClose={onClose}
    >
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
          <p className=" text-base-content/80 -mt-1 mb-3">
            Update the department name, code and status.
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
                  required: "Please provide a department code",
                })}
              />
              <span className="text-[10px] text-base-content/80 mt-1 block">
                Must be unique (2-4 uppercase characters)
              </span>
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
              <Save className="size-3.5" />
              <span>Save changes</span>
            </button>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
}
