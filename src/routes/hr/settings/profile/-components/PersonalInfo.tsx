import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { MyEmployeeProfileUpdate } from "@/api/employeesApi";
import SimplePhoneInput from "@/components/inputs/SimplePhoneInput";

interface Props {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  register: UseFormRegister<MyEmployeeProfileUpdate>;
  errors: FieldErrors<MyEmployeeProfileUpdate>;
  disabled: boolean;
}

function formatDate(value?: string): string {
  if (!value) return "";
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return value;
  return new Date(parsed).toLocaleDateString();
}

export default function PersonalInfo({
  firstName,
  middleName,
  lastName,
  email,
  dateOfBirth,
  gender,
  nationality,
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
          Update your contact details. Name and email are managed by HR.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">First name</span>
          <input
            className="input input-bordered w-full"
            value={firstName ?? ""}
            disabled
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Last name</span>
          <input
            className="input input-bordered w-full"
            value={lastName ?? ""}
            disabled
          />
        </label>
        {middleName && (
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Middle name</span>
            <input
              className="input input-bordered w-full"
              value={middleName}
              disabled
            />
          </label>
        )}
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
          {...register("phone")}
          error={errors.phone}
        />
        <label className="block space-y-1.5 md:col-span-2">
          <span className="text-sm font-medium">Residential address</span>
          <input
            className={`input input-bordered w-full ${errors.residentialAddress ? "input-error" : ""}`}
            autoComplete="street-address"
            placeholder="Enter your residential address"
            disabled={disabled}
            {...register("residentialAddress")}
          />
          {errors.residentialAddress && (
            <span className="text-sm text-error">
              {errors.residentialAddress.message}
            </span>
          )}
        </label>
        {dateOfBirth && (
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Date of birth</span>
            <input
              className="input input-bordered w-full"
              value={formatDate(dateOfBirth)}
              disabled
            />
          </label>
        )}
        {gender && (
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Gender</span>
            <input
              className="input input-bordered w-full capitalize"
              value={gender}
              disabled
            />
          </label>
        )}
        {nationality && (
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Nationality</span>
            <input
              className="input input-bordered w-full"
              value={nationality}
              disabled
            />
          </label>
        )}
      </div>
    </section>
  );
}
