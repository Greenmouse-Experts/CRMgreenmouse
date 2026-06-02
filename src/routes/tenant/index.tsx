import { createFileRoute } from "@tanstack/react-router";
import AdminCharts from "./-components/TenantCharts";
import TenantDashStats from "./-components/TenantDashStats";
import AdminUserList from "./-components/AdminUserList";
import DashStats from "./-components/DashStats";
import AdminRecents from "./-components/AdminRecents";
import AdminMonthly from "./-components/AdminMonthly";
import apiClient from "@/client/api";

export const Route = createFileRoute("/tenant/")({
  component: RouteComponent,
});

function RouteComponent() {
  // return (
  //   <>
  //     <button
  //       className="btn btn-primary"
  //       onClick={() => {
  //         return apiClient.get("/tenant/auth/me");
  //         return apiClient.get("/tenant/onboarding");
  //       }}
  //     >
  //       Status
  //     </button>
  //   </>
  // );
  return (
    <div className="pb-12 space-y-4">
      {/*<PageHeader />*/}
      <TenantDashStats />
      <AdminCharts />
      <DashStats />
      <AdminRecents />
      <AdminMonthly />
      <AdminUserList />
    </div>
  );
}
