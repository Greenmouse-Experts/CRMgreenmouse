import { useEffect, useRef } from "react";
import { FormProvider, useForm, type SubmitHandler } from "react-hook-form";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import SimpleInput from "@/components/inputs/SimpleInput";
import LocalSelect from "@/components/inputs/LocalSelect";
import { GRADE_OPTIONS } from "./organizationData";
import type { Department, Position } from "./types";
import { toast } from "sonner";
import { Send } from "lucide-react";

interface AddPositionFormValues {
  title: string;
  dept: string;
  grade: string;
  approved: string;
  filled: string;
}

const emptyForm = (departments: Department[]): AddPositionFormValues => ({
  title: "",
  dept: departments[0]?.name || "Engineering",
  grade: "G3",
  approved: "5",
  filled: "0",
});

interface AddPositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPosition: (newPos: Position) => void;
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
  }, [isOpen]);

  const onSubmit: SubmitHandler<AddPositionFormValues> = (values) => {
    const newPos: Position = {
      id: `POS-${Date.now()}`,
      title: values.title.trim(),
      dept: values.dept,
      grade: values.grade,
      approved: Number(values.approved) || 1,
      filled: Number(values.filled) || 0,
    };

    onAddPosition(newPos);
    toast.success("Position created", {
      description: `${newPos.title} (${newPos.grade}) added to ${newPos.dept}.`,
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
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <p className="text-xs text-base-content/60 -mt-1 mb-3">
            Define a standardized role, department, pay grade, and target
            approved headcount.
          </p>

          <div>
            <label className="text-xs font-semibold text-base-content/80 mb-1 block">
              Position title <span className="text-error">*</span>
            </label>
            <SimpleInput
              placeholder="e.g. Senior Product Designer"
              required
              {...methods.register("title", {
                required: "Please provide a position title",
              })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-base-content/80 mb-1 block">
                Department
              </label>
              <LocalSelect {...methods.register("dept")}>
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </LocalSelect>
            </div>

            <div>
              <label className="text-xs font-semibold text-base-content/80 mb-1 block">
                Job grade
              </label>
              <LocalSelect {...methods.register("grade")}>
                {GRADE_OPTIONS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </LocalSelect>
            </div>

            <div>
              <label className="text-xs font-semibold text-base-content/80 mb-1 block">
                Approved headcount
              </label>
              <input
                type="number"
                min="1"
                required
                {...methods.register("approved", {
                  required: "Please provide the approved headcount",
                  valueAsNumber: true,
                  validate: (v) =>
                    Number(v) >= 1 || "Approved headcount must be at least 1",
                })}
                className="input input-bordered w-full text-xs rounded-xl bg-base-200/50"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-base-content/80 mb-1 block">
                Currently filled
              </label>
              <input
                type="number"
                min="0"
                {...methods.register("filled", { valueAsNumber: true })}
                className="input input-bordered w-full text-xs rounded-xl bg-base-200/50"
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
              disabled={methods.formState.isSubmitting}
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
