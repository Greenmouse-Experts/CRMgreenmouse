import { Building2, Camera, MapPin } from "lucide-react";
import type { TenantProfile } from "@/api/tenantApi";

export default function UserInfo({
  profile,
  logo,
  onLogoClick,
}: {
  profile: TenantProfile;
  logo?: string | null;
  onLogoClick: () => void;
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
      <button
        type="button"
        onClick={onLogoClick}
        aria-label="Change company logo"
        className="group relative flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        {logo ? (
          <img
            src={logo}
            alt=""
            className="size-full rounded-xl object-contain p-1"
          />
        ) : (
          <Building2 className="size-7" aria-hidden="true" />
        )}
        <span className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-primary text-primary-content shadow-sm transition-transform group-hover:scale-110">
          <Camera className="size-3.5" aria-hidden="true" />
        </span>
      </button>
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
