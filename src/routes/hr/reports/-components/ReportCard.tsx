import { BarChart3, Download, Eye, PieChart, TrendingUp } from "lucide-react";
import type { ReportItem } from "./types";
import { exportReportToCsv } from "./reportsData";
import { toast } from "sonner";

interface ReportCardProps {
  report: ReportItem;
  onSelectReport: (report: ReportItem) => void;
}

export default function ReportCard({
  report,
  onSelectReport,
}: ReportCardProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case "pie":
        return <PieChart className="size-5 text-purple-600" />;
      case "line":
      case "area":
        return <TrendingUp className="size-5 text-primary" />;
      default:
        return <BarChart3 className="size-5 text-blue-600" />;
    }
  };

  const handleExport = (e: React.MouseEvent) => {
    e.stopPropagation();
    exportReportToCsv(report);
    toast.success(`Exported ${report.title} as CSV`);
  };

  return (
    <div
      onClick={() => onSelectReport(report)}
      className="card bg-base-100 border border-base-200 hover:border-primary/80 hover:shadow-md transition-all p-5 rounded-2xl cursor-pointer flex flex-col justify-between group ring fade"
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="p-2.5 rounded-xl bg-base-200/80 border border-base-200 group-hover:bg-primary/10 transition-colors">
            {getIcon(report.chart.type)}
          </div>
          {report.category && (
            <span className="badge badge-sm badge-ghost text-[10px] font-semibold text-base-content/80">
              {report.category}
            </span>
          )}
        </div>

        <h3 className="font-bold text-base text-base-content group-hover:text-primary transition-colors">
          {report.title}
        </h3>
        <p className=" text-base-content/80 mt-1 line-clamp-2">{report.desc}</p>

        {/* Quick KPI preview badges */}
      </div>

      {/* Action Footer */}
      <div className="flex items-center gap-2 mt-5 pt-3 border-t border-base-200/80">
        <button
          type="button"
          onClick={() => onSelectReport(report)}
          className="btn btn-sm btn-ghost hover:bg-primary/10 hover:text-primary flex-1 ring  fade rounded-xl  font-semibold gap-1.5"
        >
          <Eye className="size-3.5" />
          <span>View Report</span>
        </button>
        <button
          type="button"
          onClick={handleExport}
          title="Export CSV"
          className="btn btn-sm btn-ghost hover:bg-base-200 rounded-xl px-2.5 text-base-content/80 hover:text-base-content"
        >
          <Download className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
