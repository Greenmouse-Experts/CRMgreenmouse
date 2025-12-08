import { useLocation } from "@tanstack/react-router";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/settings")({
  component: RouteComponent,
});

interface Links {
  path: string;
  name: string;
}
[];
const links: Links[] = [
  { path: "/admin/settings", name: "Profile" },
  { path: "/admin/settings/theme", name: "Theme" },
  { path: "/admin/settings/security", name: "Security" },
  { path: "/admin/settings/notifications", name: "Notifications" },
];

function RouteComponent() {
  const location = useLocation();
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold opacity-90">Account Settings</h2>
      <section className=" bg-base-100 rounded-box shadow">
        <div className="drawer lg:drawer-open">
          <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
          <div className="drawer-content p-4 ">
            <Outlet />
            {/* Page content here */}
            {/*<label
              htmlFor="my-drawer-3"
              className="btn drawer-button lg:hidden"
            >
              Open drawer
            </label>*/}
          </div>
          <div className="drawer-side ">
            <label
              htmlFor="my-drawer-3"
              aria-label="close sidebar"
              className="drawer-overlay"
            ></label>
            <ul className="menu py-4 min-h-full w-60  space-y-2 border-r border-r-current/20">
              {/* Sidebar content here */}
              {links.map((link) => (
                <li key={link.path}>
                  <Link
                    className={`${location.pathname === link.path ? "bg-primary text-primary-content " : ""}   `}
                    to={link.path}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
