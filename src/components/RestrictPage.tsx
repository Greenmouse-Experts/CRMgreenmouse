import { useAuth, type AuthUser } from "@/store/authStore";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";

interface RestrictPageProps {
  allowedTypes: string | readonly string[];
  fallbackTo?: string;
  children: ReactNode;
}

export function resolveAccountPortalType(
  auth: AuthUser | null | undefined,
): string | null {
  const user = auth?.user;
  if (!user) return null;

  const roleName = user.role?.name?.trim().toLowerCase() ?? "";
  const userType = user.userType?.trim().toLowerCase() ?? "";

  if (roleName === "hr" || userType.includes("hr")) {
    return "hr";
  }
  if (roleName === "staff" || userType.includes("staff")) {
    return "staff";
  }
  return userType || roleName || null;
}

export function isAccountAllowed(
  auth: AuthUser | null | undefined,
  allowedTypes: string | readonly string[] | null | undefined,
): boolean {
  if (!auth?.user || !allowedTypes) return false;

  const normalizedAllowed = (
    Array.isArray(allowedTypes) ? allowedTypes : [allowedTypes]
  )
    .map((item) => item?.trim().toLowerCase())
    .filter(Boolean);

  if (normalizedAllowed.length === 0) return false;

  const resolvedType = resolveAccountPortalType(auth);
  if (!resolvedType) return false;

  if (normalizedAllowed.includes(resolvedType)) {
    return true;
  }

  const roleName = auth.user.role?.name?.trim().toLowerCase();
  if (roleName && normalizedAllowed.includes(roleName)) {
    return true;
  }

  return false;
}

export function getDefaultDashboardRoute(
  auth: AuthUser | null | undefined,
): string {
  const portalType = resolveAccountPortalType(auth);
  if (portalType === "hr") return "/hr";
  if (portalType === "staff") return "/staff";
  if (portalType === "tenant") return "/tenant";
  if (portalType === "admin") return "/admin";
  return "/auth/login";
}

export default function RestrictPage({
  allowedTypes,
  fallbackTo,
  children,
}: RestrictPageProps) {
  const [auth] = useAuth();
  const navigate = useNavigate();

  if (isAccountAllowed(auth, allowedTypes)) {
    return <>{children}</>;
  }

  const destination = fallbackTo ?? getDefaultDashboardRoute(auth);

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="card w-full max-w-md bg-base-100 border border-base-300 shadow-lg">
        <div className="card-body items-center text-center gap-3 p-8">
          <div className="flex size-12 items-center justify-center rounded-full bg-error/15 text-error">
            <ShieldAlert className="size-6" aria-hidden="true" />
          </div>
          <h1 className="card-title text-xl font-semibold text-base-content">
            Access Restricted
          </h1>
          <p className="text-sm text-base-content/75">
            Your account does not have permission to view this dashboard.
          </p>
          <div className="card-actions mt-2">
            <button
              type="button"
              className="btn btn-error"
              onClick={() => navigate({ to: destination })}
            >
              <ArrowLeft className="size-5" aria-hidden="true" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
