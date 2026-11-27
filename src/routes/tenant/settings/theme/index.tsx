import { createFileRoute } from "@tanstack/react-router";
import DashboardThemePicker from "@/components/settings/DashboardThemePicker";

export const Route = createFileRoute("/tenant/settings/theme/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <DashboardThemePicker scope="tenant" />;
}
