import { createFileRoute, useParams } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/users/$id/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = useParams({
    strict: false,
  });
  return <div>Hello "/admin/users/$id/"!</div>;
}
