import { Controller, FormProvider, useForm } from "react-hook-form";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import SimpleInput from "@/components/inputs/SimpleInput";
import SimpleTextArea from "@/components/inputs/SimpleTextArea";
import MoneyInput from "@/components/inputs/MoneyInput";
import LocalSelect from "@/components/inputs/LocalSelect";
import { useCreateQuote, useUpdateQuote, type Quote } from "@/api/salesApi";

interface QuoteFormValues {
  date: string;
  expiresAt: string;
  clientName: string;
  amount: number;
  description: string;
  notes: string;
  status: string;
}

function errorMessage(error: unknown) {
  const message = (error as { response?: { data?: { message?: string | string[] } } })
    ?.response?.data?.message;
  return (Array.isArray(message) ? message.join(". ") : message) ||
    "Failed to save quote. Please try again.";
}

export default function QuoteForm({ quote }: { quote?: Quote }) {
  const navigate = useNavigate();
  const createQuote = useCreateQuote();
  const updateQuote = useUpdateQuote();
  const methods = useForm<QuoteFormValues>({
    defaultValues: {
      date: quote?.date?.slice(0, 10) || new Date().toLocaleDateString("en-CA"),
      expiresAt: quote?.expiresAt?.slice(0, 10) || "",
      clientName: quote?.clientName || "",
      amount: Number(quote?.amount) || 0,
      description: quote?.description || "",
      notes: quote?.notes || "",
      status: quote?.status?.toLowerCase() || "draft",
    },
  });
  const isSaving = createQuote.isPending || updateQuote.isPending;
  const status = quote?.status?.toLowerCase();

  const onSubmit = async (values: QuoteFormValues) => {
    const payload = {
      date: values.date,
      expiresAt: values.expiresAt || undefined,
      clientName: values.clientName.trim(),
      amount: Number(values.amount),
      description: values.description.trim(),
      notes: values.notes.trim(),
    };

    try {
      if (quote) {
        await updateQuote.mutateAsync({
          id: quote.id,
          ...payload,
          ...(values.status !== status ? { status: values.status } : {}),
        });
        toast.success("Quote updated successfully.");
      } else {
        await createQuote.mutateAsync({ ...payload, status: values.status });
        toast.success("Quote created successfully.");
      }
      navigate({ to: "/tenant/accounts/quotes" });
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="space-y-6 rounded-2xl border border-base-200 bg-base-100 p-5 shadow-sm sm:p-7"
      >
        <section className="space-y-4">
          <div>
            <h2 className="text-base font-semibold">Quote details</h2>
            <p className="text-sm text-base-content/60">Set the quote dates, amount, and current status.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <SimpleInput
              label="Quote date"
              type="date"
              required
              {...methods.register("date", { required: "Quote date is required" })}
            />
            <SimpleInput
              label="Expiry date"
              type="date"
              min={methods.watch("date")}
              {...methods.register("expiresAt", {
                validate: (value) =>
                  !value || value >= methods.getValues("date") ||
                  "Expiry date must be on or after the quote date",
              })}
            />
            <Controller
              name="amount"
              control={methods.control}
              rules={{
                required: "Amount is required",
                validate: (value) => value > 0 || "Amount must be positive",
              }}
              render={({ field, fieldState }) => (
                <MoneyInput
                  label="Amount"
                  required
                  {...field}
                  error={fieldState.error?.message}
                />
              )}
            />
            <LocalSelect label="Status" {...methods.register("status")}>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="expired">Expired</option>
              {status && !["draft", "pending", "accepted", "rejected", "expired"].includes(status) && (
                <option value={status}>{quote?.status}</option>
              )}
            </LocalSelect>
          </div>
        </section>

        <section className="space-y-4 border-t border-base-200 pt-5">
          <div>
            <h2 className="text-base font-semibold">Client and scope</h2>
            <p className="text-sm text-base-content/60">Describe the work and any terms the client should see.</p>
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
          <div>
            <SimpleTextArea
              label="Description"
              rows={4}
              placeholder="What is this quote for?"
              required
              {...methods.register("description", {
                required: "Description is required",
                validate: (value) => !!value.trim() || "Description is required",
              })}
            />
            {methods.formState.errors.description && (
              <p className="mt-1 text-sm text-error">{methods.formState.errors.description.message}</p>
            )}
          </div>
          <SimpleTextArea
            label="Notes / terms"
            rows={4}
            placeholder="Optional payment terms or other notes"
            {...methods.register("notes")}
          />
        </section>

        <div className="flex justify-end gap-3 border-t border-base-200 pt-5">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => navigate({ to: "/tenant/accounts/quotes" })}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSaving}>
            {isSaving ? "Saving..." : quote ? "Save changes" : "Create quote"}
          </button>
        </div>
      </form>
    </FormProvider>
  );
}
