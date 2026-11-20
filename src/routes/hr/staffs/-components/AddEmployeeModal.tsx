import { useEffect, useRef } from "react";
import {
  Controller,
  FormProvider,
  useForm,
  type SubmitHandler,
} from "react-hook-form";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import SimpleInput from "@/components/inputs/SimpleInput";
import SimplePhoneInput from "@/components/inputs/SimplePhoneInput";
import type { CreateEmployeeInput } from "@/api/employeesApi";

interface AddEmployeeFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEmployee: (payload: CreateEmployeeInput) => Promise<void>;
}

export default function AddEmployeeModal({
  isOpen,
  onClose,
  onAddEmployee,
}: AddEmployeeModalProps) {
  const modalRef = useRef<ModalHandle>(null);
  const methods = useForm<AddEmployeeFormValues>({
    mode: "onSubmit",
    defaultValues: { firstName: "", lastName: "", email: "", phone: "" },
  });

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.open();
      methods.reset();
    } else {
      modalRef.current?.close();
    }
  }, [isOpen]);

  const onSubmit: SubmitHandler<AddEmployeeFormValues> = async (values) => {
    try {
      await onAddEmployee({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
      });
      methods.reset();
    } catch {
      // The parent toasts the error — nothing more to do here.
    }
  };

  return (
    <Modal ref={modalRef} title="Add New Employee" maxWidth="max-w-xl">
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className="space-y-4 pt-1"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SimpleInput
              label="First Name"
              placeholder="e.g. Chinedu"
              required
              {...methods.register("firstName", {
                required: "Please enter your first name.",
              })}
            />
            <SimpleInput
              label="Last Name"
              placeholder="e.g. Okeke"
              required
              {...methods.register("lastName", {
                required: "Please enter your last name.",
              })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SimpleInput
              label="Work Email"
              type="email"
              placeholder="chinedu.okeke@kinovia.com"
              required
              {...methods.register("email", {
                required: "Please enter a valid email address.",
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: "Please enter a valid email address.",
                },
              })}
            />
            <Controller
              name="phone"
              control={methods.control}
              rules={{ required: "Please enter a phone number." }}
              render={({ field, fieldState }) => (
                <SimplePhoneInput
                  label="Phone Number"
                  value={field.value ?? ""}
                  onChange={(_value, rawValue) =>
                    field.onChange(rawValue ?? "")
                  }
                  placeholder="+234 800 000 0000"
                  error={fieldState.error?.message}
                />
              )}
            />
          </div>

          <p className="text-xs text-base-content/60">
            Compensation and contract terms are set from the employee record
            after creation.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-sm btn-ghost rounded-lg text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={methods.formState.isSubmitting}
              className="btn btn-sm btn-primary rounded-lg text-xs"
            >
              {methods.formState.isSubmitting ? "Adding..." : "Add Employee"}
            </button>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
}
