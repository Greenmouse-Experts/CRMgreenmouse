import { useState, useRef, useEffect } from "react";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import SimpleInput from "@/components/inputs/SimpleInput";
import SimplePhoneInput from "@/components/inputs/SimplePhoneInput";
import type { CreateStaffInput } from "./types";
import { toast } from "sonner";

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStaff: (staff: CreateStaffInput) => Promise<void>;
}

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
};

export default function AddEmployeeModal({
  isOpen,
  onClose,
  onAddStaff,
}: AddEmployeeModalProps) {
  const modalRef = useRef<ModalHandle>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.open();
    } else {
      modalRef.current?.close();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error("Please enter first and last name.");
      return;
    }
    if (!form.email.trim()) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!form.phone.trim()) {
      toast.error("Please enter a phone number.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddStaff({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phoneNumber: form.phone.trim(),
      });
      setForm(EMPTY_FORM);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal ref={modalRef} title="Add New Employee">
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SimpleInput
            label="First Name"
            placeholder="e.g. Chinedu"
            required
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          />
          <SimpleInput
            label="Last Name"
            placeholder="e.g. Okeke"
            required
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SimpleInput
            label="Work Email"
            type="email"
            placeholder="chinedu.okeke@kinovia.com"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <div>
            <label className="label text-xs font-semibold text-base-content/70 pb-1">
              Phone Number
            </label>
            <SimplePhoneInput
              value={form.phone}
              onChange={(val) => setForm({ ...form, phone: val })}
              placeholder="+234 800 000 0000"
            />
          </div>
        </div>

        <p className="text-xs text-base-content/60">
          Department, job title, grade and salary are managed under employee
          records once the staff profile is created.
        </p>

        <div className="flex justify-end gap-2 pt-4 border-t border-base-200">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm btn-ghost text-xs"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-sm btn-primary text-xs"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Adding..." : "Add Employee"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
