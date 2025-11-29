import { Outlet, useLocation } from "@tanstack/react-router";
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
    path: "/admin/staffs/",
    label: "User Management",
    icon: null, // Removed icon for submenu
    type: "submenu",
    children: [
      {
        path: "/admin/staffs/users",
        label: "Developers",
        icon: <UserPlus size={20} />,
        type: "menu",
        children: null,
      },
      {
        path: "/admin/staffs/customers",
        label: "Customers",
        icon: <Users size={20} />,
        type: "menu",
        children: null,
      },
    ],
  },
  {
    path: "/admin/products",
    label: "Products",
    icon: <Package size={20} />,
    type: "menu",
    children: null,
  },
  {
    path: "/admin/categories",
    label: "Categories",
    icon: null, // Removed icon for submenu
    type: "submenu",
    children: [
      {
        path: "/admin/categories/Markets",
        label: "Markets",
        icon: <ReceiptText size={20} />,
        type: "menu",
        children: null,
      },
      {
        path: "/admin/categories/Fabric",
        label: "Fabric",
        icon: <Shirt size={20} />,
        type: "menu",
        children: null,
      },
      {
        path: "/admin/categories/Styles",
        label: "Styles",
        icon: <Tag size={20} />,
        type: "menu",
        children: null,
      },
    ],
  },
  // {
  //   path: "/admin/settings",
  //   label: "Settings",
  //   icon: <Settings size={20} />,
  //   type: "menu",
  //   children: null,
  // },
  {
    path: "/admin/More",
    label: "More",
    icon: null, // Removed icon for submenu
    type: "submenu",
    children: [
      {
        path: "/admin/More/Orders",
        label: "Orders",
        icon: <ShoppingCart size={20} />,
        type: "menu",
        children: null,
      },
      {
        path: "/admin/More/Subscriptions",
        label: "Subscriptions",
        icon: <CreditCard size={20} />,
        type: "menu",
        children: null,
      },
      {
        path: "/admin/More/Coupons",
        label: "Coupons",
        icon: <Ticket size={20} />,
        type: "menu",
        children: null,
      },
      {
        path: "/admin/More/PaymentsTransactions",
        label: "Payments & Transactions",
        icon: <CreditCard size={20} />,
        type: "menu",
        children: null,
      },
      {
        path: "/admin/More/Notifications",
        label: "Notifications",
        icon: <Bell size={20} />,
        type: "menu",
        children: null,
      },
      {
        path: "/admin/More/Messages",
        label: "Messages",
        icon: <MessageSquare size={20} />,
        type: "menu",
        children: null,
      },
      {
        path: "/admin/More/Announcements",
        label: "Announcements",
        icon: <Megaphone size={20} />,
        type: "menu",
        children: null,
      },
      {
        path: "/admin/More/ReportAnalysis",
        label: "Report and Analysis",
        icon: <BarChart2 size={20} />,
        type: "menu",
        children: null,
      },
      {
        path: "/admin/More/FAQManagement",
        label: "FAQ Management",
        icon: <HelpCircle size={20} />,
        type: "menu",
        children: null,
      },
      {
        path: "/admin/More/SettingsConfigurations",
        label: "Settings and Configurations",
        icon: <Cog size={20} />,
        type: "menu",
        children: null,
      },
    ],
  },
] satisfies Links[];

///page
export default function index() {
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
