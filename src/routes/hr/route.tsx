import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import {
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CalendarCheck2,
  CircleUserRound,
  Gavel,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  NotebookPen,
  Settings,
  Sparkles,
  UserRoundPlus,
  Users,
  WalletCards,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useLocation } from "@tanstack/react-router";
import { get_user_value } from "@/store/authStore";
import { toast } from "sonner";
import HrHeader from "./-components/HrHeader";

interface Links {
  path: string;
  label: string;
  icon: React.ReactNode;
  type: "menu" | "submenu";
  children: Links[] | null;
}

const ICON_SIZE = 14;

const nav_links = [
  {
    path: "/hr",
    label: "HR Dashboard",
    icon: <LayoutDashboard size={ICON_SIZE} />,
    type: "menu",
    children: null,
  },
  {
    path: "/hr/staffs",
    label: "People",
    icon: <Users size={ICON_SIZE} />,
    type: "submenu",
    children: [
      {
        path: "/hr/staffs",
        label: "Employees",
        icon: <Users size={ICON_SIZE} />,
        type: "menu",
        children: null,
      },
      {
        path: "/hr/recruitment",
        label: "Recruitment",
        icon: <UserRoundPlus size={ICON_SIZE} />,
        type: "menu",
        children: null,
      },
      {
        path: "/hr/onboarding",
        label: "Onboarding",
        icon: <NotebookPen size={ICON_SIZE} />,
        type: "menu",
        children: null,
      },
      {
        path: "/hr/organization",
        label: "Organization",
        icon: <Building2 size={ICON_SIZE} />,
        type: "menu",
        children: null,
      },
    ],
  },
  {
    path: "/hr/attendance",
    label: "Operations",
    icon: <CalendarCheck2 size={ICON_SIZE} />,
    type: "submenu",
    children: [
      {
        path: "/hr/attendance",
        label: "Attendance & Time",
        icon: <CalendarCheck2 size={ICON_SIZE} />,
        type: "menu",
        children: null,
      },
      {
        path: "/hr/leave",
        label: "Leave",
        icon: <BriefcaseBusiness size={ICON_SIZE} />,
        type: "menu",
        children: null,
      },
      {
        path: "/hr/payroll",
        label: "Payroll",
        icon: <WalletCards size={ICON_SIZE} />,
        type: "menu",
        children: null,
      },
    ],
  },
  {
    path: "/hr/performance",
    label: "Growth & Compliance",
    icon: <BarChart3 size={ICON_SIZE} />,
    type: "submenu",
    children: [
      {
        path: "/hr/performance",
        label: "Performance",
        icon: <BarChart3 size={ICON_SIZE} />,
        type: "menu",
        children: null,
      },
      {
        path: "/hr/training",
        label: "Training",
        icon: <GraduationCap size={ICON_SIZE} />,
        type: "menu",
        children: null,
      },
      {
        path: "/hr/disciplinary",
        label: "Disciplinary",
        icon: <Gavel size={ICON_SIZE} />,
        type: "menu",
        children: null,
      },
      {
        path: "/hr/offboarding",
        label: "Offboarding",
        icon: <LogOut size={ICON_SIZE} />,
        type: "menu",
        children: null,
      },
    ],
  },
  {
    path: "/hr/self-service",
    label: "Workspace",
    icon: <CircleUserRound size={ICON_SIZE} />,
    type: "submenu",
    children: [
      {
        path: "/hr/self-service",
        label: "Self-Service",
        icon: <CircleUserRound size={ICON_SIZE} />,
        type: "menu",
        children: null,
      },
      {
        path: "/hr/reports",
        label: "Reports",
        icon: <Sparkles size={ICON_SIZE} />,
        type: "menu",
        children: null,
      },
      {
        path: "/hr/settings",
        label: "Settings",
        icon: <Settings size={ICON_SIZE} />,
        type: "menu",
        children: null,
      },
    ],
  },
] satisfies Links[];
export const Route = createFileRoute("/hr")({
  component: RouteComponent,
  notFoundComponent: () => (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-semibold">404 - Page Not Found</h1>
          <p className="py-6">
            Oops! The page you are looking for does not exist.
          </p>
          <Link to="/tenant" className="btn btn-primary">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  ),
  loader: () => {
    const auth = get_user_value();
    if (!auth)
      return redirect({
        to: "/auth/login",
      });
    if (auth.user.userType !== "tenant" && auth.user.userType !== "staff") {
      toast.info("wrong dashboard");
      return redirect({
        to: "/auth/login",
      });
    }
  },
});

function RouteComponent() {
  const url = useLocation();
  const pathname = url.pathname.replace(/\/$/, "") || "/";
  const activeLinkPath = nav_links
    .flatMap((link) => link.children?.map((child) => child.path) ?? [link.path])
    .filter(
      (path) =>
        pathname === path ||
        (path !== "/hr" && pathname.startsWith(`${path}/`)),
    )
    .sort((first, second) => second.length - first.length)[0];

  return (
    <div className="drawer lg:drawer-open">
      <input id="tenant-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content bg-base-200 isolate">
        <HrHeader />
        <main className="min-h-screen bg-base-200 pt-4 space-y-4 px-4">
          <Outlet />
        </main>
      </div>
      <div className="drawer-side">
        <label
          htmlFor="tenant-drawer"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <div className="min-h-full w-72 bg-base-100 text-base-content">
          <div className="flex items-center gap-3 border-b border-base-300/40 px-4 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-lg font-black text-primary-content">
              K
            </div>
            <div className="leading-tight">
              <div className="text-lg font-semibold text-base-content">
                Kinovia CRM
              </div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-base-content/60">
                Human Resources
              </div>
            </div>
          </div>

          <ul className="menu w-full space-y-2">
            {nav_links.map((link) => {
              if (link.type === "submenu" && link.children) {
                // Submenus open by default
                return (
                  <li key={link.path} className="mb-2">
                    <details open>
                      <summary className="text-md">
                        {link.icon}
                        {link.label}
                      </summary>
                      <ul className="py-1 space-y-1">
                        {link.children.map((childLink) => {
                          const isChildActive =
                            childLink.path === activeLinkPath;
                          return (
                            <li key={childLink.path}>
                              <Link
                                to={childLink.path}
                                className={`${isChildActive ? "bg-primary text-primary-content " : ""} text-md py-2 rounded-box`}
                              >
                                {childLink.icon}
                                {childLink.label}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </details>
                  </li>
                );
              }

              const isActive = link.path === activeLinkPath;
              return (
                <li key={link.path} className="mb-2">
                  <Link
                    to={link.path}
                    className={`${isActive ? "bg-primary text-primary-content " : ""} text-md py-2 rounded-box`}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
