import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useContacts } from "@/api/crmApi";
import { uploadTicketAttachments } from "@/api/supportAttachments";
import { useCreateTicket, type TicketPriority } from "@/api/supportApi";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import UpdateImages from "@/components/images/UpdateImages";
import SimpleInput from "@/components/inputs/SimpleInput";
import SimpleTextArea from "@/components/inputs/SimpleTextArea";
import LocalSelect from "@/components/inputs/LocalSelect";

export interface CreateTicketModalHandle {
  open: (target?: {
    contactId?: string;
    companyId?: string;
    companyName?: string;
  }) => void;
}

const initialForm = {
  subject: "",
  contactId: "",
  description: "",
  priority: "medium" as TicketPriority,
};
const priorities: TicketPriority[] = ["low", "medium", "high", "urgent"];

const CreateTicketModal = forwardRef<CreateTicketModalHandle>(
  function CreateTicketModal(_, ref) {
    const navigate = useNavigate();
    const modalRef = useRef<ModalHandle>(null);
    const contactsQuery = useContacts();
    const createTicket = useCreateTicket();
    const [form, setForm] = useState(initialForm);
    const [company, setCompany] = useState<{ id: string; name: string } | null>(
      null,
    );
    const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [pickerKey, setPickerKey] = useState(0);

    const contacts = useMemo(() => {
      const all = contactsQuery.data ?? [];
      if (!company) return all;
      return all.filter(
        (contact) =>
          contact.companyId === company.id ||
          contact.company?.id === company.id ||
          contact.companyName?.trim().toLowerCase() ===
            company.name.trim().toLowerCase(),
      );
    }, [contactsQuery.data, company]);

    useImperativeHandle(ref, () => ({
      open: (target) => {
        setCompany(
          target?.companyId
            ? {
                id: target.companyId,
                name: target.companyName || "this company",
              }
            : null,
        );
        setForm({ ...initialForm, contactId: target?.contactId || "" });
        setAttachmentFiles([]);
        setPickerKey((key) => key + 1);
        modalRef.current?.open();
      },
    }));

    const submitTicket = async (event: React.FormEvent) => {
      event.preventDefault();
      const subject = form.subject.trim();
      const description = form.description.trim();
      if (!subject || !description || !form.contactId) {
        toast.error("Add a subject, contact, and description.");
        return;
      }
      try {
        setIsUploading(true);
        const attachments = await uploadTicketAttachments(attachmentFiles);
        const created = await createTicket.mutateAsync({
          subject,
          contactId: form.contactId,
          description,
          priority: form.priority,
          attachments,
        });
        toast.success("Ticket created.");
        modalRef.current?.close();
        if (created?.id)
          navigate({ to: "/tenant/support/$id", params: { id: created.id } });
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Could not create ticket.",
        );
      } finally {
        setIsUploading(false);
      }
    };

    return (
      <Modal
        ref={modalRef}
        title={company ? `New ticket · ${company.name}` : "New support ticket"}
      >
        <form onSubmit={submitTicket} className="space-y-4 pt-2">
          <SimpleInput
            label="Subject"
            required
            value={form.subject}
            onChange={(event) =>
              setForm({ ...form, subject: event.target.value })
            }
            placeholder="What needs help?"
          />
          <LocalSelect
            label="Contact"
            required
            value={form.contactId}
            disabled={
              contactsQuery.isPending ||
              contactsQuery.isError ||
              isUploading ||
              createTicket.isPending
            }
            onChange={(event) =>
              setForm({ ...form, contactId: event.target.value })
            }
          >
            <option value="">
              {contactsQuery.isPending
                ? "Loading contacts..."
                : "Select a contact"}
            </option>
            {contacts.map((contact) => (
              <option key={contact.id} value={contact.id}>
                {contact.firstName} {contact.lastName} · {contact.email}
              </option>
            ))}
          </LocalSelect>
          {contactsQuery.isError && (
            <p className="text-sm text-error">
              Contacts could not be loaded. Close this form and try again.
            </p>
          )}
          {!contactsQuery.isPending &&
            !contactsQuery.isError &&
            !contacts.length && (
              <p className="text-sm text-base-content/70">
                {company
                  ? `No contacts are linked to ${company.name}. `
                  : "Create a contact before opening a ticket. "}
                <Link
                  to="/tenant/contacts/customers/add"
                  className="link link-primary"
                >
                  Add a contact
                </Link>
              </p>
            )}
          <LocalSelect
            label="Priority"
            value={form.priority}
            onChange={(event) =>
              setForm({
                ...form,
                priority: event.target.value as TicketPriority,
              })
            }
          >
            {priorities.map((priority) => (
              <option key={priority} value={priority} className="capitalize">
                {priority}
              </option>
            ))}
          </LocalSelect>
          <SimpleTextArea
            label="Description"
            required
            rows={5}
            value={form.description}
            onChange={(event) =>
              setForm({ ...form, description: event.target.value })
            }
            placeholder="Describe the issue and any relevant context"
          />
          <div>
            <p className="text-sm font-medium">Attachments (optional)</p>
            <UpdateImages
              key={pickerKey}
              setNew={setAttachmentFiles}
              accept="image/*,application/pdf,video/*"
              fileMode
            />
          </div>
          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => modalRef.current?.close()}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={
                createTicket.isPending ||
                isUploading ||
                contactsQuery.isPending ||
                contactsQuery.isError ||
                !contacts.length
              }
            >
              {isUploading
                ? "Uploading..."
                : createTicket.isPending
                  ? "Creating..."
                  : "Create ticket"}
            </button>
          </div>
        </form>
      </Modal>
    );
  },
);

export default CreateTicketModal;
