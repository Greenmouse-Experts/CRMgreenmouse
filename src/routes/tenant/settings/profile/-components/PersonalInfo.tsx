import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { TenantProfileUpdate } from "@/api/tenantApi";
import SimplePhoneInput from "@/components/inputs/SimplePhoneInput";

interface Props {
  email: string;
  register: UseFormRegister<TenantProfileUpdate>;
  errors: FieldErrors<TenantProfileUpdate>;
  disabled: boolean;
}

export default function PersonalInfo({
  email,
  register,
  errors,
  disabled,
}: Props) {
  return (
    <section
      className="space-y-5 rounded-box bg-base-100 p-5 shadow-sm"
      aria-labelledby="profile-business-title"
    >
      <div>
        <h2 id="profile-business-title" className="text-lg font-semibold">
          Business information
        </h2>
        <p className="text-sm text-base-content/70">
          Update the details shown on your company profile.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Company name</span>
          <input
            className={`input input-bordered w-full ${errors.companyName ? "input-error" : ""}`}
            disabled={disabled}
            aria-invalid={!!errors.companyName}
            {...register("companyName", {
              required: "Company name is required",
            })}
          />
          {errors.companyName && (
            <span className="text-sm text-error">
              {errors.companyName.message}
            </span>
          )}
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Email address</span>
          <input
            className="input input-bordered w-full"
            type="email"
            value={email}
            disabled
            aria-describedby="profile-email-help"
          />
          <span
            id="profile-email-help"
            className="block text-xs text-base-content/70"
          >
            Email is managed separately from profile details.
          </span>
        </label>
        <SimplePhoneInput
          label="Phone number"
          disabled={disabled}
          placeholder="+234 800 000 0000"
          {...register("phoneNumber")}
          error={errors.phoneNumber}
        />
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Company website</span>
          <input
            className={`input input-bordered w-full ${errors.companyWebsite ? "input-error" : ""}`}
            type="url"
            placeholder="https://example.com"
            disabled={disabled}
            aria-invalid={!!errors.companyWebsite}
            {...register("companyWebsite", {
              validate: (value) =>
                !value ||
                /^https?:\/\/\S+$/i.test(value) ||
                "Enter a full URL starting with http:// or https://",
            })}
          />
          {errors.companyWebsite && (
            <span className="text-sm text-error">
              {errors.companyWebsite.message}
            </span>
          )}
        </label>
      </div>
    </section>
  );
}
