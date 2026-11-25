import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/verify")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
