import { Check } from "lucide-react";
import type { TenantSubscriptionPlan } from "@/api/tenantApi";

const limitFields = [
  ["maxStaff", "Staff users"],
  ["maxContacts", "Contacts"],
  ["maxProducts", "Products"],
  ["maxServices", "Services"],
  ["maxInvoicesPerMonth", "Invoices / month"],
  ["maxFinancialRecordsPerMonth", "Financial records / month"],
  ["maxOrdersPerMonth", "Orders / month"],
  ["maxCategories", "Categories"],
  ["maxLeads", "Leads"],
  ["maxCompanies", "Companies"],
  ["maxQuotes", "Quotes"],
] as const;

export function availablePlanLimits(plan: TenantSubscriptionPlan) {
  return limitFields.flatMap(([key, label]) => {
    const value = plan[key];
    return typeof value === "number"
      ? [{ key, label, value: value === -1 ? "Unlimited" : value.toLocaleString() }]
      : [];
  });
}

export default function PlanDetails({ plan }: { plan: TenantSubscriptionPlan }) {
  const limits = availablePlanLimits(plan);
  const features = plan.features ?? [];
  if (!limits.length && !features.length && plan.trialDays == null) return null;

  return (
    <div className="grid gap-5 text-sm sm:grid-cols-2">
      <section className="space-y-2">
        <h3 className="font-semibold text-base-content">Resource limits</h3>
        {limits.length > 0 ? (
          <dl className="space-y-1">
            {limits.map((limit) => (
              <div key={limit.key} className="flex justify-between gap-3 border-b border-base-200 py-1">
                <dt className="text-base-content/70">{limit.label}</dt>
                <dd className="font-medium tabular-nums">{limit.value}</dd>
              </div>
            ))}
          </dl>
        ) : <p className="text-base-content/60">No limits listed.</p>}
        {typeof plan.trialDays === "number" && (
          <p className="text-xs text-base-content/70">Trial length: {plan.trialDays} days</p>
        )}
      </section>
      {features.length > 0 && (
        <section className="space-y-2">
          <h3 className="font-semibold text-base-content">Included features</h3>
          <ul className="space-y-1.5">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-base-content/80">
                <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                <span>{feature.replace(/[_-]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
