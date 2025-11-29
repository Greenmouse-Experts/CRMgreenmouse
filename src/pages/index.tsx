import { redirect } from "@tanstack/react-router";
export const Loader = () => {
  return redirect({
    to: "/auth/login",
  });
};
export default function index() {
  return <div className="text-xl">page</div>;
}
