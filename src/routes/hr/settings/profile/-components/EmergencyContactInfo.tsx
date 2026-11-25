import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { MyEmployeeProfileUpdate } from "@/api/employeesApi";
import SimplePhoneInput from "@/components/inputs/SimplePhoneInput";

interface Props {
  register: UseFormRegister<MyEmployeeProfileUpdate>;
  errors: FieldErrors<MyEmployeeProfileUpdate>;
  disabled: boolean;
}

export default function EmergencyContactInfo({
  register,
  errors,
  disabled,
}: Props) {
  return (
    <section
      className="space-y-5 rounded-box bg-base-100 p-5 shadow-sm"
      aria-labelledby="profile-emergency-title"
    >
      <div>
        <h2 id="profile-emergency-title" className="text-lg font-semibold">
          Emergency contact
        </h2>
        <p className="text-sm text-base-content/80">
          Who HR should reach in case of an emergency.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Contact name</span>
          <input
            className={`input input-bordered w-full ${errors.emergencyContactName ? "input-error" : ""}`}
            placeholder="Full name"
            disabled={disabled}
            {...register("emergencyContactName")}
          />
          {errors.emergencyContactName && (
            <span className="text-sm text-error">
              {errors.emergencyContactName.message}
            </span>
          )}
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Relationship</span>
          <input
            className={`input input-bordered w-full ${errors.emergencyContactRelationship ? "input-error" : ""}`}
            placeholder="e.g. Spouse, Parent, Sibling"
            disabled={disabled}
            {...register("emergencyContactRelationship")}
          />
          {errors.emergencyContactRelationship && (
            <span className="text-sm text-error">
              {errors.emergencyContactRelationship.message}
            </span>
          )}
        </label>
        <div className="md:col-span-2">
          <SimplePhoneInput
            label="Emergency contact phone"
            disabled={disabled}
            placeholder="+234 800 000 0000"
            {...register("emergencyContactPhone")}
            error={errors.emergencyContactPhone}
          />
        </div>
      </div>
    </section>
  );
}
