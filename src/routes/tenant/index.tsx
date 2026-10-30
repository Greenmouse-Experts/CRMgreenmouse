import { createFileRoute } from "@tanstack/react-router";
import TenantCharts from "./-components/TenantCharts";
import TenantDashStats from "./-components/TenantDashStats";
import AdminUserList from "./-components/AdminUserList";
import DashStats from "./-components/DashStats";
import AdminMonthly from "./-components/AdminMonthly";
import { useAuth } from "@/store/authStore";

export const Route = createFileRoute("/tenant/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [auth] = useAuth();
  const isStaff = auth?.user.userType === "staff";
  return (
    <div className="pb-12 space-y-6">
      <TenantCharts />
      <TenantDashStats />
      <AdminMonthly />
      <DashStats />
      {/*<AdminRecents />*/}
      {!isStaff && <AdminUserList />}
    </div>
  );
}
