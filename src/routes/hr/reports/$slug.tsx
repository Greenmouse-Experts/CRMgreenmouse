import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { getReportBySlug, HR_REPORTS } from "./-components/reportsData";
import ReportDetailView from "./-components/ReportDetailView";
import { ArrowLeft, FileQuestion } from "lucide-react";
import { reportHooksMap, type ReportQueryParams } from "@/api/reportsApi";
import PageLoader from "@/components/layout/PageLoader";
import React from "react";

function timeframeToMonths(timeframe: string): number {
  switch (timeframe) {
    case "This month":
      return 1;
    case "Last 3 months":
      return 3;
    case "Last 6 months":
      return 6;
    case "Year to date":
      return 12;
    default:
      return 6;
  }
}

function departmentToId(department: string): string | undefined {
  if (department === "All departments") return undefined;
  // In a real app, this would map to actual department IDs
  return department.toLowerCase().replace(/\s+/g, "-");
}

export const Route = createFileRoute("/hr/reports/$slug")({
  component: RouteComponent,
});

function RouteComponent() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const mockReport = getReportBySlug(slug);

  if (!mockReport) {
    return (
      <div className="py-16 text-center space-y-4">
        <FileQuestion className="size-12 mx-auto text-base-content/30" />
        <h2 className="text-lg font-bold text-base-content">
          Report Not Found
        </h2>
        <p className=" text-base-content/80">
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

  // Get the query hook for this report type
  const queryHook = reportHooksMap[slug];

  // Build query params from URL or localStorage (simplified for now)
  const [timeframe, setTimeframe] = React.useState("Last 6 months");
  const [department, setDepartment] = React.useState("All departments");

  const params: ReportQueryParams = {
    months: timeframeToMonths(timeframe),
    departmentId: departmentToId(department),
    department: departmentToId(department),
    cycleId: undefined, // Would come from a cycle selector in real app
  };

  // Use the query hook if available, otherwise fall back to mock data
  const apiQuery = queryHook ? queryHook(params) : null;

  // Merge mock report with API data when available
  const report = apiQuery?.data
    ? { ...mockReport, ...apiQuery.data }
    : mockReport;

  // If there's an API query, use PageLoader with it
  if (apiQuery) {
    return (
      <PageLoader
        query={apiQuery}
        emptyState={{
          title: "No data available",
          description: `Unable to load data for ${mockReport.title}.`,
        }}
      >
        {(loadedReport) => (
          <ReportDetailView
            report={loadedReport}
            allReports={HR_REPORTS}
            onBack={() => navigate({ to: "/hr/reports" })}
            onSelectOtherReport={(r) =>
              navigate({ to: "/hr/reports/$slug", params: { slug: r.slug } })
            }
            timeframe={timeframe}
            setTimeframe={setTimeframe}
            department={department}
            setDepartment={setDepartment}
          />
        )}
      </PageLoader>
    );
  }

  // No API query available - render directly with mock/merged report
  return (
    <ReportDetailView
      report={report}
      allReports={HR_REPORTS}
      onBack={() => navigate({ to: "/hr/reports" })}
      onSelectOtherReport={(r) =>
        navigate({ to: "/hr/reports/$slug", params: { slug: r.slug } })
      }
      timeframe={timeframe}
      setTimeframe={setTimeframe}
      department={department}
      setDepartment={setDepartment}
    />
  );
}
