
import { Wallet, TrendingUp, TrendingDown, PiggyBank } from "lucide-react";
import type { IncomeRecord, ExpenseRecord } from "@/api/financeApi";

interface ExpensesStatProps {
  incomeList?: IncomeRecord[];
  expenseList?: ExpenseRecord[];
}

export default function ExpensesStat({ incomeList = [], expenseList = [] }: ExpensesStatProps) {
  const totalIncome = incomeList.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const totalExpense = expenseList.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const netBalance = totalIncome - totalExpense;

  const data = [
    {
      title: "Net Balance",
      value: `₦${netBalance.toLocaleString()}`,
      icon: Wallet,
      colorClass: netBalance >= 0 ? "border-primary text-primary" : "border-error text-error",
      bgClass: netBalance >= 0 ? "bg-primary/10" : "bg-error/10",
      description: "Net cash position",
    },
    {
      title: "Total Income",
      value: `₦${totalIncome.toLocaleString()}`,
      icon: TrendingUp,
      colorClass: "border-success text-success",
      bgClass: "bg-success/10",
      description: `${incomeList.length} records recorded`,
    },
    {
      title: "Total Expenses",
      value: `₦${totalExpense.toLocaleString()}`,
      icon: TrendingDown,
      colorClass: "border-error text-error",
      bgClass: "bg-error/10",
      description: `${expenseList.length} expenses tracked`,
    },
    {
      title: "Net Cashflow",
      value: netBalance >= 0 ? `+₦${netBalance.toLocaleString()}` : `-₦${Math.abs(netBalance).toLocaleString()}`,
      icon: PiggyBank,
      colorClass: "border-info text-info",
      bgClass: "bg-info/10",
      description: netBalance >= 0 ? "Operating surplus" : "Operating deficit",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {data.map((item) => {
        const IconComponent = item.icon;
        return (
          <div
            key={item.title}
            className={`card bg-base-100/70 backdrop-blur-md border border-base-200 shadow-sm rounded-xl overflow-hidden
                       border-l-4 ${item.colorClass}
                       transition-all duration-300 hover:shadow-md hover:scale-[1.01]`}
          >
            <div className="p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-base-content/60">
                  {item.title}
                </span>
                <div className={`p-2 rounded-lg ${item.bgClass} ${item.colorClass}`}>
                  <IconComponent className="h-5 w-5" />
                </div>
              </div>
              <span className="text-2xl font-extrabold text-base-content mt-1">
                {item.value}
              </span>
              <span className="text-xs text-base-content/50">
                {item.description}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
