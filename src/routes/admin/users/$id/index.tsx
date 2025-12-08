import { createFileRoute, useParams } from "@tanstack/react-router";
import UserInfo from "./-components/UserInfo";
import FullInfo from "./-components/FullInfo";
import OtherInfo from "./-components/OtherInfo";

export const Route = createFileRoute("/admin/users/$id/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = useParams({
    strict: false,
  });
  return (
    <div className="container mx-auto  px-4 py-4 space-y-4">
      <UserInfo />
      <FullInfo />
      <OtherInfo />
    </div>
  );
}
