import type { UseFormRegister } from "react-hook-form";
import type { TenantProfileUpdate } from "@/api/tenantApi";

export default function AddressInfo({ register, disabled }: {
  register: UseFormRegister<TenantProfileUpdate>;
  disabled: boolean;
}) {
  return (
    <section className="space-y-5 rounded-box bg-base-100 p-5 shadow-sm" aria-labelledby="profile-address-title">
      <div>
        <h2 id="profile-address-title" className="text-lg font-semibold">Company address</h2>
        <p className="text-sm text-base-content/70">Keep your business location current.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-1.5 md:col-span-2">
          <span className="text-sm font-medium">Street address</span>
          <input className="input input-bordered w-full" autoComplete="street-address" disabled={disabled} {...register("companyAddress")} />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">City</span>
          <input className="input input-bordered w-full" autoComplete="address-level2" disabled={disabled} {...register("companyCity")} />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">State or region</span>
          <input className="input input-bordered w-full" autoComplete="address-level1" disabled={disabled} {...register("companyState")} />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Country</span>
          <input className="input input-bordered w-full" autoComplete="country-name" disabled={disabled} {...register("companyCountry")} />
        </label>
      </div>
    </section>
  );
}
