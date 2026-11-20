import { useState } from "react";
import PageHeader from "@/components/Headers/PageHeader";
import StatCard from "@/components/StatCard";
import CustomTable, { type columnType } from "@/components/tables/CustomTable";
import LocalSelect from "@/components/inputs/LocalSelect";
import ReportChartRenderer from "./ReportChartRenderer";
import type { ReportItem } from "./types";
import { exportReportToCsv } from "./reportsData";
import {
  ArrowLeft,
  Download,
  Info,
  Lightbulb,
  Printer,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface ReportDetailViewProps {
  report: ReportItem;
  allReports: ReportItem[];
  onBack: () => void;
  onSelectOtherReport: (report: ReportItem) => void;
}

const TIMEFRAMES = [
  "This month",
  "Last 3 months",
  "Last 6 months",
  "Year to date",
];

const DEPARTMENTS = [
  "All departments",
  "Sales",
  "Engineering",
  "Finance",
  "Operations",
  "Marketing",
  "Customer Success",
  "HR",
];

export default function ReportDetailView({
  report,
  allReports,
  onBack,
  onSelectOtherReport,
}: ReportDetailViewProps) {
  const [timeframe, setTimeframe] = useState("Last 6 months");
  const [department, setDepartment] = useState("All departments");

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    exportReportToCsv(report);
    toast.success(`Exported ${report.title} as CSV`);
  };

  // Convert report.cols & report.rows to objects for CustomTable
  const tableData = report.rows.map((row, rowIdx) => {
    const item: Record<string, any> = { id: `row-${rowIdx}` };
    report.cols.forEach((col, colIdx) => {
      item[col] = row[colIdx];
    });
    return item;
  });

  const columns: columnType[] = report.cols.map((col, idx) => ({
    key: col,
    label: col,
    render: (val: any) => {
      if (idx === 0) {
        return <span className="font-semibold  text-base-content">{val}</span>;
      }
      return <span className=" text-base-content/80">{val}</span>;
    },
  }));

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5  font-semibold text-base-content/80 hover:text-primary transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>All reports catalog</span>
        </button>
      </div>

      {/* PageHeader with Print & Export */}
      <PageHeader
        title={report.title}
        description={`Reports & Analytics — ${report.desc}`}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="btn btn-sm btn-ghost border border-base-200 rounded-xl px-3 font-medium gap-1.5"
          >
            <Printer className="size-3.5" />
            <span className="hidden sm:inline">Print</span>
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="btn btn-sm bg-primary text-white hover:bg-primary/90 border-0 rounded-xl px-4 font-medium gap-1.5 shadow-sm shadow-primary/20"
          >
            <Download className="size-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </PageHeader>

      {/* Filter Selectors Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-44">
          <LocalSelect
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
          >
            {TIMEFRAMES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </LocalSelect>
        </div>

        <div className="w-48">
          <LocalSelect
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </LocalSelect>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {report.kpis.map((kpi) => (
          <StatCard
            key={kpi.label}
            title={kpi.label}
            value={kpi.value}
            desc={kpi.delta || "Standard benchmark"}
            icon={<Sparkles className="size-5" />}
            variant="primary"
          />
        ))}
      </div>

      {/* Charts & Key Insights 2-to-1 Column Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Chart Column (2 cols) */}
        <div className="xl:col-span-2 card bg-base-100 border border-base-200 shadow-sm p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-base-content">
              {report.chart.title}
            </h3>
            <span className="badge badge-sm badge-ghost text-[10px] capitalize">
              {report.chart.type} visualization
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ReportChartRenderer chart={report.chart} />
          </div>
        </div>

        {/* Key Insights Column (1 col) */}
        <div className="card bg-base-100 border border-base-200 shadow-sm p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="size-4 text-amber-500" />
            <h3 className="font-bold text-sm text-base-content">
              Key Insights
            </h3>
          </div>

          <ul className="space-y-3">
            {report.insights.map((insight, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5  text-base-content/80 leading-relaxed bg-base-200/80 p-3 rounded-xl border border-base-200/80"
              >
                <Info className="size-3.5 text-primary mt-0.5 shrink-0" />
                <span>{insight}</span>
              </li>
            ))}
          </ul>

          <div className="pt-2 text-[11px] text-base-content/80 border-t border-base-200/80">
            Showing filtered analytics for:{" "}
            <span className="font-semibold text-base-content">{timeframe}</span>{" "}
            ·{" "}
            <span className="font-semibold text-base-content">
              {department}
            </span>
          </div>
        </div>
      </div>

      {/* Detailed Data Table (Using CustomTable) */}
      <div className="card bg-base-100 border border-base-200 shadow-sm p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-base-content">
              Detailed Data Breakdown
            </h3>
            <p className=" text-base-content/80 mt-0.5">
              Granular numerical records corresponding to {report.title}.
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-base-200">
          <CustomTable ring={false} data={tableData} columns={columns} />
        </div>
      </div>

      {/* Other Reports Pill Navigation */}
      <div className="card bg-base-100 border border-base-200 shadow-sm p-5 sm:p-6 space-y-3">
        <h4 className=" font-bold uppercase tracking-wider text-base-content/80">
          Other HR Reports & Analytics
        </h4>
        <div className="flex flex-wrap gap-2">
          {allReports
            .filter((r) => r.slug !== report.slug)
            .map((r) => (
              <button
                key={r.slug}
                type="button"
                onClick={() => onSelectOtherReport(r)}
                className="px-3 py-1.5 rounded-full  font-medium bg-base-200 hover:bg-primary hover:text-white transition-all"
              >
                {r.title}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
