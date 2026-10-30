import { Bell, Menu } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getUnreadCount } from "@/api/notifications-api";
import TenantUserProfile from "./TenantUserProfile";
import { useAuth } from "@/store/authStore";

export default function AdminHeader() {
  const [auth] = useAuth();
  const unreadQuery = useQuery({
    queryKey: ["tenant-notifications-count"],
    queryFn: getUnreadCount,
    refetchInterval: 60_000,
  });
  const unreadCount = unreadQuery.data ?? 0;

  return (
    <div className="h-18 px-4 flex sticky top-0 bg-base-100 border-b border-current/10 shadow z-20 items-center">
      <label
        htmlFor="tenant-drawer"
        className="btn btn-square btn-ghost lg:hidden"
        aria-label="Open menu"
      >
        <Menu />
      </label>
      <h2 className="text-current/80 font-semibold text-md md:text-xl">
        {auth?.user.userType === "staff"
          ? "Staff Dashboard"
          : "Tenant Dashboard"}
      </h2>
      <div className="ml-auto flex items-center gap-2">
        <Link
          to="/tenant/notifications"
          className="btn btn-ghost btn-circle relative"
          aria-label={
            unreadCount > 0
              ? `Notifications, ${unreadCount} unread`
              : "Notifications"
          }
        >
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span className="badge badge-error badge-xs absolute -right-1 -top-1 min-w-5 px-1 text-error-content">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Link>
        <TenantUserProfile />
      </div>
    </div>
  );
}
