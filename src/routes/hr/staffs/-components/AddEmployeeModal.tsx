import { useEffect, useMemo, useRef, useState } from "react";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import SimpleInput from "@/components/inputs/SimpleInput";
import SimplePhoneInput from "@/components/inputs/SimplePhoneInput";
import LocalSelect from "@/components/inputs/LocalSelect";
import { useEmployeeOrganization } from "@/api/employeesApi";
import type { CreateEmployeeInput } from "@/api/employeesApi";
import { HR_EMPLOYMENT_TYPES } from "./employeeData";
import { toast } from "sonner";

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEmployee: (payload: CreateEmployeeInput) => Promise<void>;
}

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  departmentId: "",
  positionId: "",
  employmentType: "Full-time",
  startDate: "",
};

export default function AddEmployeeModal({
  isOpen,
  onClose,
  onAddEmployee,
}: AddEmployeeModalProps) {
  const modalRef = useRef<ModalHandle>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const organization = useEmployeeOrganization();
  const departments = useMemo(
    () => organization.data?.departments ?? [],
    [organization.data],
  );
  const positions = useMemo(
    () => organization.data?.positions ?? [],
    [organization.data],
  );

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
      await onAddEmployee({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phoneNumber: form.phone.trim(),
        departmentId: form.departmentId || undefined,
        positionId: form.positionId || undefined,
        employmentType: form.employmentType,
        startDate: form.startDate || undefined,
      });
      setForm(EMPTY_FORM);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal ref={modalRef} title="Add New Employee" maxWidth="max-w-xl">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label text-xs font-semibold text-base-content/70 pb-1">
              Department
            </label>
            <LocalSelect
              value={form.departmentId}
              onChange={(e) =>
                setForm({ ...form, departmentId: e.target.value })
              }
            >
              <option value="">Unassigned</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </LocalSelect>
          </div>

          <div>
            <label className="label text-xs font-semibold text-base-content/70 pb-1">
              Position
            </label>
            <LocalSelect
              value={form.positionId}
              onChange={(e) => setForm({ ...form, positionId: e.target.value })}
            >
              <option value="">Unassigned</option>
              {positions.map((position) => (
                <option key={position.id} value={position.id}>
                  {position.name}
                </option>
              ))}
            </LocalSelect>
          </div>

          <div>
            <label className="label text-xs font-semibold text-base-content/70 pb-1">
              Employment type
            </label>
            <LocalSelect
              value={form.employmentType}
              onChange={(e) =>
                setForm({ ...form, employmentType: e.target.value })
              }
            >
              {HR_EMPLOYMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </LocalSelect>
          </div>

          <div>
            <label className="label text-xs font-semibold text-base-content/70 pb-1">
              Start date
            </label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="input input-md input-bordered w-full text-sm rounded-lg"
            />
          </div>
        </div>

        <p className="text-xs text-base-content/60">
          Compensation and contract terms are set from the employee record after
          creation.
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
