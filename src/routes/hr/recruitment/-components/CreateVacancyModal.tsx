import { useState, useRef, useEffect } from "react";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import SimpleInput from "@/components/inputs/SimpleInput";
import LocalSelect from "@/components/inputs/LocalSelect";
import {
  HR_DEPARTMENTS,
  HR_GRADES,
  HR_EMPLOYMENT_TYPES,
  HR_LOCATIONS,
  REASON_OPTIONS,
  APPROVER_OPTIONS,
  CHANNEL_OPTIONS,
} from "./recruitmentData";
import type { Vacancy } from "./types";
import { toast } from "sonner";
import { Send } from "lucide-react";

interface CreateVacancyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateVacancy: (vacancy: Vacancy) => Promise<any> | void;
  departments?: Array<{ id: string; name: string }>;
  approvers?: Array<{ id: string; name: string }>;
}

export default function CreateVacancyModal({
  isOpen,
  onClose,
  onCreateVacancy,
  departments,
  approvers,
}: CreateVacancyModalProps) {
  const modalRef = useRef<ModalHandle>(null);

  const [activeTab, setActiveTab] = useState<"requisition" | "advert">(
    "requisition",
  );

  const departmentChoices =
    departments && departments.length > 0
      ? departments
      : HR_DEPARTMENTS.map((name) => ({ id: "", name }));

  const approverChoices =
    approvers && approvers.length > 0
      ? approvers
      : APPROVER_OPTIONS.map((name) => ({ id: "", name }));

  const [form, setForm] = useState({
    title: "",
    dept: departmentChoices[0]?.name || "Engineering",
    grade: "G3",
    openings: 1,
    type: "Full-time",
    location: "Lagos",
    reason: "Expansion",
    budget: "",
    desc: "",
    closes: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10),
    approver: approverChoices[0]?.name || "Head of HR",
    channels: CHANNEL_OPTIONS[0] || "Careers page",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.open();
    } else {
      modalRef.current?.close();
    }
  }, [isOpen]);

  useEffect(() => {
    if (
      departmentChoices.length > 0 &&
      !departmentChoices.some((d) => d.name === form.dept)
    ) {
      setForm((prev) => ({ ...prev, dept: departmentChoices[0].name }));
    }
  }, [departmentChoices, form.dept]);

  useEffect(() => {
    if (
      approverChoices.length > 0 &&
      !approverChoices.some((a) => a.name === form.approver)
    ) {
      setForm((prev) => ({ ...prev, approver: approverChoices[0].name }));
    }
  }, [approverChoices, form.approver]);

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim()) {
      toast.error("Please provide a vacancy job title");
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedDept = departmentChoices.find(
        (d) =>
          d.name.toLowerCase() === form.dept.toLowerCase() ||
          (d.id && d.id === form.dept),
      );
      const selectedApprover = approverChoices.find(
        (a) =>
          a.name.toLowerCase() === form.approver.toLowerCase() ||
          (a.id && a.id === form.approver),
      );

      const newVacancy: Vacancy = {
        id: `VAC-${Math.floor(26 + Math.random() * 50)}`,
        title: form.title.trim(),
        dept: selectedDept?.name || form.dept,
        departmentId: selectedDept?.id || undefined,
        grade: form.grade,
        openings: Number(form.openings) || 1,
        applicants: 0,
        type: form.type,
        location: form.location,
        reason: form.reason,
        budget: form.budget.trim() || "Competitive",
        desc: form.desc.trim(),
        closes: new Date(form.closes).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        closingDate: form.closes,
        approver: selectedApprover?.name || form.approver,
        approverId: selectedApprover?.id || undefined,
        channels: form.channels,
        status: "Pending Approval",
      };

      await onCreateVacancy(newVacancy);

      // Reset form on success
      setForm({
        title: "",
        dept: departmentChoices[0]?.name || "Engineering",
        grade: "G3",
        openings: 1,
        type: "Full-time",
        location: "Lagos",
        reason: "Expansion",
        budget: "",
        desc: "",
        closes: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10),
        approver: approverChoices[0]?.name || "Head of HR",
        channels: CHANNEL_OPTIONS[0] || "Careers page",
      });
      setActiveTab("requisition");
      onClose();
    } catch {
      // Kept open on failure so inputs are preserved
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      ref={modalRef}
      title="Create Vacancy"
      maxWidth="max-w-2xl"
      onClose={onClose}
    >
      <div className="space-y-4">
        {/* Stepper Tabs & description */}
        <div className="flex flex-col    gap-3 -mt-1 pb-3 border-b border-base-200">
          <p className=" text-base-content/60">
            Raise a requisition. It goes to the approver before it can be
            published.
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("requisition")}
              className={`px-3 py-1.5 rounded-lg  font-semibold transition-all ${
                activeTab === "requisition"
                  ? "bg-primary text-white shadow-xs"
                  : "bg-base-200 text-base-content/70 hover:bg-base-300"
              }`}
            >
              1. Requisition Details
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("advert")}
              className={`px-3 py-1.5 rounded-lg  font-semibold transition-all ${
                activeTab === "advert"
                  ? "bg-primary text-white shadow-xs"
                  : "bg-base-200 text-base-content/70 hover:bg-base-300"
              }`}
            >
              2. Advert & Approval
            </button>
          </div>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === "requisition" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className=" font-semibold text-base-content/80 mb-1 block">
                    Job title <span className="text-error">*</span>
                  </label>
                  <SimpleInput
                    value={form.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="e.g. Senior Backend Engineer"
                    required
                  />
                </div>

                <div>
                  <label className=" font-semibold text-base-content/80 mb-1 block">
                    Department <span className="text-error">*</span>
                  </label>
                  <LocalSelect
                    value={form.dept}
                    onChange={(e) => handleChange("dept", e.target.value)}
                  >
                    {departmentChoices.map((dept) => (
                      <option key={dept.id || dept.name} value={dept.name}>
                        {dept.name}
                      </option>
                    ))}
                  </LocalSelect>
                </div>

                <div>
                  <label className=" font-semibold text-base-content/80 mb-1 block">
                    Job grade / level
                  </label>
                  <LocalSelect
                    value={form.grade}
                    onChange={(e) => handleChange("grade", e.target.value)}
                  >
                    {HR_GRADES.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </LocalSelect>
                </div>

                <div>
                  <label className=" font-semibold text-base-content/80 mb-1 block">
                    Number of openings
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={form.openings}
                    onChange={(e) => handleChange("openings", e.target.value)}
                    className="input input-bordered w-full  rounded-xl bg-base-200/50"
                  />
                </div>

                <div>
                  <label className=" font-semibold text-base-content/80 mb-1 block">
                    Employment type
                  </label>
                  <LocalSelect
                    value={form.type}
                    onChange={(e) => handleChange("type", e.target.value)}
                  >
                    {HR_EMPLOYMENT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </LocalSelect>
                </div>

                <div>
                  <label className=" font-semibold text-base-content/80 mb-1 block">
                    Location
                  </label>
                  <LocalSelect
                    value={form.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                  >
                    {HR_LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </LocalSelect>
                </div>

                <div>
                  <label className=" font-semibold text-base-content/80 mb-1 block">
                    Reason for hiring
                  </label>
                  <LocalSelect
                    value={form.reason}
                    onChange={(e) => handleChange("reason", e.target.value)}
                  >
                    {REASON_OPTIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </LocalSelect>
                </div>

                <div className="sm:col-span-2">
                  <label className=" font-semibold text-base-content/80 mb-1 block">
                    Budget / Salary range
                  </label>
                  <SimpleInput
                    value={form.budget}
                    onChange={(e) => handleChange("budget", e.target.value)}
                    placeholder="e.g. ₦1,200,000 – ₦1,600,000 / month"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-base-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-sm btn-ghost rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("advert")}
                  className="btn btn-sm bg-primary text-white hover:bg-primary/90 rounded-xl px-5"
                >
                  Next: Advert & Approval →
                </button>
              </div>
            </div>
          )}

          {activeTab === "advert" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <label className=" font-semibold text-base-content/80 mb-1 block">
                  Job description & key requirements
                </label>
                <textarea
                  value={form.desc}
                  onChange={(e) => handleChange("desc", e.target.value)}
                  placeholder="Outline responsibilities, must-have skills, qualifications, and team fit..."
                  rows={4}
                  className="textarea textarea-bordered w-full  rounded-xl bg-base-200/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className=" font-semibold text-base-content/80 mb-1 block">
                    Application deadline
                  </label>
                  <input
                    type="date"
                    value={form.closes}
                    onChange={(e) => handleChange("closes", e.target.value)}
                    className="input input-bordered w-full  rounded-xl bg-base-200/50"
                  />
                </div>

                <div>
                  <label className=" font-semibold text-base-content/80 mb-1 block">
                    Approver (HR Lead / VP)
                  </label>
                  <LocalSelect
                    value={form.approver}
                    onChange={(e) => handleChange("approver", e.target.value)}
                  >
                    {approverChoices.map((app) => (
                      <option key={app.id || app.name} value={app.name}>
                        {app.name}
                      </option>
                    ))}
                  </LocalSelect>
                </div>

                <div className="sm:col-span-2">
                  <label className=" font-semibold text-base-content/80 mb-1 block">
                    Publication Channels
                  </label>
                  <LocalSelect
                    value={form.channels}
                    onChange={(e) => handleChange("channels", e.target.value)}
                  >
                    {CHANNEL_OPTIONS.map((ch) => (
                      <option key={ch} value={ch}>
                        {ch}
                      </option>
                    ))}
                  </LocalSelect>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-base-200">
                <button
                  type="button"
                  onClick={() => setActiveTab("requisition")}
                  className="btn btn-sm btn-ghost rounded-xl"
                >
                  ← Back to Requisition
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn btn-sm btn-outline rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-sm bg-primary text-white hover:bg-primary/90 rounded-xl px-5 gap-1.5 shadow-sm shadow-primary/20"
                  >
                    {isSubmitting ? (
                      <span className="loading loading-spinner loading-xs" />
                    ) : (
                      <Send className="size-3.5" />
                    )}
                    <span>
                      {isSubmitting ? "Submitting..." : "Submit requisition"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </Modal>
  );
}
