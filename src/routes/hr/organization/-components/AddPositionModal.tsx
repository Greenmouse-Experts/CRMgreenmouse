import { useEffect, useRef } from "react";
import { FormProvider, useForm, type SubmitHandler } from "react-hook-form";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import SimpleInput from "@/components/inputs/SimpleInput";
import LocalSelect from "@/components/inputs/LocalSelect";
import type { Department } from "./types";
import type { CreatePositionPayload } from "@/api/organizationApi";
import { Send } from "lucide-react";

interface AddPositionFormValues {
  title: string;
  departmentId: string;
  approvedHeadcount: string;
  status: "active" | "inactive";
}

const emptyForm = (departments: Department[]): AddPositionFormValues => ({
  title: "",
  departmentId: departments[0]?.id ?? "",
  approvedHeadcount: "1",
  status: "active",
});

interface AddPositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPosition: (payload: CreatePositionPayload) => void;
  departments: Department[];
}

export default function AddPositionModal({
  isOpen,
  onClose,
  onAddPosition,
  departments,
}: AddPositionModalProps) {
  const modalRef = useRef<ModalHandle>(null);
  const methods = useForm<AddPositionFormValues>({
    mode: "onSubmit",
    defaultValues: emptyForm(departments),
  });

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.open();
      methods.reset(emptyForm(departments));
    } else {
      modalRef.current?.close();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const onSubmit: SubmitHandler<AddPositionFormValues> = (values) => {
    onAddPosition({
      title: values.title.trim(),
      departmentId: values.departmentId,
      approvedHeadcount: Number(values.approvedHeadcount) || 0,
      status: values.status,
    });
    methods.reset(emptyForm(departments));
    onClose();
  };

  return (
    <Modal
      ref={modalRef}
      title="Add Job Position"
      maxWidth="max-w-xl"
      onClose={onClose}
    >
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
          <p className="text-base-content/80 -mt-1 mb-3">
            Define a role within a department and its approved headcount.
          </p>

          {departments.length === 0 && (
            <p className="rounded-xl bg-warning/10 border border-warning/30 px-4 py-3 text-sm text-base-content/80">
              No departments exist yet. Create a department first — positions
              must be attached to one.
            </p>
          )}

          <div>
            <label className="font-semibold text-base-content/80 mb-1 block">
              Position title <span className="text-error">*</span>
            </label>
            <SimpleInput
              placeholder="e.g. Senior Product Designer"
              {...methods.register("title", {
                required: "Please provide a position title",
                maxLength: {
                  value: 160,
                  message: "Title must be 160 characters or fewer",
                },
              })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-base-content/80 mb-1 block">
                Department <span className="text-error">*</span>
              </label>
              <LocalSelect
                {...methods.register("departmentId", {
                  required: "Please select a department",
                })}
              >
                <option value="">Select department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </LocalSelect>
            </div>

            <div>
              <label className="font-semibold text-base-content/80 mb-1 block">
                Status
              </label>
              <LocalSelect {...methods.register("status")}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </LocalSelect>
            </div>

            <div>
              <label className="font-semibold text-base-content/80 mb-1 block">
                Approved headcount
              </label>
              <input
                type="number"
                min="0"
                {...methods.register("approvedHeadcount", {
                  valueAsNumber: true,
                  validate: (v) =>
                    Number(v) >= 0 || "Headcount cannot be negative",
                })}
                className="input input-bordered w-full rounded-xl bg-base-200/80"
              />
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
              disabled={
                methods.formState.isSubmitting || departments.length === 0
              }
              className="btn btn-sm bg-primary text-white hover:bg-primary/90 rounded-xl px-5 gap-1.5 shadow-sm shadow-primary/20"
            >
              <Send className="size-3.5" />
              <span>Create position</span>
            </button>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
}
