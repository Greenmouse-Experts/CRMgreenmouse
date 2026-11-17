import { useState, useRef, useEffect } from "react";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import SimpleInput from "@/components/inputs/SimpleInput";
import LocalSelect from "@/components/inputs/LocalSelect";
import { AVAILABLE_HEADS, LOCATION_OPTIONS } from "./organizationData";
import type { Department } from "./types";
import { toast } from "sonner";
import { Building2, Send } from "lucide-react";

interface AddDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDepartment: (newDept: Department) => void;
  existingDepartments: Department[];
}

export default function AddDepartmentModal({
  isOpen,
  onClose,
  onAddDepartment,
  existingDepartments,
}: AddDepartmentModalProps) {
  const modalRef = useRef<ModalHandle>(null);

  const [form, setForm] = useState({
    name: "",
    code: "",
    head: AVAILABLE_HEADS[0] || "Tunde Adeyemi",
    parent: "None (top level)",
    costCentre: "",
    location: "Lagos",
    headcount: 10,
    status: "Active" as const,
    description: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.open();
    } else {
      modalRef.current?.close();
    }
  }, [isOpen]);

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("Please provide a department name");
      return;
    }
    if (!form.code.trim()) {
      toast.error("Please provide a unique department code");
      return;
    }

    setIsSubmitting(true);

    try {
      const newDept: Department = {
        id: `DEP-${Date.now()}`,
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        head: form.head,
        count: Number(form.headcount) || 0,
        status: form.status,
        parent: form.parent,
        costCentre: form.costCentre.trim() || undefined,
        location: form.location,
        description: form.description.trim() || undefined,
      };

      onAddDepartment(newDept);
      toast.success("Department created", {
        description: `${newDept.name} (${newDept.code}) with head ${newDept.head} has been registered.`,
      });

      // Reset
      setForm({
        name: "",
        code: "",
        head: AVAILABLE_HEADS[0] || "Tunde Adeyemi",
        parent: "None (top level)",
        costCentre: "",
        location: "Lagos",
        headcount: 10,
        status: "Active",
        description: "",
      });
      onClose();
    } catch {
      toast.error("Failed to create department");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal ref={modalRef}>
      <div className="w-full max-w-xl bg-base-100 rounded-2xl shadow-xl overflow-hidden border border-base-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-5 border-b border-base-200">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-sm">
              <Building2 className="size-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-base-content">
                Add department
              </h3>
              <p className="text-xs text-base-content/60">
                Create a department and assign its head.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-base-content/80 mb-1 block">
                Department name <span className="text-error">*</span>
              </label>
              <SimpleInput
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="e.g. Quality Assurance"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-base-content/80 mb-1 block">
                Department code <span className="text-error">*</span>
              </label>
              <SimpleInput
                value={form.code}
                onChange={(e) => handleChange("code", e.target.value)}
                placeholder="e.g. QA"
                required
              />
              <span className="text-[10px] text-base-content/50 mt-1 block">
                Must be unique (2-4 uppercase characters)
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-base-content/80 mb-1 block">
                Department head <span className="text-error">*</span>
              </label>
              <LocalSelect
                value={form.head}
                onChange={(e) => handleChange("head", e.target.value)}
              >
                {AVAILABLE_HEADS.map((head) => (
                  <option key={head} value={head}>
                    {head}
                  </option>
                ))}
              </LocalSelect>
            </div>

            <div>
              <label className="text-xs font-semibold text-base-content/80 mb-1 block">
                Parent department
              </label>
              <LocalSelect
                value={form.parent}
                onChange={(e) => handleChange("parent", e.target.value)}
              >
                <option value="None (top level)">None (top level)</option>
                {existingDepartments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </LocalSelect>
            </div>

            <div>
              <label className="text-xs font-semibold text-base-content/80 mb-1 block">
                Cost centre
              </label>
              <SimpleInput
                value={form.costCentre}
                onChange={(e) => handleChange("costCentre", e.target.value)}
                placeholder="e.g. CC-108"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-base-content/80 mb-1 block">
                Primary location
              </label>
              <LocalSelect
                value={form.location}
                onChange={(e) => handleChange("location", e.target.value)}
              >
                {LOCATION_OPTIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </LocalSelect>
            </div>

            <div>
              <label className="text-xs font-semibold text-base-content/80 mb-1 block">
                Approved headcount
              </label>
              <SimpleInput
                type="number"
                value={String(form.headcount)}
                onChange={(e) =>
                  handleChange("headcount", Number(e.target.value) || 0)
                }
                min={0}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-base-content/80 mb-1 block">
                Status
              </label>
              <LocalSelect
                value={form.status}
                onChange={(e) => handleChange("status", e.target.value)}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </LocalSelect>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-base-content/80 mb-1 block">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Responsibilities, scope, and objectives of this department..."
              rows={3}
              className="textarea textarea-bordered w-full text-xs rounded-xl bg-base-200/50"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-base-200">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-sm btn-ghost rounded-xl"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-sm bg-primary text-white hover:bg-primary/90 rounded-xl px-5 gap-1.5 shadow-sm shadow-primary/20"
            >
              <Send className="size-3.5" />
              <span>Create department</span>
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
