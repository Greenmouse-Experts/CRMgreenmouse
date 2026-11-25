import { createFileRoute, redirect } from "@tanstack/react-router";
import { get_user_value } from "@/store/authStore";

export const Route = createFileRoute("/hr/settings/")({
  component: RouteComponent,
  loader: () => {
    return redirect({
      to: "/hr/settings/profile",
    });
  },
});

function RouteComponent() {
  return <div>Hello "/tenant/settings/"!</div>;
}
