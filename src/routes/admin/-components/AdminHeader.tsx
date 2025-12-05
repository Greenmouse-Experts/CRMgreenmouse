import { Menu } from "lucide-react";
import AdminUserProfile from "./AdminUserProfile";

export default function AdminHeader() {
  return (
    <div className="h-20 px-4 flex bg-base-100 shadow-xs items-center">
      <label
        htmlFor="admin-drawer"
        className="btn btn-square btn-ghost lg:hidden"
      >
        <Menu />
      </label>
      <h2 className="text-current/80 font-bold text-sm">
        Super Admin DashBoard
      </h2>
      <div className="ml-auto">
        <AdminUserProfile />
      </div>
    </div>
  );
}
