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
import { Briefcase, Send } from "lucide-react";

interface CreateVacancyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateVacancy: (newVacancy: Vacancy) => void;
}

export default function CreateVacancyModal({
  isOpen,
  onClose,
  onCreateVacancy,
}: CreateVacancyModalProps) {
  const modalRef = useRef<ModalHandle>(null);

  const [form, setForm] = useState({
    title: "",
    dept: "Engineering",
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
    manager: "Grace Danjuma",
    approver: "Head of HR",
    channels: "All channels",
  });

  const [activeTab, setActiveTab] = useState<"requisition" | "advert">(
    "requisition",
  );
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

    if (!form.title.trim()) {
      toast.error("Please provide a job title");
      return;
    }

    setIsSubmitting(true);

    try {
      const newVacancy: Vacancy = {
        id: `VAC-${Math.floor(26 + Math.random() * 50)}`,
        title: form.title.trim(),
        dept: form.dept,
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
        manager: form.manager,
        approver: form.approver,
        channels: form.channels,
        status: "Pending Approval",
      };

      onCreateVacancy(newVacancy);
      toast.success("Vacancy submitted for approval", {
        description: `${newVacancy.title} requisition has been routed to ${form.approver}.`,
      });

      // Reset form
      setForm({
        title: "",
        dept: "Engineering",
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
        manager: "Grace Danjuma",
        approver: "Head of HR",
        channels: "All channels",
      });
      setActiveTab("requisition");
      onClose();
    } catch {
      toast.error("Failed to submit vacancy requisition");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal ref={modalRef}>
      <div className="w-full max-w-2xl bg-base-100 rounded-2xl shadow-xl overflow-hidden border border-base-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-5 border-b border-base-200">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-sm">
              <Briefcase className="size-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-base-content">
                Create vacancy
              </h3>
              <p className="text-xs text-base-content/60">
                Raise a requisition. It goes to the approver before it can be
                published.
              </p>
            </div>
          </div>

          {/* Stepper Tabs */}
          <div className="flex gap-2 mt-4">
            <button
              type="button"
              onClick={() => setActiveTab("requisition")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
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
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "advert"
                  ? "bg-primary text-white shadow-xs"
                  : "bg-base-200 text-base-content/70 hover:bg-base-300"
              }`}
            >
              2. Advert & Approval
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {activeTab === "requisition" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-base-content/80 mb-1 block">
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
                  <label className="text-xs font-semibold text-base-content/80 mb-1 block">
                    Department <span className="text-error">*</span>
                  </label>
                  <LocalSelect
                    value={form.dept}
                    onChange={(e) => handleChange("dept", e.target.value)}
                  >
                    {HR_DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </LocalSelect>
                </div>

                <div>
                  <label className="text-xs font-semibold text-base-content/80 mb-1 block">
                    Grade
                  </label>
                  <LocalSelect
                    value={form.grade}
                    onChange={(e) => handleChange("grade", e.target.value)}
                  >
                    {HR_GRADES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </LocalSelect>
                </div>

                <div>
                  <label className="text-xs font-semibold text-base-content/80 mb-1 block">
                    Number of openings <span className="text-error">*</span>
                  </label>
                  <SimpleInput
                    type="number"
                    value={String(form.openings)}
                    onChange={(e) =>
                      handleChange("openings", Number(e.target.value) || 1)
                    }
                    min={1}
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-base-content/80 mb-1 block">
                    Employment type <span className="text-error">*</span>
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
                  <label className="text-xs font-semibold text-base-content/80 mb-1 block">
                    Work location
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
                  <label className="text-xs font-semibold text-base-content/80 mb-1 block">
                    Reason for hire <span className="text-error">*</span>
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
                  <label className="text-xs font-semibold text-base-content/80 mb-1 block">
                    Salary range (₦/month)
                  </label>
                  <SimpleInput
                    value={form.budget}
                    onChange={(e) => handleChange("budget", e.target.value)}
                    placeholder="e.g. 600,000 – 850,000"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
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
                <label className="text-xs font-semibold text-base-content/80 mb-1 block">
                  Job description <span className="text-error">*</span>
                </label>
                <textarea
                  value={form.desc}
                  onChange={(e) => handleChange("desc", e.target.value)}
                  placeholder="Responsibilities, requirements, benefits…"
                  rows={4}
                  className="textarea textarea-bordered w-full text-xs rounded-xl bg-base-200/50"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-base-content/80 mb-1 block">
                    Closing date <span className="text-error">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.closes}
                    onChange={(e) => handleChange("closes", e.target.value)}
                    className="input input-bordered w-full text-xs rounded-xl bg-base-200/50"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-base-content/80 mb-1 block">
                    Approver <span className="text-error">*</span>
                  </label>
                  <LocalSelect
                    value={form.approver}
                    onChange={(e) => handleChange("approver", e.target.value)}
                  >
                    {APPROVER_OPTIONS.map((app) => (
                      <option key={app} value={app}>
                        {app}
                      </option>
                    ))}
                  </LocalSelect>
                </div>

                <div>
                  <label className="text-xs font-semibold text-base-content/80 mb-1 block">
                    Hiring manager
                  </label>
                  <SimpleInput
                    value={form.manager}
                    onChange={(e) => handleChange("manager", e.target.value)}
                    placeholder="Hiring Manager name"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-base-content/80 mb-1 block">
                    Publishing channel
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
                    <Send className="size-3.5" />
                    <span>Submit requisition</span>
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
