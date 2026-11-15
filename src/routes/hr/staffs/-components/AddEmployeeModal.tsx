import { useState, useRef, useEffect } from "react";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import SimpleInput from "@/components/inputs/SimpleInput";
import LocalSelect from "@/components/inputs/LocalSelect";
import SimplePhoneInput from "@/components/inputs/SimplePhoneInput";
import {
  HR_DEPARTMENTS,
  HR_LOCATIONS,
  HR_EMPLOYMENT_TYPES,
  HR_STATUS_OPTIONS,
} from "./employeeData";
import type { Employee } from "./types";
import { toast } from "sonner";

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEmployee: (newEmployee: Employee) => void;
}

export default function AddEmployeeModal({
  isOpen,
  onClose,
  onAddEmployee,
}: AddEmployeeModalProps) {
  const modalRef = useRef<ModalHandle>(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dept: "Engineering",
    title: "",
    type: "Full-time",
    location: "Lagos",
    status: "Active",
    salary: 450000,
    grade: "G3",
    start: new Date().toISOString().slice(0, 10),
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.open();
    } else {
      modalRef.current?.close();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error("Please enter first and last name.");
      return;
    }
    if (!form.email.trim()) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!form.title.trim()) {
      toast.error("Please provide a job title.");
      return;
    }

    setIsSubmitting(true);
    try {
      const fullName = `${form.firstName.trim()} ${form.lastName.trim()}`;
      const randomId = `KNV-${Math.floor(1000 + Math.random() * 9000)}`;

      const newEmp: Employee = {
        id: randomId,
        name: fullName,
        email: form.email.trim(),
        phone: form.phone,
        title: form.title.trim(),
        dept: form.dept,
        location: form.location,
        type: form.type,
        status: form.status,
        onLeave: false,
        salary: Number(form.salary) || 0,
        grade: form.grade,
        start: form.start,
        birthday: "11-15",
      };

      onAddEmployee(newEmp);
      toast.success(`Employee ${fullName} has been added successfully.`);
      onClose();
      // Reset form
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        dept: "Engineering",
        title: "",
        type: "Full-time",
        location: "Lagos",
        status: "Active",
        salary: 450000,
        grade: "G3",
        start: new Date().toISOString().slice(0, 10),
      });
    } catch (_err) {
      toast.error("Failed to add employee.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal ref={modalRef} title="Add New Employee">
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {/* Name inputs */}
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

        {/* Contact inputs */}
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

        {/* Department and Job Title */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <LocalSelect
            label="Department"
            value={form.dept}
            onChange={(e) => setForm({ ...form, dept: e.target.value })}
          >
            {HR_DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </LocalSelect>

          <SimpleInput
            label="Job Title"
            placeholder="e.g. Senior Frontend Engineer"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>

        {/* Employment Type & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <LocalSelect
            label="Employment Type"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            {HR_EMPLOYMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </LocalSelect>

          <LocalSelect
            label="Work Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          >
            {HR_LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </LocalSelect>
        </div>

        {/* Status, Start Date, Salary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <LocalSelect
            label="Employment Status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            {HR_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </LocalSelect>

          <SimpleInput
            label="Start Date"
            type="date"
            value={form.start}
            onChange={(e) => setForm({ ...form, start: e.target.value })}
          />

          <SimpleInput
            label="Monthly Salary (₦)"
            type="number"
            min="0"
            value={form.salary}
            onChange={(e) =>
              setForm({ ...form, salary: Number(e.target.value) || 0 })
            }
          />
        </div>

        {/* Actions */}
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
