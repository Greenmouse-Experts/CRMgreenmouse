import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/settings/profile/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/admin/settings/profile/"!</div>;
}
