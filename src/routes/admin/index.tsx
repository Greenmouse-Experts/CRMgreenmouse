import { createFileRoute } from "@tanstack/react-router";
import AdminCharts from "./-components/AdminCharts";
import AdminDashStats from "./-components/AdminDashStats";
import AdminUserList from "./-components/AdminUserList";
import DashStats from "./-components/DashStats";
import AdminRecents from "./-components/AdminRecents";
import AdminMonthly from "./-components/AdminMonthly";

export const Route = createFileRoute("/admin/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="pb-12 space-y-4">
      {/*<PageHeader />*/}
      <AdminDashStats />
      <AdminCharts />
      <DashStats />
      <AdminRecents />
      <AdminMonthly />
      <AdminUserList />
    </div>
  );
}
