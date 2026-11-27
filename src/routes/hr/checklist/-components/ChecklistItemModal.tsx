import { useEffect, useMemo, useRef } from "react";
import { FormProvider, useForm } from "react-hook-form";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import SimpleInput from "@/components/inputs/SimpleInput";
import SimpleTextArea from "@/components/inputs/SimpleTextArea";
import {
  CHECKLIST_OWNER_OPTIONS,
  useCreateChecklistItem,
  useUpdateChecklistItem,
  type ChecklistActiveFlag,
  type ChecklistItemRecord,
} from "@/api/checklistApi";
import { extract_message } from "@/helpers/errors";
import { Plus, Save } from "lucide-react";
import { toast } from "sonner";
import { formatChecklistOwner } from "./checklistHelpers";

interface ChecklistItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialItem?: ChecklistItemRecord | null;
  defaultSortOrder?: number;
}

interface ChecklistFormValues {
  title: string;
  description: string;
  owner: string;
  sortOrder: string;
  isActive: ChecklistActiveFlag;
}

export default function ChecklistItemModal({
  isOpen,
  onClose,
  initialItem = null,
  defaultSortOrder = 0,
}: ChecklistItemModalProps) {
  const modalRef = useRef<ModalHandle>(null);
  const isEditing = Boolean(initialItem?.id);

  const createMutation = useCreateChecklistItem();
  const updateMutation = useUpdateChecklistItem();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const ownerOptions = useMemo(() => {
    const base: Array<{ value: string; label: string }> =
      CHECKLIST_OWNER_OPTIONS.map((opt) => ({
        value: opt.value,
        label: opt.label,
      }));
    const currentOwner = initialItem?.owner?.trim().toLowerCase();
    if (currentOwner && !base.some((opt) => opt.value === currentOwner)) {
      base.push({
        value: currentOwner,
        label: formatChecklistOwner(currentOwner),
      });
    }
    return base;
  }, [initialItem?.owner]);

  const methods = useForm<ChecklistFormValues>({
    mode: "onSubmit",
    defaultValues: {
      title: "",
      description: "",
      owner: "hr",
      sortOrder: String(defaultSortOrder),
      isActive: "Y",
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = methods;

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.open();
      reset({
        title: initialItem?.title ?? "",
        description: initialItem?.description ?? "",
        owner: initialItem?.owner || "hr",
        sortOrder: String(initialItem?.sortOrder ?? defaultSortOrder),
        isActive: initialItem?.isActive ?? "Y",
      });
    } else {
      modalRef.current?.close();
    }
  }, [isOpen, initialItem, defaultSortOrder, reset]);

  const onSubmit = async (values: ChecklistFormValues) => {
    if (isSubmitting) return;

    const title = values.title.trim();
    if (!title) {
      setError("title", { message: "Checklist title is required." });
      return;
    }

    const parsedOrder = Number(values.sortOrder);
    if (!Number.isFinite(parsedOrder) || parsedOrder < 0) {
      setError("sortOrder", {
        message: "Sort order must be 0 or a positive number.",
      });
      return;
    }

    try {
      if (isEditing && initialItem) {
        await toast
          .promise(
            updateMutation.mutateAsync({
              itemId: initialItem.id,
              title,
              description: values.description.trim(),
              owner: values.owner.trim().toLowerCase() || "hr",
              sortOrder: Math.floor(parsedOrder),
              isActive: values.isActive,
            }),
            {
              loading: "Updating checklist item...",
              success: "Checklist item updated",
              error: (error) => extract_message(error),
            },
          )
          .unwrap();
      } else {
        await toast
          .promise(
            createMutation.mutateAsync({
              title,
              description: values.description.trim(),
              owner: values.owner.trim().toLowerCase() || "hr",
              sortOrder: Math.floor(parsedOrder),
            }),
            {
              loading: "Creating checklist item...",
              success: "Checklist item created",
              error: (error) => extract_message(error),
            },
          )
          .unwrap();
      }

      onClose();
    } catch {
      // Error toast already surfaced by toast.promise
    }
  };

  return (
    <Modal
      ref={modalRef}
      title={isEditing ? "Edit Checklist Item" : "Create Checklist Item"}
      maxWidth="max-w-lg"
      onClose={onClose}
    >
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <SimpleInput
            label="Title"
            placeholder="e.g. Issue company laptop and VPN access"
            {...register("title", {
              required: "Checklist title is required.",
            })}
            disabled={isSubmitting}
          />

          <SimpleTextArea
            label="Description"
            rows={3}
            placeholder="Add clear instructions or completion notes for this checklist step..."
            {...register("description")}
            disabled={isSubmitting}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="w-full space-y-2">
              <div className="fieldset-label font-semibold">
                <span className="text-sm">Owner</span>
              </div>
              <select
                {...register("owner", { required: "Owner is required." })}
                disabled={isSubmitting}
                className="select select-bordered w-full rounded-xl"
              >
                {ownerOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.owner && (
                <p className="text-error text-sm mt-1">
                  {errors.owner.message}
                </p>
              )}
            </div>

            <SimpleInput
              label="Sort Order"
              type="number"
              min={0}
              step={1}
              placeholder="0"
              {...register("sortOrder")}
              disabled={isSubmitting}
            />
          </div>

          {isEditing && (
            <div className="w-full space-y-2">
              <div className="fieldset-label font-semibold">
                <span className="text-sm">Status</span>
              </div>
              <select
                {...register("isActive")}
                disabled={isSubmitting}
                className="select select-bordered w-full rounded-xl"
              >
                <option value="Y">Active (Y)</option>
                <option value="N">Inactive (N)</option>
              </select>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-base-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn btn-sm btn-ghost rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-sm bg-primary text-white hover:bg-primary/90 border-0 rounded-xl px-5 gap-1.5 shadow-sm shadow-primary/20"
            >
              {isEditing ? (
                <Save className="size-3.5" />
              ) : (
                <Plus className="size-3.5" />
              )}
              <span>
                {isSubmitting
                  ? isEditing
                    ? "Saving..."
                    : "Creating..."
                  : isEditing
                    ? "Save Changes"
                    : "Create Item"}
              </span>
            </button>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
}
