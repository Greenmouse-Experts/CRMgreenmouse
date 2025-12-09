import { createFileRoute } from "@tanstack/react-router";
import ExpensesStat from "./-components/ExpensesStats";
import { useTabs, type Tab } from "@/stores/client";
import CustomTabs from "@/components/CustomTabs";
import Incometable from "./-components/IncomeTable";
import ExpenseTable from "./-components/ExpenseTable";

export const Route = createFileRoute("/admin/accounts/income-expenses/")({
  component: RouteComponent,
});

function RouteComponent() {
  const tabs: Tab[] = [
    {
      name: "Income",
    },
    { name: "Expenses" },
  ];
  const tab = useTabs(tabs, { name: "Income" });
  return (
    <section className="space-y-4">
      <ExpensesStat />
      <div className="bg-base-100 shadow rounded-box">
        <CustomTabs tabs={tabs} tabProps={tab}></CustomTabs>
      </div>
      <div className="">
        {tab.tab.name == "Income" ? <Incometable /> : <ExpenseTable />}
      </div>
    </section>
  );
}
