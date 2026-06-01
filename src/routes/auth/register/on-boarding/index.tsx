import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { useOnboardingStore } from "@/store/onboarding-store";
import apiClient from "@/client/api";

export const Route = createFileRoute("/auth/register/on-boarding/")({
  component: OnboardingWizard,
});

const TOTAL_STEPS = 9;

const INDUSTRIES = [
  { label: "Retail & E-Commerce", color: "bg-pink-50 border-pink-200" },
  { label: "Logistics & Transport", color: "bg-blue-50 border-blue-200" },
  { label: "Banking & Finance", color: "bg-yellow-50 border-yellow-200" },
  { label: "Technology & SaaS", color: "bg-orange-50 border-orange-200" },
  { label: "Healthcare", color: "bg-green-50 border-green-200" },
  { label: "Education", color: "bg-purple-50 border-purple-200" },
  { label: "Manufacturing", color: "bg-indigo-50 border-indigo-200" },
  { label: "Hospitality", color: "bg-red-50 border-red-200" },
  { label: "Energy", color: "bg-teal-50 border-teal-200" },
  { label: "Other", color: "bg-base-200 border-base-300" },
];

const TEAM_SIZES = ["1-10", "11-50", "51-200", "201-500", "500+"];

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT",
  "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi",
  "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo",
  "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

const BUSINESS_TYPES = [
  "Sole Proprietorship",
  "Partnership",
  "Limited Liability Company",
  "Public Limited Company",
  "NGO / Non-Profit",
];

const HEAR_ABOUT_US = [
  "Social Media",
  "Google Search",
  "Friend / Colleague",
  "Advertisement",
  "News / Blog",
  "Other",
];

