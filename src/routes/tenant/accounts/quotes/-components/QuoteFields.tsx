import { Controller, useFormContext } from "react-hook-form";
import SimpleInput from "@/components/inputs/SimpleInput";
import FormattedPriceInput from "@/components/inputs/FormattedPriceInput";
import LocalSelect from "@/components/inputs/LocalSelect";
import SimpleTextArea from "@/components/inputs/SimpleTextArea";
import type { Quote } from "@/api/salesApi";
import MarkdownEditor from "./MarkdownEditor";

export interface QuoteFormValues {
  date: string;
  amount: number;
  description: string;
  status: string;
  clientName: string;
  expiresAt: string;
  notes: string;
}

export const defaultQuoteValues = (): QuoteFormValues => ({
  date: new Date().toISOString().slice(0, 10),
  amount: 0,
  description: "",
  status: "draft",
  clientName: "",
  expiresAt: "",
  notes: "",
});

export const quotePayload = (values: QuoteFormValues): Partial<Quote> => ({
  date: values.date,
  amount: Number(values.amount),
  description: values.description.trim(),
  status: values.status,
  clientName: values.clientName.trim(),
  ...(values.expiresAt ? { expiresAt: values.expiresAt } : {}),
  ...(values.notes.trim() ? { notes: values.notes.trim() } : {}),
});

interface QuoteFieldsProps {
  editingStatus?: string;
}

export default function QuoteFields({
  editingStatus,
}: QuoteFieldsProps) {
  const methods = useFormContext<QuoteFormValues>();
  const quoteDate = methods.watch("date");

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <SimpleInput
          label="Quote date"
          type="date"
          {...methods.register("date", { required: "Quote date is required" })}
        />
        <SimpleInput
          label="Expires on"
          type="date"
          min={quoteDate || undefined}
          {...methods.register("expiresAt", {
            validate: (value) =>
              !value ||
              !quoteDate ||
              value >= quoteDate ||
              "Expiry must be on or after the quote date",
          })}
        />
        <Controller
          name="amount"
          control={methods.control}
          rules={{
            validate: (value) =>
              (Number.isFinite(Number(value)) && Number(value) > 0) ||
              "Amount must be positive",
          }}
          render={({ field }) => (
            <FormattedPriceInput
              label="Amount (₦)"
              name={field.name}
              ref={field.ref}
              value={field.value ?? ""}
              onBlur={field.onBlur}
              onValueChange={(values, sourceInfo) => {
                if (sourceInfo.source === "event")
                  field.onChange(values.floatValue);
              }}
            />
          )}
        />
        <LocalSelect label="Status" {...methods.register("status")}>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          {editingStatus &&
            !["draft", "sent", "accepted", "rejected"].includes(
              editingStatus.toLowerCase(),
            ) && (
              <option value={editingStatus.toLowerCase()}>
                {editingStatus}
              </option>
            )}
        </LocalSelect>
      </div>

      <div className="space-y-3">
        <div>
          <h2 className="text-base font-semibold">Client details</h2>
          <p className="text-sm text-base-content/70">
            Who is this quote for?
          </p>
        </div>
        <SimpleInput
          label="Client name"
          placeholder="Customer or company name"
          required
          {...methods.register("clientName", {
            required: "Client name is required",
            validate: (value) => !!value.trim() || "Client name is required",
          })}
        />
      </div>

      <div className="space-y-3">
        <div>
          <h2 className="text-base font-semibold">Quote content</h2>
          <p className="text-sm text-base-content/70">
            Add the work covered by the quote and any internal notes.
          </p>
        </div>
        <MarkdownEditor />
        <SimpleTextArea
          label="Notes"
          rows={3}
          placeholder="Payment terms or other notes..."
          {...methods.register("notes")}
        />
      </div>
    </div>
  );
}
