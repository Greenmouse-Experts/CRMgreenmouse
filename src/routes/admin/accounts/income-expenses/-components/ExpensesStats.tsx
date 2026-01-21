import { Wallet, TrendingUp, TrendingDown, PiggyBank } from "lucide-react";

export default function ExpensesStat() {
  const data = [
    {
      title: "Total Balance",
      value: 100234,
      icon: Wallet,
      colorClass: "text-primary",
    },
    {
      title: "Income",
      value: 1234,
      icon: TrendingUp,
      colorClass: "text-success",
    },
    {
      title: "Expense",
      value: 1234,
      icon: TrendingDown,
      colorClass: "text-error",
    },
    { title: "Profit", value: 1234, icon: PiggyBank, colorClass: "text-info" },
  ] as const;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {data.map((item) => {
        const IconComponent = item.icon; // Assign the icon component
        return (
          <div
            key={item.title}
            className={`card bg-base-100 shadow-sm rounded-xl overflow-hidden
                       border-l-4 ${item.colorClass}
                       transition-all duration-300 hover:shadow-xl hover:scale-[1.02]`}
          >
            <div className="p-4 flex flex-col gap-3">
              <div className="flex items-center gap-3 text-base-content/80">
                <IconComponent className="h-6 w-6" /> {/* Render Lucide icon */}
                <span className="text-sm font-semibold">{item.title}</span>
              </div>
              <span
                className={`text-3xl font-extrabold mt-1 text-base-content`}
              >
                {item.value.toLocaleString()}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
