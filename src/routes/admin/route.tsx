import { createFileRoute, Outlet } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Package,
  ReceiptText,
  Settings,
  UserPlus,
  ShoppingCart,
  CreditCard,
  Bell,
  MessageSquare,
  Megaphone,
  BarChart2,
  HelpCircle,
  Cog,
  Ticket,
  Users,
  Shirt,
  Tag,
  SubscriptIcon,
  Check,
  CheckCircle,
} from "lucide-react";
import AdminHeader from "./-components/AdminHeader";
import { Link } from "@tanstack/react-router";
import { useLocation } from "@tanstack/react-router";
interface Links {
  path: string;
  label: string;
  icon: React.ReactNode;
  type: "menu" | "submenu";
  children: Partial<Links[]> | null;
}
[];
const ICON_SIZE = 12;
const nav_links = [
  {
    path: "/admin",
    label: "Dashboard",
    icon: <LayoutDashboard size={ICON_SIZE} />,
    type: "menu",
    children: null,
  },
  {
    path: "/admin/users",
    label: "Users",
    icon: <Users size={ICON_SIZE} />,
    type: "submenu",
    children: [
      {
        path: "/admin/users",
        label: "Staffs",
        icon: <Users size={ICON_SIZE} />,
        type: "menu",
        children: null,
      },
      {
        path: "/admin/users/roles",
        label: "Roles",
        icon: <Tag size={ICON_SIZE} />,
        type: "menu",
        children: null,
      },
      {
        path: "/admin/users/permissions",
        label: "Permissions",
        icon: <Cog size={ICON_SIZE} />,
        type: "menu",
        children: null,
      },
    ],
  },
  {
    path: "/admin/contacts",
    label: "Contacts",
    icon: <Users size={ICON_SIZE} />,
    type: "submenu",
    children: [
      {
        path: "/admin/contacts/customers",
        label: "Customers",
        icon: <Users size={ICON_SIZE} />,
        type: "menu",
        children: null,
      },
      {
        path: "/admin/contacts/companies",
        label: "Companies",
        icon: <Shirt size={ICON_SIZE} />,
        type: "menu",
        children: null,
      },
    ],
  },
  {
    path: "/admin/products",
    label: "Products",
    icon: <Package size={ICON_SIZE} />,
    type: "submenu",
    children: [
      {
        path: "/admin/products",
        label: "Products",
        icon: <Package size={ICON_SIZE} />,
        type: "menu",
        children: null,
      },
      {
        path: "/admin/products/categories",
        label: "Categories",
        icon: <Tag size={ICON_SIZE} />,
        type: "menu",
        children: null,
      },
    ],
  },
  {
    path: "/admin/accounts",
    label: "Accounts",
    icon: <CreditCard size={ICON_SIZE} />,
    type: "submenu",
    children: [
      {
        path: "/admin/accounts/income-expenses",
        label: "Income & Expenses",
        icon: <ReceiptText size={ICON_SIZE} />,
        type: "menu",
        children: null,
      },
      {
        path: "/admin/accounts/invoices",
        label: "Invoices",
        icon: <ShoppingCart size={ICON_SIZE} />,
        type: "menu",
        children: null,
      },
    ],
  },
  {
    path: "/admin/subscription",
    label: "Subscription",
    icon: <CheckCircle size={ICON_SIZE} />,
    type: "menu",
    children: null,
  },

  {
    path: "/admin/support",
    label: "Support",
    icon: <HelpCircle size={ICON_SIZE} />,
    type: "menu",
    children: null,
  },

  {
    path: "/admin/settings",
    label: "Settings",
    icon: <Settings size={ICON_SIZE} />,
    type: "menu",
    children: null,
  },
] satisfies Links[];
export const Route = createFileRoute("/admin")({
  component: RouteComponent,
  notFoundComponent: () => (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold">404 - Page Not Found</h1>
          <p className="py-6">
            Oops! The page you are looking for does not exist.
          </p>
          <Link to="/admin" className="btn btn-primary">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  ),
});

function RouteComponent() {
  const url = useLocation();

  return (
    <div className="drawer lg:drawer-open">
      <input id="admin-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content bg-base-200">
        <AdminHeader />
        <main className=" min-h-screen bg-base-200 pt-4 space-y-4 px-4">
          <Outlet />
        </main>
      </div>
      <div className="drawer-side">
        <label
          htmlFor="admin-drawer"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <div className="min-h-full w-3xs bg-accent text-accent-content">
          <div className="font-bold h-18 text-lg flex  items-center px-4 border-b border-base-300/40">
            KINOVIA CRM
          </div>
          <ul className="menu  w-full space-y-2 ">
            {nav_links.map((link) => {
              const int_url = link.path;
              if (link.type === "submenu" && link.children) {
                // Submenus should be open by default
                return (
                  <li key={link.path} className="mb-2">
                    <details open>
                      <summary className="text-xs font-semibold ">
                        {link.icon}
                        {link.label}
                      </summary>
                      <ul className="py-1 space-y-1">
                        {link.children.map((childLink) => {
                          if (!childLink) return null;
                          const isChildActive = childLink.path === url.pathname;
                          return (
                            <li key={childLink.path}>
                              <Link
                                to={childLink.path}
                                className={` ${isChildActive ? "bg-primary text-primary-content " : "opacity-70"} text-xs font-bold`}
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

              const isActive = int_url === url.pathname;
              return (
                <li key={link.path} className="mb-2">
                  <Link
                    to={link.path}
                    className={`btn btn-ghost justify-start flex btn-sm ${isActive ? "btn-active" : ""}`}
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
