import { createFileRoute } from "@tanstack/react-router";
import AdminCharts from "./_components/AdminCharts";
import AdminDashStats from "./_components/AdminDashStats";
import AdminUserList from "./_components/AdminUserList";

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