function OnboardingWizard() {
  const nav = useNavigate();
  const { step, formData, nextStep, prevStep, updateFormData, setStep } =
    useOnboardingStore();

  useQuery({
    queryKey: ["onboarding-status"],
    queryFn: () =>
      apiClient.get("/tenant/onboarding").then((res) => res.data),
    onSuccess: (res: any) => {
      const d = res?.data ?? res;
      if (d) updateFormData(d);
    },
  } as any);

  const patchMutation = useMutation({
    mutationFn: (payload: Partial<typeof formData>) =>
      apiClient.patch("/tenant/onboarding", payload).then((r) => r.data),
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Failed to save progress");
    },
  });

  const completeMutation = useMutation({
    mutationFn: () =>
      apiClient.post("/tenant/onboarding/complete").then((r) => r.data),
    onSuccess: () => {
      toast.success("Onboarding complete! Welcome aboard.");
      nav({ to: "/admin" });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Failed to complete onboarding");
    },
  });

  const advance = async (payload: Partial<typeof formData>) => {
    updateFormData(payload);
    if (step === TOTAL_STEPS) {
      await patchMutation.mutateAsync({ ...formData, ...payload });
      completeMutation.mutate();
    } else {
      patchMutation.mutate({ ...formData, ...payload });
      nextStep();
    }
  };

  const isPending = patchMutation.isPending || completeMutation.isPending;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Kinovia</h1>
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex gap-1.5">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 cursor-pointer ${
                i + 1 === step
                  ? "bg-primary"
                  : i + 1 < step
                    ? "bg-primary/40"
                    : "bg-base-300"
              }`}
              onClick={() => i + 1 < step && setStep(i + 1)}
            />
          ))}
        </div>
        <p className="text-xs text-primary font-medium">
          Step {step} of {TOTAL_STEPS}
        </p>
      </div>

      <StepContent
        step={step}
        formData={formData}
        advance={advance}
        prevStep={prevStep}
        isPending={isPending}
      />
    </div>
  );
}

interface StepProps {
  step: number;
  formData: ReturnType<typeof useOnboardingStore>["formData"];
  advance: (payload: any) => void;
  prevStep: () => void;
  isPending: boolean;
}

function StepContent({ step, formData, advance, prevStep, isPending }: StepProps) {
  switch (step) {
    case 1:
      return <IndustryStep formData={formData} advance={advance} />;
    case 2:
      return (
        <EmailStep formData={formData} advance={advance} prevStep={prevStep} />
      );
    case 3:
      return (
        <LocationStep
          formData={formData}
          advance={advance}
          prevStep={prevStep}
        />
      );
    case 4:
      return (
        <TeamSizeStep
          formData={formData}
          advance={advance}
          prevStep={prevStep}
        />
      );
    case 5:
      return (
        <CompanyWebsiteStep
          formData={formData}
          advance={advance}
          prevStep={prevStep}
        />
      );
    case 6:
      return (
        <CompanyAddressStep
          formData={formData}
          advance={advance}
          prevStep={prevStep}
        />
      );
    case 7:
      return (
        <BusinessTypeStep
          formData={formData}
          advance={advance}
          prevStep={prevStep}
        />
      );
    case 8:
      return (
        <LogoThemeStep
          formData={formData}
          advance={advance}
          prevStep={prevStep}
          isPending={isPending}
        />
      );
    case 9:
      return (
        <HearAboutUsStep
          formData={formData}
          advance={advance}
          prevStep={prevStep}
          isPending={isPending}
        />
      );
    default:
      return null;
  }
}

/* ─────────────────────── Nav helpers ─────────────────────── */

function NextBtn({
  onClick,
  disabled,
  isPending,
  label = "Next",
}: {
  onClick?: () => void;
  disabled?: boolean;
  isPending?: boolean;
  label?: string;
}) {
  return (
    <button
      type={onClick ? "button" : "submit"}
      onClick={onClick}
      disabled={disabled || isPending}
      className="btn btn-primary gap-2 px-6"
    >
      {isPending ? (
        <span className="loading loading-spinner loading-sm" />
      ) : (
        <>
          {label}
          <ArrowRight size={16} />
        </>
      )}
    </button>
  );
}

function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="btn btn-ghost gap-1 px-3"
    >
      <ArrowLeft size={16} />
      Back
    </button>
  );
}

function NavRow({
  onBack,
  isPending,
  label,
  disabled,
}: {
  onBack?: () => void;
  isPending?: boolean;
  label?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between pt-4">
      {onBack ? <BackBtn onClick={onBack} /> : <span />}
      <NextBtn isPending={isPending} label={label} disabled={disabled} />
    </div>
  );
}

/* ─────────────────────── Step 1: Industry ─────────────────────── */

function IndustryStep({
  formData,
  advance,
}: Pick<StepProps, "formData" | "advance">) {
  const selected = formData.industry;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold leading-snug">
          What industry best<br />describes your business?
        </h2>
        <p className="text-sm text-base-content/60">
          This helps us customize your experience
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {INDUSTRIES.map((ind) => (
          <button
            key={ind.label}
            type="button"
            onClick={() => advance({ industry: ind.label })}
            className={`flex items-center gap-2 px-3 py-3 rounded-xl border text-sm font-medium text-left transition-all hover:scale-[1.02] ${ind.color} ${
              selected === ind.label ? "ring-2 ring-primary" : ""
            }`}
          >
            {selected === ind.label && (
              <Check size={14} className="text-primary shrink-0" />
            )}
            {ind.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────── Step 2: Email ─────────────────────── */

function EmailStep({
  formData,
  advance,
  prevStep,
}: Pick<StepProps, "formData" | "advance" | "prevStep">) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = (fd.get("email") as string).trim();
    if (!email) return;
    advance({ email });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold leading-snug">
          What is your company<br />email?
        </h2>
        <p className="text-sm text-base-content/60">
          We'll use this email for account notifications, billing, and
          workspace communication.
        </p>
      </div>

      <div className="space-y-1">
        <input
          name="email"
          type="email"
          defaultValue={formData.email}
          placeholder="Enter your Email"
          required
          className="input input-bordered w-full"
        />
        <p className="text-xs text-primary italic">Ensure this email is valid.</p>
      </div>

      <NavRow onBack={prevStep} />
    </form>
  );
}

/* ─────────────────────── Step 3: Location ─────────────────────── */

function LocationStep({
  formData,
  advance,
  prevStep,
}: Pick<StepProps, "formData" | "advance" | "prevStep">) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    advance({
      companyState: fd.get("companyState") as string,
      companyCity: fd.get("companyCity") as string,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold leading-snug">
          Where is your business<br />located?
        </h2>
        <p className="text-sm text-base-content/60">
          We'll use this to tailor your workspace experience and localization
          settings.
        </p>
      </div>

      <div className="flex gap-3">
        <select
          name="companyState"
          defaultValue={formData.companyState}
          required
          className="select select-bordered flex-1"
        >
          <option value="" disabled>
            Select State
          </option>
          {NIGERIAN_STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <input
          name="companyCity"
          type="text"
          defaultValue={formData.companyCity}
          placeholder="Enter Area"
          required
          className="input input-bordered flex-1"
        />
      </div>

      <NavRow onBack={prevStep} />
    </form>
  );
}

/* ─────────────────────── Step 4: Team Size ─────────────────────── */

function TeamSizeStep({
  formData,
  advance,
  prevStep,
}: Pick<StepProps, "formData" | "advance" | "prevStep">) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const teamSize = fd.get("teamSize") as string;
    if (!teamSize) return;
    advance({ teamSize });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold leading-snug">
          What is your customer<br />size?
        </h2>
        <p className="text-sm text-base-content/60">
          Choose the staff strength that best matches your business operations.
        </p>
      </div>

      <select
        name="teamSize"
        defaultValue={formData.teamSize}
        required
        className="select select-bordered w-full max-w-xs"
      >
        <option value="" disabled>
          Select Staff size
        </option>
        {TEAM_SIZES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <NavRow onBack={prevStep} />
    </form>
  );
}

/* ─────────────────────── Step 5: Website ─────────────────────── */

function CompanyWebsiteStep({
  formData,
  advance,
  prevStep,
}: Pick<StepProps, "formData" | "advance" | "prevStep">) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    advance({
      companyWebsite: fd.get("companyWebsite") as string,
      companyCountry: fd.get("companyCountry") as string,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold leading-snug">
          Your online presence
        </h2>
        <p className="text-sm text-base-content/60">
          Help your customers and team find you easily.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold fieldset-label">
            Company Website
          </label>
          <input
            name="companyWebsite"
            type="url"
            defaultValue={formData.companyWebsite}
            placeholder="https://yourcompany.com"
            className="input input-bordered w-full"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold fieldset-label">
            Country
          </label>
          <input
            name="companyCountry"
            type="text"
            defaultValue={formData.companyCountry}
            placeholder="Nigeria"
            required
            className="input input-bordered w-full"
          />
        </div>
      </div>

      <NavRow onBack={prevStep} />
    </form>
  );
}

/* ─────────────────────── Step 6: Address ─────────────────────── */

function CompanyAddressStep({
  formData,
  advance,
  prevStep,
}: Pick<StepProps, "formData" | "advance" | "prevStep">) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    advance({ companyAddress: fd.get("companyAddress") as string });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold leading-snug">
          What is your business<br />address?
        </h2>
        <p className="text-sm text-base-content/60">
          This appears on invoices and official documents.
        </p>
      </div>

      <textarea
        name="companyAddress"
        defaultValue={formData.companyAddress}
        placeholder="15 Marina Road, Lagos"
        rows={3}
        required
        className="textarea textarea-bordered w-full resize-none"
      />

      <NavRow onBack={prevStep} />
    </form>
  );
}

/* ─────────────────────── Step 7: Business Type ─────────────────────── */

function BusinessTypeStep({
  formData,
  advance,
  prevStep,
}: Pick<StepProps, "formData" | "advance" | "prevStep">) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    advance({
      businessType: fd.get("businessType") as string,
      isCacRegistered: fd.get("isCacRegistered") === "on",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold leading-snug">
          Business registration<br />details
        </h2>
        <p className="text-sm text-base-content/60">
          This helps us provide the right compliance tools for your business.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold fieldset-label">
            Business Type
          </label>
          <select
            name="businessType"
            defaultValue={formData.businessType}
            required
            className="select select-bordered w-full"
          >
            <option value="" disabled>
              Select business type
            </option>
            {BUSINESS_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="isCacRegistered"
            defaultChecked={formData.isCacRegistered}
            className="toggle toggle-primary"
          />
          <span className="text-sm font-medium">
            My business is CAC registered
          </span>
        </label>
      </div>

      <NavRow onBack={prevStep} />
    </form>
  );
}

/* ─────────────────────── Step 8: Logo + Theme ─────────────────────── */

function LogoThemeStep({
  formData,
  advance,
  prevStep,
  isPending,
}: Pick<StepProps, "formData" | "advance" | "prevStep" | "isPending">) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    advance({
      logo: fd.get("logo") as string,
      theme: fd.get("theme") as string,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold leading-snug">
          Personalize your workspace
        </h2>
        <p className="text-sm text-base-content/60">
          Add your logo and choose a theme.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold fieldset-label">
            Logo URL
          </label>
          <input
            name="logo"
            type="url"
            defaultValue={formData.logo}
            placeholder="https://res.cloudinary.com/..."
            className="input input-bordered w-full"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold fieldset-label">Theme</label>
          <div className="flex gap-3">
            {["light", "dark"].map((t) => (
              <label
                key={t}
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer capitalize font-medium text-sm transition-all ${
                  formData.theme === t
                    ? "border-primary bg-primary/5"
                    : "border-base-300"
                }`}
              >
                <input
                  type="radio"
                  name="theme"
                  value={t}
                  defaultChecked={formData.theme === t}
                  className="hidden"
                />
                {t === "light" ? "☀️" : "🌙"} {t}
              </label>
            ))}
          </div>
        </div>
      </div>

      <NavRow onBack={prevStep} isPending={isPending} />
    </form>
  );
}

/* ─────────────────────── Step 9: Hear About Us ─────────────────────── */

function HearAboutUsStep({
  formData,
  advance,
  prevStep,
  isPending,
}: Pick<StepProps, "formData" | "advance" | "prevStep" | "isPending">) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const hearAboutUs = fd.get("hearAboutUs") as string;
    if (!hearAboutUs) return;
    advance({ hearAboutUs });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold leading-snug">
          Last step! How did<br />you find us?
        </h2>
        <p className="text-sm text-base-content/60">
          This helps us understand where to reach more businesses like yours.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {HEAR_ABOUT_US.map((opt) => (
          <label
            key={opt}
            className={`flex items-center gap-2 px-3 py-3 rounded-xl border cursor-pointer text-sm font-medium transition-all hover:border-primary ${
              formData.hearAboutUs === opt
                ? "border-primary bg-primary/5"
                : "border-base-200"
            }`}
          >
            <input
              type="radio"
              name="hearAboutUs"
              value={opt}
              defaultChecked={formData.hearAboutUs === opt}
              className="radio radio-primary radio-sm"
            />
            {opt}
          </label>
        ))}
      </div>

      <NavRow onBack={prevStep} isPending={isPending} label="Complete" />
    </form>
  );
}
