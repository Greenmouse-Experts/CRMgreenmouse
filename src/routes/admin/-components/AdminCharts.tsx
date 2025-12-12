import AreaChartExample from "./charts/AreaChart";
import PieChartExample from "./charts/PieChart";

export default function AdminCharts() {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-[300px] w-full   grid lg:grid-cols-3 gap-4 py-4 ">
      <div className="bg-linear-30 from-accent to-primary/60 bg-accent rounded-xl shadow flex flex-col justify-center text-accent-content p-6 relative w-full col-span-3 ">
        <div className="space-y-2 sm:space-y-2">
          <div className="bg-accent/20 text-accent-content/80 font-bold rounded-md p-2 text-xs sm:text-sm w-fit">
            {currentDate}
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold">Welcome, Admin</h2>
          <p className="text-sm sm:text-base">Have a great day</p>
        </div>
      </div>
      <div className="  col-span-3 lg:col-span-2  space-y-8 ">
        <div className="space-y-4 p-4  flex flex-col bg-base-100 rounded-box ring ring-current/10  shadow">
          <p className="mb-2 font-bold text-xl">Total Profit</p>
          <AreaChartExample />
        </div>
        <div className="max-w-fit">{/*<AdminRecents />*/}</div>
      </div>
      <section className=" col-span-3 lg:col-span-1 space-y-6 ring ring-current/10 rounded-box">
        {/*<AdminWallet />*/}

        <PieChartExample />
      </section>
    </div>
  );
}
