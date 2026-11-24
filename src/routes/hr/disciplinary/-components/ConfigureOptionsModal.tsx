import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import {
  useConfigureDisciplinaryOptions,
  type DisciplinaryOptions,
} from "@/api/disciplinaryApi";
import { extract_message } from "@/helpers/errors";
import { toast } from "sonner";
import { Settings, Save } from "lucide-react";

interface ConfigureOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  options: DisciplinaryOptions;
}

interface OptionsFormValues {
  categoriesText: string;
  severitiesText: string;
}

export default function ConfigureOptionsModal({
  isOpen,
  onClose,
  options,
}: ConfigureOptionsModalProps) {
  const modalRef = useRef<ModalHandle>(null);
  const configureMutation = useConfigureDisciplinaryOptions();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<OptionsFormValues>({
    defaultValues: {
      categoriesText: options.categories.join(", "),
      severitiesText: options.severities.join(", "),
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        categoriesText: options.categories.join(", "),
        severitiesText: options.severities.join(", "),
      });
      modalRef.current?.open();
    } else {
      modalRef.current?.close();
    }
  }, [isOpen, options.categories, options.severities, reset]);

  const parseList = (raw: string) =>
    raw
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  const onSubmit = async (values: OptionsFormValues) => {
    const categories = parseList(values.categoriesText);
    const severities = parseList(values.severitiesText);

    if (categories.length === 0 || severities.length === 0) {
      toast.error("Provide at least one category and one severity level.");
      return;
    }

    try {
      await configureMutation.mutateAsync({ categories, severities });
      toast.success("Disciplinary options updated");
      onClose();
    } catch (error) {
      toast.error(extract_message(error as any));
    }
  };

  return (
    <Modal
      ref={modalRef}
      title="Configure Disciplinary Options"
      maxWidth="max-w-lg"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <p className="text-sm text-base-content/80 -mt-1">
          Manage the available case categories and severity levels for this
          organization. Separate values with commas.
        </p>

        <div className="space-y-3">
          <div>
            <label className="font-semibold text-base-content/80 mb-1 flex items-center gap-1.5">
              <Settings className="size-4 text-primary" />
              <span>Categories</span>
            </label>
            <textarea
              {...register("categoriesText", { required: true })}
              rows={3}
              placeholder="Attendance, Policy breach, Misconduct, Performance, Harassment, Fraud"
              className="textarea textarea-bordered w-full rounded-xl bg-base-200/80"
            />
          </div>

          <div>
            <label className="font-semibold text-base-content/80 mb-1 block">
              Severities
            </label>
            <textarea
              {...register("severitiesText", { required: true })}
              rows={2}
              placeholder="Minor, Major, Gross misconduct"
              className="textarea textarea-bordered w-full rounded-xl bg-base-200/80"
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
            disabled={isSubmitting || configureMutation.isPending}
            className="btn btn-sm bg-primary text-white hover:bg-primary/90 rounded-xl px-5 gap-1.5 shadow-sm shadow-primary/20"
          >
            <Save className="size-4" />
            <span>
              {configureMutation.isPending ? "Saving..." : "Save options"}
            </span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
