import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/home/contact-us/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/home/contact-us/"!</div>;
}
