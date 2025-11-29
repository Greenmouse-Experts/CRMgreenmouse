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
} from "lucide-react";
import AdminHeader from "./_components/AdminHeader";
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
const nav_links = [
  {
    path: "/admin",
    label: "Dashboard",
    icon: <LayoutDashboard size={20} />,
    type: "menu",
    children: null,
  },
  {
    path: "/admin/customers",
    label: "Customers",
    icon: <Users size={20} />,
    type: "menu",
    children: null,
  },
  {
    path: "/admin/staff",
    label: "Staff",
    icon: <UserPlus size={20} />,
    type: "menu",
    children: null,
  },
  {
    path: "/admin/income",
    label: "Income",
    icon: <ReceiptText size={20} />,
    type: "menu",
    children: null,
  },
  {
    path: "/admin/expenses",
    label: "Expenses",
    icon: <ShoppingCart size={20} />,
    type: "menu",
    children: null,
  },
  {
    path: "/admin/transactions",
    label: "Transactions",
    icon: <CreditCard size={20} />,
    type: "submenu",
    children: [
      {
        path: "/admin/transactions/incomes",
        label: "Incomes",
        icon: <ReceiptText size={20} />,
        type: "menu",
        children: null,
      },
      {
        path: "/admin/transactions/expenses",
        label: "Expenses",
        icon: <ShoppingCart size={20} />,
        type: "menu",
        children: null,
      },
    ],
  },
  {
    path: "/admin/documents",
    label: "Document Management",
    icon: <Tag size={20} />,
    type: "submenu",
    children: [
      {
        path: "/admin/documents/receipts",
        label: "Receipts",
        icon: <ReceiptText size={20} />,
        type: "menu",
        children: null,
      },
      {
        path: "/admin/documents/invoices",
        label: "Invoices",
        icon: <Shirt size={20} />, // Reusing Shirt icon for invoices, consider a more fitting icon if available
        type: "menu",
        children: null,
      },
      {
        path: "/admin/documents/generate",
        label: "Generate Receipt/Invoice",
        icon: <Cog size={20} />, // Reusing Cog icon, consider a more fitting icon if available
        type: "menu",
        children: null,
      },
    ],
  },
  {
    path: "/admin/analytics",
    label: "Analytics and Accounting Records",
    icon: <BarChart2 size={20} />,
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
        <main className=" min-h-screen bg-base-200">
          <Outlet />
        </main>
      </div>
      <div className="drawer-side">
        <label
          htmlFor="admin-drawer"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <div className="min-h-full w-3xs bg-linear-50 from-primary to-secondary text-white">
          <div className="font-bold h-26 text-3xl text-center  grid place-items-center">
            KINOVIA <br />
            CRM
          </div>
          <ul className="menu w-full space-y-2 ">
            {nav_links.map((link) => {
              const int_url = link.path;
              if (link.type === "submenu" && link.children) {
                // Submenus should be open by default
                return (
                  <li key={link.path} className="mb-2">
                    <details open>
                      <summary className="text-sm font-semibold py-2">
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
                                className={`text-xs font-medium py-2 ${
                                  isChildActive
                                    ? "bg-white/70 text-primary"
                                    : ""
                                }`}
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
                    className={`text-sm font-semibold py-2 ${isActive ? "bg-white/70 text-primary" : ""}`}
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
