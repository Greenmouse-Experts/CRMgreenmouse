import { useState } from "react";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import {
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CalendarCheck2,
  Check,
  CircleUserRound,
  GraduationCap,
  LayoutDashboard,
  ListChecks,
  Scale,
  Settings,
  Users,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useLocation } from "@tanstack/react-router";
import { get_user_value } from "@/store/authStore";
import { toast } from "sonner";
import HrHeader from "../hr/-components/HrHeader";
import { useDashboardTheme } from "@/helpers/dashboardTheme";
import RestrictPage from "@/components/RestrictPage";

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
    path: "/staff",
    label: "Dashboard",
    icon: <LayoutDashboard size={ICON_SIZE} />,
    type: "menu",
    children: null,
  },
  {
    path: "/staff/staffs",
    label: "People",
    icon: <Users size={ICON_SIZE} />,
    type: "submenu",
    children: [
      {
        path: "/staff/staffs",
        label: "Colleagues",
        icon: <Users size={ICON_SIZE} />,
        type: "menu",
        children: null,
      },
      {
        path: "/staff/tasks",
        label: "Tasks",
        icon: <Check size={ICON_SIZE} />,
        type: "menu",
        children: null,
      },

      {
        path: "/staff/organization",
        label: "Organization",
        icon: <Building2 size={ICON_SIZE} />,
        type: "menu",
        children: null,
      },
    ],
  },
  {
    path: "/staff/attendance",
    label: "Operations",
    icon: <CalendarCheck2 size={ICON_SIZE} />,
    type: "submenu",
    children: [
      {
        path: "/staff/attendance",
        label: "Attendance & Time",
        icon: <CalendarCheck2 size={ICON_SIZE} />,
        type: "menu",
        children: null,
      },
      {
        path: "/staff/leave",
        label: "Leave",
        icon: <BriefcaseBusiness size={ICON_SIZE} />,
        type: "menu",
        children: null,
      },
      // {
      //   path: "/staff/payroll",
      //   label: "Payroll",
      //   icon: <WalletCards size={ICON_SIZE} />,
      //   type: "menu",
      //   children: null,
      // },
    ],
  },
  {
    path: "/staff/performance",
    label: "Growth & Compliance",
    icon: <BarChart3 size={ICON_SIZE} />,
    type: "submenu",
    children: [
      {
        path: "/staff/performance",
        label: "Performance",
        icon: <BarChart3 size={ICON_SIZE} />,
        type: "menu",
        children: null,
      },
      {
        path: "/staff/training",
        label: "Training",
        icon: <GraduationCap size={ICON_SIZE} />,
        type: "menu",
        children: null,
      },
      {
        path: "/staff/disciplinary",
        label: "Disciplinary",
        icon: <Scale size={ICON_SIZE} />,
        type: "menu",
        children: null,
      },
    ],
  },
  {
    path: "/staff/self-service",
    label: "Workspace",
    icon: <CircleUserRound size={ICON_SIZE} />,
    type: "submenu",
    children: [
      {
        path: "/staff/self-service",
        label: "Self-Service",
        icon: <CircleUserRound size={ICON_SIZE} />,
        type: "menu",
        children: null,
      },
      // {
      //   path: "/staff/reports",
      //   label: "Reports",
      //   icon: <Sparkles size={ICON_SIZE} />,
      //   type: "menu",
      //   children: null,
      // },
      {
        path: "/staff/settings",
        label: "Settings",
        icon: <Settings size={ICON_SIZE} />,
        type: "menu",
        children: null,
      },
    ],
  },
] satisfies Links[];
export const Route = createFileRoute("/staff")({
  component: RouteComponent,
  notFoundComponent: () => (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-semibold">404 - Page Not Found</h1>
          <p className="py-6">
            Oops! The page you are looking for does not exist.
          </p>
          <Link to="/staff" className="btn btn-primary">
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
    const userType = auth.user.userType?.toLowerCase() ?? "";
    const roleName = auth.user.role?.name?.toLowerCase() ?? "";
    if (
      userType !== "tenant" &&
      userType !== "staff" &&
      roleName !== "hr" &&
      !userType.includes("hr")
    ) {
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
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [theme] = useDashboardTheme("staff");
  const activeLinkPath = nav_links
    .flatMap((link) => link.children?.map((child) => child.path) ?? [link.path])
    .filter(
      (path) =>
        pathname === path ||
        (path !== "/staff" && pathname.startsWith(`${path}/`)),
    )
    .sort((first, second) => second.length - first.length)[0];

  return (
    <div data-theme={theme}>
      <RestrictPage allowedTypes="staff">
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
            <div className="min-h-full w-64 bg-base-100 text-base-content">
              <div className="flex items-center gap-3 border-b border-base-300/80 px-4 py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-lg font-black text-primary-content">
                  K
                </div>
                <div className="leading-tight">
                  <div className="text-lg font-semibold text-base-content">
                    Kinovia CRM
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-base-content/80">
                    Employee Portal
                  </div>
                </div>
              </div>

              <ul className="menu w-full space-y-2">
                {nav_links.map((link) => {
                  if (link.type === "submenu" && link.children) {
                    // Submenus closed by default
                    return (
                      <li key={link.path} className="mb-2">
                        <details
                          open={openMenu === link.path}
                          onToggle={(e) => {
                            if (e.currentTarget.open) setOpenMenu(link.path);
                            else
                              setOpenMenu((current) =>
                                current === link.path ? null : current,
                              );
                          }}
                        >
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
      </RestrictPage>
    </div>
  );
}
