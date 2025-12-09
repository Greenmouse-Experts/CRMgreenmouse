import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/accounts/Invoice/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/admin/accounts/sales/"!</div>;
}
