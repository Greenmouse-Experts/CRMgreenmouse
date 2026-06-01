export default function IncomeExpense() {
  return (
    <div className="w-full bg-base-100 ring shadow-lg ring-current/10  rounded-box">
      <div className="p-4 text-xl font-bold text-current/80 h-14 border-b border-base-300 flex items-center">
        Income & Expense
        <div className="text-sm space-x-2 ml-auto font-medium">
          <span className="badge badge-soft ring ring-current badge-primary">
            Income
          </span>
          <span className="badge badge-soft ring ring-current badge-error">
            Expense
          </span>
        </div>
      </div>

      <div className="p-4">
        <SimpleAreaChart />
      </div>
    </div>
  );
}

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const generateRandomData = () => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return months.map((month) => ({
    name: month,
    income: Math.floor(Math.random() * 5000) + 1000, // Random income between 1000 and 6000
    expense: Math.floor(Math.random() * 3000) + 500, // Random expense between 500 and 3500
  }));
};

const data = generateRandomData();

// #endregion
const SimpleAreaChart = () => {
  return (
    <AreaChart
      className="!text-sm bg-base-100"
      style={{
        width: "100%",
        // maxWidth: "700px",
        maxHeight: "70vh",
        aspectRatio: 1.618,
      }}
      responsive
      data={data}
      margin={{
        top: 20,
        right: 0,
        left: 0,
        bottom: 0,
      }}
    >
      <CartesianGrid strokeDasharray="4 4" className="opacity-80" />
      <XAxis dataKey="name" />
      <YAxis width="auto" className="" />
      <Tooltip />
      <Area type="monotone" dataKey="income" fill="var(--color-error)" />
      <Area
        type="monotone"
        dataKey="expense"
        // stroke="#8884d8"
        fill="var(--color-primary)"
      />
    </AreaChart>
  );
};
