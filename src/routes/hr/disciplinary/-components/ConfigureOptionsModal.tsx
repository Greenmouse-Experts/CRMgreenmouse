import { useEffect, useRef, useState } from "react";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import {
  useConfigureDisciplinaryOptions,
  type DisciplinaryOptions,
} from "@/api/disciplinaryApi";
import { extract_message } from "@/helpers/errors";
import { toast } from "sonner";
import { Plus, Save, Settings, X } from "lucide-react";

interface ConfigureOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  options: DisciplinaryOptions;
}

export default function ConfigureOptionsModal({
  isOpen,
  onClose,
  options,
}: ConfigureOptionsModalProps) {
  const modalRef = useRef<ModalHandle>(null);
  const configureMutation = useConfigureDisciplinaryOptions();

  const [categories, setCategories] = useState<string[]>([]);
  const [severities, setSeverities] = useState<string[]>([]);
  const [categoryInput, setCategoryInput] = useState("");
  const [severityInput, setSeverityInput] = useState("");

  useEffect(() => {
    if (isOpen) {
      setCategories(options.categories);
      setSeverities(options.severities);
      setCategoryInput("");
      setSeverityInput("");
      modalRef.current?.open();
    } else {
      modalRef.current?.close();
    }
  }, [isOpen, options.categories, options.severities]);

  const addCategory = () => {
    const trimmed = categoryInput.trim();
    if (!trimmed) return;
    if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      toast.error("Category already exists.");
      return;
    }
    setCategories((prev) => [...prev, trimmed]);
    setCategoryInput("");
  };

  const addSeverity = () => {
    const trimmed = severityInput.trim();
    if (!trimmed) return;
    if (severities.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      toast.error("Severity already exists.");
      return;
    }
    setSeverities((prev) => [...prev, trimmed]);
    setSeverityInput("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (categories.length === 0 || severities.length === 0) {
      toast.error("Add at least one category and one severity level.");
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
      title="Configure Categories & Severities"
      maxWidth="max-w-lg"
      onClose={onClose}
    >
      <form onSubmit={handleSave} className="space-y-5">
        <p className="text-sm text-base-content/80 -mt-1">
          Create and manage the disciplinary categories and severity levels used
          when opening cases.
        </p>

        {/* Categories builder */}
        <div className="space-y-2.5">
          <label className="font-semibold text-base-content/80 flex items-center gap-1.5">
            <Settings className="size-4 text-primary" />
            <span>Categories ({categories.length})</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCategory();
                }
              }}
              placeholder="e.g. Policy breach, Attendance..."
              className="input input-bordered input-sm flex-1 rounded-xl bg-base-200/80"
            />
            <button
              type="button"
              onClick={addCategory}
              className="btn btn-sm btn-outline rounded-xl gap-1"
            >
              <Plus className="size-4" />
              <span>Add</span>
            </button>
          </div>
          {categories.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {categories.map((cat) => (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-base-200 px-2.5 py-1 text-sm font-medium text-base-content border border-base-300"
                >
                  <span>{cat}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setCategories((prev) => prev.filter((c) => c !== cat))
                    }
                    className="text-base-content/60 hover:text-error"
                    aria-label={`Remove ${cat}`}
                  >
                    <X className="size-3.5" />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-base-content/60">
              No categories added yet.
            </p>
          )}
        </div>

        {/* Severities builder */}
        <div className="space-y-2.5">
          <label className="font-semibold text-base-content/80 block">
            Severities ({severities.length})
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={severityInput}
              onChange={(e) => setSeverityInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSeverity();
                }
              }}
              placeholder="e.g. Minor, Major, Gross misconduct..."
              className="input input-bordered input-sm flex-1 rounded-xl bg-base-200/80"
            />
            <button
              type="button"
              onClick={addSeverity}
              className="btn btn-sm btn-outline rounded-xl gap-1"
            >
              <Plus className="size-4" />
              <span>Add</span>
            </button>
          </div>
          {severities.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {severities.map((sev) => (
                <span
                  key={sev}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-base-200 px-2.5 py-1 text-sm font-medium text-base-content border border-base-300"
                >
                  <span>{sev}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setSeverities((prev) => prev.filter((s) => s !== sev))
                    }
                    className="text-base-content/60 hover:text-error"
                    aria-label={`Remove ${sev}`}
                  >
                    <X className="size-3.5" />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-base-content/60">
              No severities added yet.
            </p>
          )}
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
            disabled={
              configureMutation.isPending ||
              categories.length === 0 ||
              severities.length === 0
            }
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
