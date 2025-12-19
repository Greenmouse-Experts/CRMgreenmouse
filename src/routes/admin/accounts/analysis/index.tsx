import { createFileRoute } from "@tanstack/react-router";
import AdminDashStats from "../../-components/AdminDashStats";
import IncomeExpense from "../../-components/charts/IncomeExpense";
import AdminMonthly from "../../-components/AdminMonthly";
import AdminUserList from "../../-components/AdminUserList";

export const Route = createFileRoute("/admin/accounts/analysis/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <AdminDashStats />
      <IncomeExpense />
      <AdminMonthly />
      {/*<AdminUserList />*/}
    </>
  );
}
