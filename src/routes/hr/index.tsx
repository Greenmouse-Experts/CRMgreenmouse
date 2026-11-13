import { createFileRoute } from "@tanstack/react-router";
import HrDashboard from "./-components/HrDashboard";

export const Route = createFileRoute("/hr/")({
  component: HrDashboard,
});
