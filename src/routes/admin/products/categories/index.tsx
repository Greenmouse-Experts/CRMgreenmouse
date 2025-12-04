import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/products/categories/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/admin/products/categories/"!</div>;
}
