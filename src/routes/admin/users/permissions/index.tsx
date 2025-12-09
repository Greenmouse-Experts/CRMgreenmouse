import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/users/permissions/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/admin/users/permissions/"!</div>;
}
