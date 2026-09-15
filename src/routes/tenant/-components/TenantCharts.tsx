import { useProfile } from "@/store/authStore";
import {
  useTenantMe,
  useTenantOnboarding,
  useTenantLatestLoginActivity,
} from "@/api/tenantApi";
import { Link } from "@tanstack/react-router";
import { FileText, UserPlus, Receipt, ShieldCheck } from "lucide-react";
import IncomeExpense from "./charts/IncomeExpense";

export default function TenantCharts() {
  const [authProfile] = useProfile();
  const { data: tenantMe } = useTenantMe();
  const { data: onboarding } = useTenantOnboarding();
  const { data: latestLogin } = useTenantLatestLoginActivity();

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const companyName =
    tenantMe?.companyName ||
    onboarding?.companyName ||
    authProfile?.companyName ||
    "Your Business";

  const industry = onboarding?.industry;
  const teamSize = onboarding?.teamSize;

  const loginDateStr =
    latestLogin?.timestamp || latestLogin?.createdAt
      ? new Date(
          latestLogin.timestamp || latestLogin.createdAt!,
        ).toLocaleString(undefined, {
          dateStyle: "short",
          timeStyle: "short",
        })
      : null;

  return (
    <div className="w-full space-y-4 py-2">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary to-emerald-800 rounded-2xl shadow-md flex flex-col justify-between text-primary-content p-6 relative w-full overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="space-y-3 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-white/15 text-white font-medium rounded-md px-3 py-1 text-xs backdrop-blur-xs">
              {currentDate}
            </div>
            {industry && (
              <span className="badge badge-sm bg-white/20 text-white border-0">
                {industry}
              </span>
            )}
            {teamSize && (
              <span className="badge badge-sm bg-white/20 text-white border-0">
                Staff: {teamSize}
              </span>
            )}
            {loginDateStr && (
              <span className="badge badge-sm bg-white/15 text-white/90 border-0 gap-1 backdrop-blur-xs">
                <ShieldCheck className="size-3" />
                Last login: {loginDateStr}
              </span>
            )}
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {companyName}
            </h2>
            <p className="text-xs sm:text-sm text-white/80 max-w-xl leading-relaxed mt-1">
              Here is your business performance overview. Manage customer
              relationships, track incoming revenue, and oversee team
              operations.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Link
              to="/tenant/accounts/Invoices"
              className="btn btn-sm bg-white text-primary hover:bg-white/90 border-0 gap-1.5 shadow-sm font-semibold"
            >
              <FileText className="size-3.5" />
              New Invoice
            </Link>
            <Link
              to="/tenant/contacts/customers"
              className="btn btn-sm bg-white/20 text-white hover:bg-white/30 border-0 gap-1.5 backdrop-blur-xs font-semibold"
            >
              <UserPlus className="size-3.5" />
              Add Customer
            </Link>
            <Link
              to="/tenant/accounts/income-expenses"
              className="btn btn-sm bg-white/20 text-white hover:bg-white/30 border-0 gap-1.5 backdrop-blur-xs font-semibold"
            >
              <Receipt className="size-3.5" />
              Record Expense
            </Link>
          </div>
        </div>
      </div>

      {/* Income & Expense Chart */}
      <div>
        <IncomeExpense />
      </div>
    </div>
  );
}
