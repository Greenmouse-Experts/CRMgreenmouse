import { useAuth, useProfile } from "@/store/authStore";
import { useLogout } from "@/helpers/auth";
import { Link } from "@tanstack/react-router";
import { Building2, LogOut, Settings, UserCircle } from "lucide-react";
import logoutApi from "@/client/logout";
import apiClient from "@/client/api";
import { useTenantOnboarding } from "@/api/tenantApi";

export default function TenantUserProfile() {
  const [auth] = useAuth();
  const [profile] = useProfile();
  const isStaff = auth?.user.userType === "staff";
  const { data: onboarding } = useTenantOnboarding(!isStaff);
  const { logout } = useLogout(
    isStaff
      ? async () => (await apiClient.post("/auth/logout")).data
      : logoutApi,
    isStaff ? "/auth/staff" : "/auth/login",
  );
  const displayName = isStaff
    ? `${auth?.user.firstName ?? ""} ${auth?.user.lastName ?? ""}`.trim() ||
      "Staff User"
    : profile?.companyName || auth?.user.companyName || "Tenant User";
  const displayRole = isStaff ? "Staff" : profile?.userType || "Tenant";
  const email = isStaff ? auth?.user.email : profile?.email || auth?.user.email;

  return (
    <div className="flex items-center border-l pl-4 ml-2 border-current/30">
      <div className="mr-2 md:flex flex-col text-sm text-right hidden font-semibold">
        <span className="truncate max-w-[150px]">{displayName}</span>
        <span className="text-base-content/70 text-xs capitalize">
          {displayRole}
        </span>
      </div>
      <div className="dropdown dropdown-end">
        <div className="flex gap-2 items-center">
          <button
            className="btn btn-circle size-8 ring ring-primary/20 p-0 overflow-hidden"
            aria-label="Open profile menu"
          >
            {!isStaff && onboarding?.logo ? (
              <img
                src={onboarding.logo}
                className="size-full object-contain"
                alt="Company logo"
              />
            ) : (
              <Building2 className="size-4" aria-hidden="true" />
            )}
          </button>
        </div>
        <ul className="dropdown-content rounded-box bg-base-100 shadow-xl border border-base-200 min-w-[200px] w-auto menu m-1 p-2 gap-1 z-50">
          <li className="px-4 py-2 border-b border-base-200 mb-1">
            <div className="flex flex-col gap-0.5 overflow-hidden">
              <span className="text-sm font-semibold truncate">
                {displayName}
              </span>
              <span className="text-xs opacity-60 truncate">{email}</span>
            </div>
          </li>
          {!isStaff && (
            <li>
              <Link
                to="/tenant/settings/profile"
                className="flex items-center gap-2 py-2"
              >
                <UserCircle size={16} />
                Profile
              </Link>
            </li>
          )}
          <li>
            <Link
              to={
                isStaff ? "/tenant/settings/notifications" : "/tenant/settings"
              }
              className="flex items-center gap-2 py-2"
            >
              <Settings size={16} />
              Settings
            </Link>
          </li>
          <div className="divider my-0 opacity-50"></div>
          <li>
            <button
              onClick={() => logout()}
              className="flex items-center gap-2 py-2 text-error hover:bg-error/10 hover:text-error active:bg-error/20"
            >
              <LogOut size={16} />
              Logout
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
