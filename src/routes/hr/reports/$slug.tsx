import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { getReportBySlug, HR_REPORTS } from "./-components/reportsData";
import ReportDetailView from "./-components/ReportDetailView";
import { ArrowLeft, FileQuestion } from "lucide-react";

export const Route = createFileRoute("/hr/reports/$slug")({
  component: RouteComponent,
});

function RouteComponent() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const report = getReportBySlug(slug);

  if (!report) {
    return (
      <div className="py-16 text-center space-y-4">
        <FileQuestion className="size-12 mx-auto text-base-content/30" />
        <h2 className="text-lg font-bold text-base-content">Report Not Found</h2>
        <p className="text-xs text-base-content/60">
          The requested report "{slug}" does not exist in the analytics catalog.
        </p>
        <Link
          to="/hr/reports"
          className="btn btn-sm btn-primary rounded-xl px-4 inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to reports</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-12">
      <ReportDetailView
        report={report}
        allReports={HR_REPORTS}
        onBack={() => navigate({ to: "/hr/reports" })}
        onSelectOtherReport={(r) =>
          navigate({ to: "/hr/reports/$slug", params: { slug: r.slug } })
        }
      />
    </div>
  );
}
