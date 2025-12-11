import { Bell, Menu } from "lucide-react";
import AdminUserProfile from "./AdminUserProfile";

export default function AdminHeader() {
  return (
    <div className="h-18 px-4 flex sticky top-0 bg-base-100  border-b border-current/10 shadow z-20 items-center">
      <label
        htmlFor="admin-drawer"
        className="btn btn-square btn-ghost lg:hidden"
      >
        <Menu />
      </label>
      <h2 className="text-current/80 font-bold text-md md:text-xl">
        Super Admin DashBoard
      </h2>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative">
          <span className="absolute top-0 right-0 -mt-1 mr-1 flex h-2 w-2 animate-ping rounded-full bg-error"></span>
          <span className="absolute top-0 right-0 -mt-1 mr-1 flex h-2 w-2 rounded-full bg-error"></span>
          <Bell className="!size-6"></Bell>
        </div>
        <AdminUserProfile />
      </div>
    </div>
  );
}
