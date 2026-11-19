import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/Headers/PageHeader";
import StatCard from "@/components/StatCard";
import ReportCard from "./-components/ReportCard";
import ReportDetailView from "./-components/ReportDetailView";
import { HR_REPORTS } from "./-components/reportsData";
import type { ReportItem } from "./-components/types";
import {
  CalendarCheck,
  CircleDollarSign,
  FileSpreadsheet,
  Search,
  Users,
} from "lucide-react";

export const Route = createFileRoute("/hr/reports/")({
  component: RouteComponent,
});

const CATEGORIES = [
  "All",
  "People",
  "Operations",
  "Finance",
  "Growth",
  "Compliance",
];

function RouteComponent() {
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredReports = HR_REPORTS.filter((report) => {
    if (selectedCategory !== "All" && report.category !== selectedCategory) {
      return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        report.title.toLowerCase().includes(q) ||
        report.desc.toLowerCase().includes(q) ||
        (report.category && report.category.toLowerCase().includes(q))
      );
    }
    return true;
  });

  if (selectedReport) {
    return (
      <div className="pb-12">
        <ReportDetailView
          report={selectedReport}
          allReports={HR_REPORTS}
          onBack={() => setSelectedReport(null)}
          onSelectOtherReport={(r) => setSelectedReport(r)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <PageHeader
        title="Reports & Analytics"
        description="Workspace · Workforce metrics, attendance, leave, payroll and compliance analytics."
      />

      {/* Top 4 Overview Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Standard Reports"
          value={HR_REPORTS.length}
          desc="Automated real-time modules"
          icon={<FileSpreadsheet className="size-5" />}
          variant="primary"
        />
        <StatCard
          title="Active Headcount"
          value="261"
          desc="+4.2% growth over 6 months"
          icon={<Users className="size-5" />}
          variant="info"
        />
        <StatCard
          title="Monthly Payroll"
          value="₦16.7M"
          desc="November calculated total"
          icon={<CircleDollarSign className="size-5" />}
          variant="success"
        />
        <StatCard
          title="Weekly Attendance"
          value="94.1%"
          desc="Avg. 11 late arrivals / day"
          icon={<CalendarCheck className="size-5" />}
          variant="warning"
        />
      </div>

      {/* Search and Category Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                selectedCategory === cat
                  ? "bg-primary text-white shadow-2xs"
                  : "bg-base-100 border border-base-200 text-base-content/60 hover:bg-base-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search report titles or metrics..."
            className="input input-sm input-bordered w-full pl-9 text-xs rounded-xl bg-base-100"
          />
        </div>
      </div>

      {/* 9 Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredReports.map((report) => (
          <ReportCard
            key={report.slug}
            report={report}
            onSelectReport={(r) => setSelectedReport(r)}
          />
        ))}
      </div>
    </div>
  );
}
