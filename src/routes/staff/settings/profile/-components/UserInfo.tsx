import { Briefcase, Camera, User } from "lucide-react";
import type { EmployeeRecord } from "@/api/employeesApi";
import type { StaffProfile } from "@/api/tenantApi";

function resolveName(
  value?: { name?: string; title?: string } | string | null,
): string | undefined {
  if (!value) return undefined;
  if (typeof value === "string") return value.trim() || undefined;
  return value.name?.trim() || value.title?.trim() || undefined;
}

export default function UserInfo({
  employee,
  staff,
  avatar,
  onAvatarClick,
}: {
  employee?: EmployeeRecord | null;
  staff?: StaffProfile | null;
  avatar?: string | null;
  onAvatarClick?: () => void;
}) {
  const firstName = employee?.firstName ?? staff?.firstName;
  const middleName = employee?.middleName;
  const lastName = employee?.lastName ?? staff?.lastName;
  const fullName =
    [firstName, middleName, lastName].filter(Boolean).join(" ").trim() ||
    staff?.companyName ||
    "Staff profile";

  const email = employee?.email || staff?.email || "";
  const status =
    employee?.lifecycleStatus ||
    employee?.employmentStatus ||
    employee?.status ||
    staff?.status;
  const positionLabel =
    employee?.jobTitle ||
    employee?.positionName ||
    resolveName(employee?.position) ||
    staff?.role?.name ||
    staff?.userType;
  const departmentLabel =
    employee?.departmentName || resolveName(employee?.department);
  const companyLabel =
    employee?.tenant?.companyName ||
    staff?.tenant?.companyName ||
    staff?.companyName;

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
          {status && (
            <span className="badge badge-sm border border-emerald-200 bg-emerald-50 text-emerald-700 capitalize">
              {String(status).replace(/_/g, " ")}
            </span>
          )}
          {employee?.employeeNumber && (
            <span className="badge badge-sm badge-ghost font-mono">
              {employee.employeeNumber}
            </span>
          )}
        </div>
        {email && (
          <p className="truncate text-sm text-base-content/80">{email}</p>
        )}
        {(positionLabel || departmentLabel || companyLabel) && (
          <p className="mt-1 flex items-center gap-1.5 text-sm text-base-content/80">
            <Briefcase
              className="size-4 shrink-0 text-primary"
              aria-hidden="true"
            />
            <span className="capitalize">
              {[positionLabel, departmentLabel, companyLabel]
                .filter(Boolean)
                .join(" · ")}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
