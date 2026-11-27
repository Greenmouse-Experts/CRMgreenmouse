import { createFileRoute } from "@tanstack/react-router";
import DashboardThemePicker from "@/components/settings/DashboardThemePicker";

export const Route = createFileRoute("/hr/settings/theme/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <DashboardThemePicker scope="hr" />;
}
