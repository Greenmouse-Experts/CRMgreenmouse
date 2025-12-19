import { createFileRoute } from "@tanstack/react-router";
import AdminDashStats from "../../-components/AdminDashStats";
import IncomeExpense from "../../-components/charts/IncomeExpense";
import AdminMonthly from "../../-components/AdminMonthly";
import AreaChartExample from "../../-components/charts/AreaChart";
import PieChartExample from "../../-components/charts/PieChart";
import SimpleContainer from "@/components/SimpleContainer";

export const Route = createFileRoute("/admin/accounts/analysis/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <AdminDashStats />
      <IncomeExpense />
      <AdminMonthly />
      <div className="grid grid-cols-3 gap-6">
        <div className="  col-span-3 lg:col-span-2  space-y-8 ">
          <SimpleContainer title="Total Profit">
            <div className="rounded-b-box ring ring-current/20 p-4">
              <AreaChartExample />
            </div>
          </SimpleContainer>
          {/*<div className="max-w-fit"></div>*/}
        </div>
        <section className=" col-span-3 lg:col-span-1  rounded-box">
          <PieChartExample />
        </section>
      </div>
      {/*<AdminUserList />*/}
    </>
  );
}
