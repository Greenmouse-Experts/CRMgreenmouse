import { useEffect, useRef, useState, type FormEvent } from "react";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import {
  useAddPipelineStage,
  useCreatePipeline,
  useCreatePipelineDeal,
  useUpdatePipeline,
  useUpdatePipelineDeal,
  useUpdatePipelineStage,
  type Pipeline,
  type PipelineDeal,
  type PipelineStage,
} from "@/api/pipelineApi";
import { useContacts } from "@/api/crmApi";
import { useLeads } from "@/api/salesApi";
import { useEmployees } from "@/api/employeesApi";
import { extract_message } from "@/helpers/errors";
import { toast } from "sonner";
import { AlertTriangle, Check, Layers, Plus, Sparkles } from "lucide-react";

const COLOR_PRESETS = [
  "#3B82F6",
  "#007047",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
  "#EF4444",
  "#64748B",
];

/* -------------------------------------------------------------------------- */
/* Pipeline Create / Edit Modal                                               */
/* -------------------------------------------------------------------------- */

interface PipelineFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingPipeline?: Pipeline | null;
  onSuccess?: (pipeline: Pipeline) => void;
}

export function PipelineFormModal({
  isOpen,
  onClose,
  editingPipeline,
  onSuccess,
}: PipelineFormModalProps) {
  const modalRef = useRef<ModalHandle>(null);
  const createPipeline = useCreatePipeline();
  const updatePipeline = useUpdatePipeline();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setName(editingPipeline?.name ?? "");
      setDescription(editingPipeline?.description ?? "");
      setIsActive(editingPipeline?.isActive ?? true);
      modalRef.current?.open();
    } else {
      modalRef.current?.close();
    }
  }, [isOpen, editingPipeline]);

  const isPending = createPipeline.isPending || updatePipeline.isPending;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Pipeline name is required");
      return;
    }

    try {
      if (editingPipeline?.id) {
        const updated = await toast.promise(
          updatePipeline.mutateAsync({
            id: editingPipeline.id,
            name: trimmedName,
            description: description.trim() || undefined,
            isActive,
          }),
          {
            loading: "Updating pipeline...",
            success: "Pipeline updated",
            error: (err) => extract_message(err),
          },
        ).unwrap();
        onSuccess?.(updated);
      } else {
        const created = await toast.promise(
          createPipeline.mutateAsync({
            name: trimmedName,
            description: description.trim() || undefined,
          }),
          {
            loading: "Creating pipeline...",
            success: "Pipeline created",
            error: (err) => extract_message(err),
          },
        ).unwrap();
        onSuccess?.(created);
      }
      onClose();
    } catch {
      // toast.promise handles error display
    }
  };

  return (
    <Modal
      ref={modalRef}
      title={editingPipeline ? "Edit Pipeline" : "Create Pipeline"}
      maxWidth="max-w-lg"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-control gap-1.5">
          <label className="label py-0">
            <span className="label-text font-medium">Pipeline Name *</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Enterprise Sales"
            className="input input-bordered w-full rounded-xl"
          />
        </div>

        <div className="form-control gap-1.5">
          <label className="label py-0">
            <span className="label-text font-medium">Description</span>
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the deals or workflow tracked in this pipeline..."
            className="textarea textarea-bordered w-full rounded-xl"
          />
        </div>

        {editingPipeline && (
          <label className="flex items-center justify-between gap-3 rounded-xl border border-base-300 bg-base-200/40 px-4 py-3 cursor-pointer">
            <div>
              <div className="font-medium text-sm">Pipeline Active</div>
              <div className="text-xs text-base-content/60">
                Inactive pipelines remain saved but can be hidden from active
                workflows.
              </div>
            </div>
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
          </label>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-base-200">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm btn-ghost rounded-xl"
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-sm bg-primary text-white hover:bg-primary/90 border-0 rounded-xl px-4 gap-1.5"
            disabled={isPending}
          >
            <Sparkles className="size-4" />
            {editingPipeline ? "Save Changes" : "Create Pipeline"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* -------------------------------------------------------------------------- */
/* Stage Create / Edit Modal                                                  */
/* -------------------------------------------------------------------------- */

interface StageFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  pipelineId: string;
  editingStage?: PipelineStage | null;
}

export function StageFormModal({
  isOpen,
  onClose,
  pipelineId,
  editingStage,
}: StageFormModalProps) {
  const modalRef = useRef<ModalHandle>(null);
  const addStage = useAddPipelineStage();
  const updateStage = useUpdatePipelineStage();

  const [name, setName] = useState("");
  const [color, setColor] = useState("#3B82F6");
  const [isWon, setIsWon] = useState(false);
  const [isLost, setIsLost] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(editingStage?.name ?? "");
      setColor(editingStage?.color ?? "#3B82F6");
      setIsWon(Boolean(editingStage?.isWon));
      setIsLost(Boolean(editingStage?.isLost));
      modalRef.current?.open();
    } else {
      modalRef.current?.close();
    }
  }, [isOpen, editingStage]);

  const isPending = addStage.isPending || updateStage.isPending;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Stage name is required");
      return;
    }
    if (!pipelineId) {
      toast.error("Select a pipeline first");
      return;
    }

    try {
      if (editingStage?.id) {
        await toast.promise(
          updateStage.mutateAsync({
            pipelineId,
            stageId: editingStage.id,
            name: trimmedName,
            color,
            isWon,
            isLost,
          }),
          {
            loading: "Updating stage...",
            success: "Stage updated",
            error: (err) => extract_message(err),
          },
        ).unwrap();
      } else {
        await toast.promise(
          addStage.mutateAsync({
            pipelineId,
            name: trimmedName,
            color,
            isWon,
            isLost,
          }),
          {
            loading: "Adding stage...",
            success: "Stage added to pipeline",
            error: (err) => extract_message(err),
          },
        ).unwrap();
      }
      onClose();
    } catch {
      // toast.promise handles error display
    }
  };

  return (
    <Modal
      ref={modalRef}
      title={editingStage ? "Edit Pipeline Stage" : "Add Pipeline Stage"}
      maxWidth="max-w-lg"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-control gap-1.5">
          <label className="label py-0">
            <span className="label-text font-medium">Stage Name *</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Qualified, Proposal Sent, Closed Won"
            className="input input-bordered w-full rounded-xl"
          />
        </div>

        <div className="form-control gap-2">
          <label className="label py-0">
            <span className="label-text font-medium">Stage Color</span>
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setColor(preset)}
                className={`size-8 rounded-full border-2 flex items-center justify-center transition-transform ${
                  color.toLowerCase() === preset.toLowerCase()
                    ? "border-base-content scale-110"
                    : "border-transparent"
                }`}
                style={{ backgroundColor: preset }}
                title={preset}
              >
                {color.toLowerCase() === preset.toLowerCase() && (
                  <Check className="size-4 text-white drop-shadow" />
                )}
              </button>
            ))}
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-10 h-8 rounded cursor-pointer border border-base-300 bg-transparent"
              title="Custom color"
            />
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="input input-bordered input-sm w-28 font-mono rounded-lg"
              placeholder="#3B82F6"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex items-center justify-between gap-2 rounded-xl border border-base-300 bg-base-200/40 px-3.5 py-2.5 cursor-pointer">
            <div>
              <div className="font-medium text-sm text-success">Won Stage</div>
              <div className="text-xs text-base-content/60">
                Marks deals as won
              </div>
            </div>
            <input
              type="checkbox"
              className="checkbox checkbox-success checkbox-sm"
              checked={isWon}
              onChange={(e) => {
                setIsWon(e.target.checked);
                if (e.target.checked) setIsLost(false);
              }}
            />
          </label>

          <label className="flex items-center justify-between gap-2 rounded-xl border border-base-300 bg-base-200/40 px-3.5 py-2.5 cursor-pointer">
            <div>
              <div className="font-medium text-sm text-error">Lost Stage</div>
              <div className="text-xs text-base-content/60">
                Marks deals as lost
              </div>
            </div>
            <input
              type="checkbox"
              className="checkbox checkbox-error checkbox-sm"
              checked={isLost}
              onChange={(e) => {
                setIsLost(e.target.checked);
                if (e.target.checked) setIsWon(false);
              }}
            />
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-base-200">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm btn-ghost rounded-xl"
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-sm bg-primary text-white hover:bg-primary/90 border-0 rounded-xl px-4 gap-1.5"
            disabled={isPending}
          >
            <Layers className="size-4" />
            {editingStage ? "Save Stage" : "Add Stage"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* -------------------------------------------------------------------------- */
/* Deal Create / Edit Modal                                                   */
/* -------------------------------------------------------------------------- */

interface DealFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  pipelineId: string;
  stages: PipelineStage[];
  defaultStageId?: string;
  editingDeal?: PipelineDeal | null;
}

