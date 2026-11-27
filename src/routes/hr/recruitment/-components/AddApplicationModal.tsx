import { useEffect, useRef } from "react";
import { FormProvider, useForm } from "react-hook-form";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import SimpleInput from "@/components/inputs/SimpleInput";
import LocalSelect from "@/components/inputs/LocalSelect";
import type { CreateApplicationPayload } from "@/api/recruitmentApi";
import { UserPlus } from "lucide-react";

interface AddApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  vacancyTitle?: string;
  onSubmitApplication: (payload: CreateApplicationPayload) => Promise<any>;
  isPending?: boolean;
}

interface ApplicationFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  source: string;
  resumeUrl: string;
}

const SOURCES = ["Careers page", "LinkedIn", "Referral", "Agency", "Direct"];

const DEFAULT_VALUES: ApplicationFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  source: "Careers page",
  resumeUrl: "",
};

export default function AddApplicationModal({
  isOpen,
  onClose,
  vacancyTitle,
  onSubmitApplication,
  isPending = false,
}: AddApplicationModalProps) {
  const modalRef = useRef<ModalHandle>(null);
  const methods = useForm<ApplicationFormValues>({
    mode: "onSubmit",
    defaultValues: DEFAULT_VALUES,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (isOpen) {
      reset(DEFAULT_VALUES);
      modalRef.current?.open();
    } else {
      modalRef.current?.close();
    }
  }, [isOpen, reset]);

  const busy = isPending || isSubmitting;

  const onSubmit = async (values: ApplicationFormValues) => {
    try {
      await onSubmitApplication({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        ...(values.phone.trim() ? { phone: values.phone.trim() } : {}),
        ...(values.source ? { source: values.source } : {}),
        ...(values.resumeUrl.trim()
          ? { resumeUrl: values.resumeUrl.trim() }
          : {}),
      });
      reset(DEFAULT_VALUES);
      onClose();
    } catch {
      // keep form open on error
    }
  };

  return (
    <Modal
      ref={modalRef}
      title={
        <div className="flex items-center gap-2">
          <UserPlus className="size-4 text-primary" />
          <span>Add Candidate Application</span>
        </div>
      }
      maxWidth="max-w-lg"
      onClose={onClose}
    >
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {vacancyTitle && (
            <p className="text-sm text-base-content/80 rounded-xl bg-base-200/50 border border-base-200 px-3.5 py-2.5">
              Applying for: <strong className="text-base-content">{vacancyTitle}</strong>
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SimpleInput
              label="First name"
              required
              placeholder="e.g. Ada"
              disabled={busy}
              {...register("firstName", {
                required: "First name is required",
              })}
            />
            <SimpleInput
              label="Last name"
              required
              placeholder="e.g. Lovelace"
              disabled={busy}
              {...register("lastName", {
                required: "Last name is required",
              })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SimpleInput
              label="Email"
              type="email"
              required
              placeholder="candidate@example.com"
              disabled={busy}
              {...register("email", {
                required: "Email is required",
              })}
            />
            <SimpleInput
              label="Phone (optional)"
              placeholder="+2348012345678"
              disabled={busy}
              {...register("phone")}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <LocalSelect label="Source" disabled={busy} {...register("source")}>
              {SOURCES.map((src) => (
                <option key={src} value={src}>
                  {src}
                </option>
              ))}
            </LocalSelect>
            <SimpleInput
              label="Resume URL (optional)"
              type="url"
              placeholder="https://..."
              disabled={busy}
              {...register("resumeUrl")}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-base-200">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="btn btn-sm btn-ghost rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="btn btn-sm bg-primary text-white hover:bg-primary/90 border-0 rounded-xl px-5 gap-1.5"
            >
              {busy ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                <UserPlus className="size-3.5" />
              )}
              <span>{busy ? "Adding..." : "Add application"}</span>
            </button>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
}
