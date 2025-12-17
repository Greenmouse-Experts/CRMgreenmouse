export default function AdminMonthly() {
  const balance = 20405953;

  const balanceDetails = [
    {
      label: "Income Today",
      value: 0.0,
      type: "income",
    },
    {
      label: "Expense Today",
      value: 9400.0,
      type: "expense",
    },
    {
      label: "Income This Month",
      value: 45000.0,
      type: "income",
    },
    {
      label: "Expense This Month",
      value: 40900.0,
      type: "expense",
    },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <SimpleContainer fade title="Income vs Expense (Month)">
        <div className="ring bg-base-100 ring-current/20 rounded-b-box h-full">
          <TwoLevelPieChart />
        </div>
      </SimpleContainer>
      <SimpleContainer fade title="Balance">
        <div className="ring bg-base-100 ring-current/20 h-[420px] rounded-b-box p-6 flex flex-col">
          <h2 className="text-center text-5xl font-extrabold mb-6 text-primary">
            ${balance.toLocaleString()}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2  grow overflow-hidden ring rounded-box ring-current/10">
            {balanceDetails.map((item, index) => (
              <div
                key={index}
                className="flex flex-col items-center p-4 bg-base-100 ring ring-current/20 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg justify-center text-center"
              >
                <span
                  className={`text-xl font-bold ${
                    item.type === "income" ? "text-success" : "text-error"
                  }`}
                >
                  $
                  {item.value.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
                <span className="text-sm text-base-content/70 mt-1">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </SimpleContainer>
    </div>
  );
}

import SimpleContainer from "@/components/SimpleContainer";
import { Cell, Pie, PieChart } from "recharts";

// #region Sample data
const data01 = [
  {
    name: "Income",
    value: 10000,
    color: "var(--color-primary)",
    badge: "badge-primary",
  },
  {
    name: "Expense",
    value: 4000,
    color: "var(--color-error)",
    badge: "badge-error",
  },
];

// #endregion
function TwoLevelPieChart({
  isAnimationActive = true,
}: {
  isAnimationActive?: boolean;
}) {
  return (
    <div className="size-full relative">
      <div className="absolute top-0 left-0 mt-4 flex gap-2 px-4 ">
        {data01.map((item, index) => (
          <span
            key={`label-${item.name}`}
            className={`badge ${item.badge} badge-soft ring ring-current/50 `}
          >
            {item.name}
          </span>
        ))}
      </div>
      <PieChart
        // style={{
        //   width: "100%",
        //   height: "100%",
        //   // maxWidth: "500px",
        //   maxHeight: "80vh",
        //   aspectRatio: 1,
        // }}
        responsive
        className="!h-[420px] "
      >
        <Pie
          data={data01}
          dataKey="value"
          // cx="50%"
          // cy="50%"
          // outerRadius="50%"
          fill="#8884d8"
          isAnimationActive={isAnimationActive}
        >
          {data01.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
      </PieChart>
    </div>
  );
}
