import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { isAxiosError } from "axios";
import { ImagePlus, RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";
import { uploadImage, uploadedFileUrl } from "@/api/imageApi";
import {
  useInvoiceBranding,
  useUpdateInvoiceBranding,
  type InvoiceBrandingConfig,
} from "@/api/financeApi";

type BrandingForm = Required<InvoiceBrandingConfig>;

const toForm = (config?: InvoiceBrandingConfig): BrandingForm => ({
  displayName: config?.displayName ?? "",
  logoUrl: config?.logoUrl ?? "",
  accentColor: config?.accentColor ?? "#1a7c4a",
  footerNotes: config?.footerNotes ?? "",
});

const isWebUrl = (value: string) => {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
};

export default function InvoiceBrandingSettings() {
  const branding = useInvoiceBranding();
  const updateBranding = useUpdateInvoiceBranding();
  const [form, setForm] = useState<BrandingForm>(() => toForm());
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState("");
  const [upgradeRequired, setUpgradeRequired] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (branding.data) setForm(toForm(branding.data));
  }, [branding.data]);

  useEffect(() => {
    if (!logoFile) {
      setLocalPreview("");
      return;
    }
    const url = URL.createObjectURL(logoFile);
    setLocalPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [logoFile]);

  const reset = () => {
    setForm(toForm(branding.data));
    setLogoFile(null);
    if (fileInput.current) fileInput.current.value = "";
    setUpgradeRequired(false);
  };

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const accentColor = form.accentColor.trim();
    const logoUrl = form.logoUrl.trim();
    if (!/^#[0-9a-fA-F]{6}$/.test(accentColor)) {
      toast.error("Enter an accent color in #RRGGBB format.");
      return;
    }
    if (logoUrl && !logoFile && !isWebUrl(logoUrl)) {
      toast.error("Enter a valid logo URL starting with https:// or http://.");
      return;
    }

    setSaving(true);
    setUpgradeRequired(false);
    try {
      let uploadedLogoUrl = logoUrl;
      if (logoFile) {
        uploadedLogoUrl = uploadedFileUrl(await uploadImage(logoFile)) ?? "";
        if (!uploadedLogoUrl)
          throw new Error("The logo upload did not return a URL.");
      }
      await updateBranding.mutateAsync({
        displayName: form.displayName.trim(),
        logoUrl: uploadedLogoUrl,
        accentColor,
        footerNotes: form.footerNotes.trim(),
      });
      setLogoFile(null);
      if (fileInput.current) fileInput.current.value = "";
      setForm((current) => ({ ...current, logoUrl: uploadedLogoUrl }));
      toast.success("Invoice branding saved.");
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 403) {
        setUpgradeRequired(true);
        toast.error("Your plan does not include invoice branding.");
      } else {
        const message = isAxiosError(error)
          ? error.response?.data?.message
          : error instanceof Error
            ? error.message
            : undefined;
        toast.error(message || "Could not save invoice branding. Try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (branding.isPending) {
    return (
      <section
        id="invoice-branding-settings"
        className="rounded-box bg-base-100 p-6"
        role="status"
      >
        <span className="loading loading-spinner loading-sm text-primary" />{" "}
        Loading branding settings…
      </section>
    );
  }

  if (branding.isError) {
    return (
      <section
        id="invoice-branding-settings"
        className="rounded-box bg-base-100 p-6"
        role="alert"
      >
        <p>Invoice branding settings could not be loaded.</p>
        <button
          className="btn btn-outline btn-sm mt-3"
          type="button"
          onClick={() => branding.refetch()}
        >
          Try again
        </button>
      </section>
    );
  }

  const previewUrl =
    localPreview || (isWebUrl(form.logoUrl) ? form.logoUrl : "");

  return (
    <section
      id="invoice-branding-settings"
      className="rounded-box bg-base-100 p-5 shadow-sm sm:p-6"
      aria-labelledby="invoice-branding-title"
    >
      <div className="mb-6">
        <h2 id="invoice-branding-title" className="text-lg font-semibold">
          Invoice branding
        </h2>
        <p className="mt-1 text-sm text-base-content/70">
          Set the name, logo, color, and footer note shown on your invoices.
          Saving requires invoice branding in your plan.
        </p>
      </div>

      {upgradeRequired && (
        <div className="alert alert-warning mb-5" role="alert">
          <span>
            Invoice branding is unavailable on your current plan.{" "}
            <Link className="link font-semibold" to="/tenant/subscription">
              View plans
            </Link>
          </span>
        </div>
      )}

      <form
        onSubmit={save}
        className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_14rem]"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="form-control sm:col-span-2">
            <span className="label mb-1">Display name</span>
            <input
              className="input input-bordered w-full"
              value={form.displayName}
              onChange={(event) =>
                setForm({ ...form, displayName: event.target.value })
              }
              placeholder="Company name on invoices"
              maxLength={120}
            />
          </label>

          <label className="form-control sm:col-span-2">
            <span className="label mb-1">Logo URL</span>
            <input
              className="input input-bordered w-full"
              type="url"
              value={form.logoUrl}
              onChange={(event) => {
                setForm({ ...form, logoUrl: event.target.value });
                setLogoFile(null);
              }}
              placeholder="https://example.com/logo.png"
            />
          </label>

          <label className="form-control sm:col-span-2">
            <span className="label mb-1">Or upload a logo</span>
            <input
              ref={fileInput}
              className="file-input file-input-bordered w-full"
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  if (!file.type.startsWith("image/")) {
                    toast.error("Choose an image file for the logo.");
                    event.target.value = "";
                    return;
                  }
                  setLogoFile(file);
                }
              }}
            />
            <span className="mt-1 text-xs text-base-content/60">
              {logoFile
                ? `${logoFile.name} will be uploaded when you save.`
                : "Upload an image or enter a logo URL."}
            </span>
          </label>

          <label className="form-control sm:col-span-2">
            <span className="label mb-1">Accent color</span>
            <span className="flex gap-2">
              <input
                className="input input-bordered h-10 w-14 cursor-pointer p-1"
                type="color"
                aria-label="Pick accent color"
                value={
                  /^#[0-9a-fA-F]{6}$/.test(form.accentColor)
                    ? form.accentColor
                    : "#1a7c4a"
                }
                onChange={(event) =>
                  setForm({ ...form, accentColor: event.target.value })
                }
              />
              <input
                className="input input-bordered min-w-0 flex-1"
                value={form.accentColor}
                onChange={(event) =>
                  setForm({ ...form, accentColor: event.target.value })
                }
                placeholder="#1a7c4a"
                maxLength={7}
              />
            </span>
          </label>

          <label className="form-control sm:col-span-2">
            <span className="label mb-1">Footer notes</span>
            <textarea
              className="textarea textarea-bordered min-h-24 w-full"
              value={form.footerNotes}
              onChange={(event) =>
                setForm({ ...form, footerNotes: event.target.value })
              }
              placeholder="Payment terms or bank details shown at the bottom of each invoice"
              maxLength={2000}
            />
          </label>
        </div>

        <div className="flex flex-col gap-3">
          <div
            className="flex h-40 items-center justify-center overflow-hidden rounded-box bg-base-200 p-4"
            aria-label="Logo preview"
          >
            {previewUrl ? (
              <img
                className="max-h-full max-w-full object-contain"
                src={previewUrl}
                alt="Invoice logo preview"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-base-content/50">
                <ImagePlus className="size-8" />
                <span className="text-xs">Logo preview</span>
              </div>
            )}
          </div>
          {(form.logoUrl || logoFile) && (
            <button
              className="btn btn-ghost btn-sm self-start"
              type="button"
              onClick={() => {
                setForm({ ...form, logoUrl: "" });
                setLogoFile(null);
                if (fileInput.current) fileInput.current.value = "";
              }}
            >
              Remove logo
            </button>
          )}
        </div>

        <div className="flex flex-wrap justify-end gap-2 lg:col-span-2">
          <button
            className="btn btn-ghost"
            type="button"
            onClick={reset}
            disabled={saving}
          >
            <RotateCcw className="size-4" /> Reset
          </button>
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              <Save className="size-4" />
            )}
            {saving ? "Saving…" : "Save branding"}
          </button>
        </div>
      </form>
    </section>
  );
}
