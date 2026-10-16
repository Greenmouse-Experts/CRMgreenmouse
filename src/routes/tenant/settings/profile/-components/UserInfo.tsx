import { Building2, MapPin } from "lucide-react";
import type { TenantProfile } from "@/api/tenantApi";

export default function UserInfo({
  profile,
  logo,
}: {
  profile: TenantProfile;
  logo?: string | null;
}) {
  const location = [
    profile.companyCity,
    profile.companyState,
    profile.companyCountry,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="flex items-center gap-4 rounded-box bg-base-100 p-5 shadow-sm">
      <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {logo ? (
          <img
            src={logo}
            alt=""
            className="size-full rounded-xl object-contain p-1"
          />
        ) : (
          <Building2 className="size-7" aria-hidden="true" />
        )}
      </div>
      <div className="min-w-0">
        <h1 className="truncate text-xl font-semibold">
          {profile.companyName || "Company profile"}
        </h1>
        <p className="truncate text-sm text-base-content/70">{profile.email}</p>
        {location && (
          <p className="mt-1 flex items-center gap-1 text-sm text-base-content/70">
            <MapPin className="size-4 shrink-0" aria-hidden="true" /> {location}
          </p>
        )}
      </div>
    </div>
  );
}