export function DealFormModal({
  isOpen,
  onClose,
  pipelineId,
  stages,
  defaultStageId,
  editingDeal,
}: DealFormModalProps) {
  const modalRef = useRef<ModalHandle>(null);
  const createDeal = useCreatePipelineDeal();
  const updateDeal = useUpdatePipelineDeal();

  const contactsQuery = useContacts();
  const leadsQuery = useLeads();
  const employeesQuery = useEmployees();

  const [name, setName] = useState("");
  const [stageId, setStageId] = useState("");
  const [value, setValue] = useState("0");
  const [currency, setCurrency] = useState("NGN");
  const [expectedCloseDate, setExpectedCloseDate] = useState("");
  const [status, setStatus] = useState("open");
  const [contactId, setContactId] = useState("");
  const [leadId, setLeadId] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (isOpen) {
      setName(editingDeal?.name ?? "");
      setStageId(
        editingDeal?.stageId || defaultStageId || stages[0]?.id || "",
      );
      setValue(String(editingDeal?.value ?? 0));
      setCurrency(editingDeal?.currency ?? "NGN");
      setExpectedCloseDate(
        editingDeal?.expectedCloseDate
          ? String(editingDeal.expectedCloseDate).slice(0, 10)
          : "",
      );
      setStatus(editingDeal?.status ?? "open");
      setContactId(editingDeal?.contactId ?? "");
      setLeadId(editingDeal?.leadId ?? "");
      setAssignedTo(editingDeal?.assignedTo ?? "");
      setNotes(editingDeal?.notes ?? "");
      modalRef.current?.open();
    } else {
      modalRef.current?.close();
    }
  }, [isOpen, editingDeal, defaultStageId, stages]);

  const isPending = createDeal.isPending || updateDeal.isPending;

  const contacts = Array.isArray(contactsQuery.data)
    ? contactsQuery.data
    : [];
  const leads = Array.isArray(leadsQuery.data) ? leadsQuery.data : [];
  const employees = Array.isArray(employeesQuery.data)
    ? employeesQuery.data
    : [];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Deal name is required");
      return;
    }
    if (!pipelineId || !stageId) {
      toast.error("Please select a pipeline stage");
      return;
    }

    const numericValue = Number(value);
    if (!Number.isFinite(numericValue) || numericValue < 0) {
      toast.error("Deal value must be a valid non-negative number");
      return;
    }

    try {
      if (editingDeal?.id) {
        await toast.promise(
          updateDeal.mutateAsync({
            id: editingDeal.id,
            name: trimmedName,
            pipelineId,
            stageId,
            value: numericValue,
            currency,
            expectedCloseDate: expectedCloseDate || undefined,
            status,
            assignedTo: assignedTo || undefined,
            notes: notes.trim() || undefined,
          }),
          {
            loading: "Updating deal...",
            success: "Deal updated",
            error: (err) => extract_message(err),
          },
        ).unwrap();
      } else {
        await toast.promise(
          createDeal.mutateAsync({
            name: trimmedName,
            pipelineId,
            stageId,
            value: numericValue,
            currency,
            expectedCloseDate: expectedCloseDate || undefined,
            status,
            contactId: contactId || undefined,
            leadId: leadId || undefined,
            assignedTo: assignedTo || undefined,
            notes: notes.trim() || undefined,
          }),
          {
            loading: "Creating deal...",
            success: "Deal added to pipeline",
            error: (err) => extract_message(err),
          },
        ).unwrap();
      }
      onClose();
    } catch {
      // toast.promise handles error display
    }
  };

  return (
    <Modal
      ref={modalRef}
      title={editingDeal ? "Edit Deal" : "Add Deal to Pipeline"}
      maxWidth="max-w-2xl"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="form-control gap-1.5 sm:col-span-2">
            <label className="label py-0">
              <span className="label-text font-medium">Deal Name *</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Q4 Enterprise License"
              className="input input-bordered w-full rounded-xl"
            />
          </div>

          <div className="form-control gap-1.5">
            <label className="label py-0">
              <span className="label-text font-medium">Stage *</span>
            </label>
            <select
              required
              value={stageId}
              onChange={(e) => setStageId(e.target.value)}
              className="select select-bordered w-full rounded-xl"
            >
              <option value="">Select stage</option>
              {stages.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-control gap-1.5">
            <label className="label py-0">
              <span className="label-text font-medium">Status</span>
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="select select-bordered w-full rounded-xl"
            >
              <option value="open">Open</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
              <option value="on_hold">On Hold</option>
            </select>
          </div>

          <div className="form-control gap-1.5">
            <label className="label py-0">
              <span className="label-text font-medium">Deal Value</span>
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="input input-bordered w-full rounded-xl"
            />
          </div>

          <div className="form-control gap-1.5">
            <label className="label py-0">
              <span className="label-text font-medium">Currency</span>
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="select select-bordered w-full rounded-xl"
            >
              <option value="NGN">NGN</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>

          <div className="form-control gap-1.5">
            <label className="label py-0">
              <span className="label-text font-medium">
                Expected Close Date
              </span>
            </label>
            <input
              type="date"
              value={expectedCloseDate}
              onChange={(e) => setExpectedCloseDate(e.target.value)}
              className="input input-bordered w-full rounded-xl"
            />
          </div>

          <div className="form-control gap-1.5">
            <label className="label py-0">
              <span className="label-text font-medium">Assigned Owner</span>
            </label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="select select-bordered w-full rounded-xl"
            >
              <option value="">Unassigned</option>
              {employees.map((emp) => {
                const label =
                  `${emp.firstName ?? ""} ${emp.lastName ?? ""}`.trim() ||
                  emp.email ||
                  emp.id;
                return (
                  <option key={emp.id} value={emp.id}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>

          {!editingDeal && (
            <>
              <div className="form-control gap-1.5">
                <label className="label py-0">
                  <span className="label-text font-medium">
                    Contact (Optional)
                  </span>
                </label>
                <select
                  value={contactId}
                  onChange={(e) => setContactId(e.target.value)}
                  className="select select-bordered w-full rounded-xl"
                >
                  <option value="">None</option>
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {`${c.firstName ?? ""} ${c.lastName ?? ""}`.trim() ||
                        c.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control gap-1.5">
                <label className="label py-0">
                  <span className="label-text font-medium">
                    Lead (Optional)
                  </span>
                </label>
                <select
                  value={leadId}
                  onChange={(e) => setLeadId(e.target.value)}
                  className="select select-bordered w-full rounded-xl"
                >
                  <option value="">None</option>
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.title || l.id}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="form-control gap-1.5 sm:col-span-2">
            <label className="label py-0">
              <span className="label-text font-medium">Notes</span>
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Deal notes, next steps, key stakeholders..."
              className="textarea textarea-bordered w-full rounded-xl"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-base-200">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm btn-ghost rounded-xl"
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-sm bg-primary text-white hover:bg-primary/90 border-0 rounded-xl px-4 gap-1.5"
            disabled={isPending}
          >
            <Plus className="size-4" />
            {editingDeal ? "Save Deal" : "Create Deal"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* -------------------------------------------------------------------------- */
/* Confirm Delete Modal                                                       */
/* -------------------------------------------------------------------------- */

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  isPending?: boolean;
  onConfirm: () => Promise<void> | void;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  title,
  description,
  confirmLabel = "Delete",
  isPending = false,
  onConfirm,
}: DeleteConfirmModalProps) {
  const modalRef = useRef<ModalHandle>(null);

  useEffect(() => {
    if (isOpen) modalRef.current?.open();
    else modalRef.current?.close();
  }, [isOpen]);

  return (
    <Modal ref={modalRef} title={title} maxWidth="max-w-md" onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-xl bg-error/10 border border-error/20 p-3.5 text-sm">
          <AlertTriangle className="size-5 text-error shrink-0 mt-0.5" />
          <p className="text-base-content/80">{description}</p>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm btn-ghost rounded-xl"
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="btn btn-sm btn-error text-white rounded-xl px-4"
            disabled={isPending}
          >
            {isPending ? "Deleting..." : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
