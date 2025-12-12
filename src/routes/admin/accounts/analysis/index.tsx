import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/accounts/analysis/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/admin/accounts/analysis/"!</div>;
}
