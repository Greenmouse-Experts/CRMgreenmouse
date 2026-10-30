import { createFileRoute, redirect } from "@tanstack/react-router";
import { get_user_value } from "@/store/authStore";

export const Route = createFileRoute("/tenant/settings/")({
  component: RouteComponent,
  loader: () => {
    return redirect({
      to:
        get_user_value()?.user.userType === "staff"
          ? "/tenant/settings/notifications"
          : "/tenant/settings/profile",
    });
  },
});

function RouteComponent() {
  return <div>Hello "/tenant/settings/"!</div>;
}
