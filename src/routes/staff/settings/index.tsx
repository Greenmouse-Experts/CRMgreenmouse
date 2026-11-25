import { createFileRoute, redirect } from "@tanstack/react-router";
import { get_user_value } from "@/store/authStore";

export const Route = createFileRoute("/staff/settings/")({
  component: RouteComponent,
  loader: () => {
    return redirect({
      to:
        get_user_value()?.user.userType === "staff"
          ? "/staff/settings/notifications"
          : "/staff/settings/profile",
    });
  },
});

function RouteComponent() {
  return <div>Hello "/tenant/settings/"!</div>;
}
