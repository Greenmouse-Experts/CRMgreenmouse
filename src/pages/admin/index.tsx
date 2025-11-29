import AdminCharts from "./_components/AdminCharts";
import AdminDashStats from "./_components/AdminDashStats";
import AdminRecents from "./_components/AdminRecents";

export default function index() {
  return (
    <div className="space-y-6">
      <AdminDashStats />
      <AdminCharts />
      {/*<AdminRecents />*/}
    </div>
  );
}
