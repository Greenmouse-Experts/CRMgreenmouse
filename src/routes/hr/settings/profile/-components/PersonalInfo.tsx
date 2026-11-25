import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { StaffProfileUpdate } from "@/api/tenantApi";
import SimplePhoneInput from "@/components/inputs/SimplePhoneInput";

interface Props {
  email: string;
  roleName?: string;
  register: UseFormRegister<StaffProfileUpdate>;
  errors: FieldErrors<StaffProfileUpdate>;
  disabled: boolean;
}

export default function PersonalInfo({
  email,
  roleName,
  register,
  errors,
  disabled,
}: Props) {
  return (
    <section
      className="space-y-5 rounded-box bg-base-100 p-5 shadow-sm"
      aria-labelledby="profile-personal-title"
    >
      <div>
        <h2 id="profile-personal-title" className="text-lg font-semibold">
          Personal information
        </h2>
        <p className="text-sm text-base-content/80">
          Update the details shown on your staff profile.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">First name</span>
          <input
            className={`input input-bordered w-full ${errors.firstName ? "input-error" : ""}`}
            disabled={disabled}
            aria-invalid={!!errors.firstName}
            {...register("firstName", {
              required: "First name is required",
            })}
          />
          {errors.firstName && (
            <span className="text-sm text-error">
              {errors.firstName.message}
            </span>
          )}
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Last name</span>
          <input
            className={`input input-bordered w-full ${errors.lastName ? "input-error" : ""}`}
            disabled={disabled}
            aria-invalid={!!errors.lastName}
            {...register("lastName", {
              required: "Last name is required",
            })}
          />
          {errors.lastName && (
            <span className="text-sm text-error">
              {errors.lastName.message}
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
        {roleName && (
          <label className="block space-y-1.5 md:col-span-2">
            <span className="text-sm font-medium">Role</span>
            <input
              className="input input-bordered w-full capitalize"
              value={roleName}
              disabled
            />
          </label>
        )}
      </div>
    </section>
  );
}
