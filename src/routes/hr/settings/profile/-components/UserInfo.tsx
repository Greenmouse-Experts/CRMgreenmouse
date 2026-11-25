import { Camera, Shield, User } from "lucide-react";
import type { StaffProfile } from "@/api/tenantApi";

export default function UserInfo({
  profile,
  avatar,
  onAvatarClick,
}: {
  profile: StaffProfile;
  avatar?: string | null;
  onAvatarClick?: () => void;
}) {
  const fullName =
    [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim() ||
    profile.companyName ||
    "Staff profile";
  const roleLabel = profile.role?.name || profile.userType;
  const companyLabel = profile.tenant?.companyName || profile.companyName;

  return (
    <div className="flex items-center gap-4 rounded-box bg-base-100 p-5 shadow-sm">
      <button
        type="button"
        onClick={onAvatarClick}
        disabled={!onAvatarClick}
        aria-label="Change profile photo"
        className="group relative flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-default"
      >
        {avatar ? (
          <img
            src={avatar}
            alt=""
            className="size-full rounded-xl object-cover"
          />
        ) : (
          <User className="size-7" aria-hidden="true" />
        )}
        {onAvatarClick && (
          <span className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-primary text-primary-content shadow-sm transition-transform group-hover:scale-110">
            <Camera className="size-3.5" aria-hidden="true" />
          </span>
        )}
      </button>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="truncate text-xl font-semibold">{fullName}</h1>
          {profile.status && (
            <span className="badge badge-sm bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
              {profile.status}
            </span>
          )}
        </div>
        <p className="truncate text-sm text-base-content/80">{profile.email}</p>
        {(roleLabel || companyLabel) && (
          <p className="mt-1 flex items-center gap-1.5 text-sm text-base-content/80">
            <Shield
              className="size-4 shrink-0 text-primary"
              aria-hidden="true"
            />
            <span className="capitalize">
              {[roleLabel, companyLabel].filter(Boolean).join(" · ")}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
