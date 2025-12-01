import AdminRecents from "./AdminRecents";
import AdminWallet from "./AdminWallet";
import AreaChartExample from "./charts/AreaChart";
import PieChartExample from "./charts/PieChart";

export default function AdminCharts() {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-[300px] w-full   grid lg:grid-cols-3 gap-4 py-4 px-6">
      <div className="  col-span-3 lg:col-span-2  space-y-8 ">
        <div className="h-[200px] bg-primary rounded-xl shadow flex items-center  text-primary-content px-8 relative w-full ">
          <div className="space-y-4 mt-5">
            <div className="bg-secondary/20   text-white font-bold rounded-md p-2 text-sm w-fit">
              {currentDate}
            </div>
            <h2 className="text-4xl font-bold">Welcome, Admin</h2>
            <p className="">Have a great day</p>
          </div>
        </div>
        <div className="space-y-4 p-4 bg-base-100 rounded-box  shadow">
          <p className="mb-2">Total Profit</p>
          <AreaChartExample />
        </div>

        <div className="max-w-fit">{/*<AdminRecents />*/}</div>
      </div>
      <section className=" col-span-3 lg:col-span-1 space-y-6">
        {/*<AdminWallet />*/}

        <PieChartExample />
      </section>
    </div>
  );
}
