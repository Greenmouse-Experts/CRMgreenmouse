import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/home/products/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/home/products/"!</div>;
}
