import { Link } from "@tanstack/react-router";
import {
  Users,
  FileText,
  Package,
  UsersRound,
  ShoppingBag,
  DollarSign,
  UserPlus,
  Phone,
} from "lucide-react";

const statsData = [
  { title: "Total Staffs", value: 125, icon: Users },
  {
    title: "Total Invoices",
    value: 876,
    icon: FileText,
  },
  { title: "Pending Orders", value: 34, icon: Package },
  { title: "Customers", value: 520, icon: UsersRound },
  { title: "Products", value: 1500, icon: ShoppingBag },
  {
    title: "Revenue (Today)",
    value: "$1,234",
    icon: DollarSign,
  },
  { title: "New Signups", value: 12, icon: UserPlus },
];

export default function AdminDashStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 p-4">
      {statsData.slice(0, 5).map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          Icon={stat.icon}
        />
      ))}
    </div>
  );
}

const StatCard = ({
  title,
  value,
  Icon,
}: {
  title: string;
  value: string | number;
  Icon: React.ElementType;
}) => {
  return (
    <Link
      //@ts-ignore
      to="#"
      className={`card bg-base-100 shadow`}
    >
      <div className="card-body p-4 flex-1">
        <div className="flex items-center">
          <div className="flex-1 space-y-2">
            <p className="text-xl font-extrabold mt-2">{value}</p>
            <div className="flex items-center justify-between">
              <h2 className="card-title text-xs text-primary/50 ">{title}</h2>
            </div>
          </div>
          <div>
            <div className="p-3 bg-linear-50 rounded-full from-secondary/50 to-secondary size-fit">
              <Icon className="size-32 text-white" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
