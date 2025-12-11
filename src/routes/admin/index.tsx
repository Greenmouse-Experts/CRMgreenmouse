import { createFileRoute } from "@tanstack/react-router";
import AdminCharts from "./-components/AdminCharts";
import AdminDashStats from "./-components/AdminDashStats";
import AdminUserList from "./-components/AdminUserList";
import PageHeader from "@/components/Headers/PageHeader";

export const Route = createFileRoute("/admin/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <AdminDashStats />
      <AdminCharts />
      <AdminUserList />
    </div>
  );
}
