import { useState, useMemo, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  useAdminSubscriptions,
  useAdminSubscriptionFeatures,
  useUpdateSubscriptionPlan,
  type SubscriptionPlan,
} from "@/api/adminApi";
import PageHeader from "@/components/Headers/PageHeader";
import StatCard from "@/components/StatCard";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import { toast } from "sonner";
import {
  Sparkles,
  Layers,
  Search,
  CheckCircle2,
  SlidersHorizontal,
  Plus,
  ShieldCheck,
  FileSpreadsheet,
  Globe,
  Webhook,
  Headphones,
  Boxes,
  Lock,
  PieChart,
  Coins,
  FileText,
  ChevronRight,
  Settings2,
  LayoutGrid,
  Table as TableIcon,
  Check,
  Info,
  PackageCheck,
} from "lucide-react";

export const Route = createFileRoute("/admin/subscription/features/")({
  component: RouteComponent,
});

interface FeatureMeta {
  key: string;
  name: string;
  category:
    | "Core CRM"
    | "Invoicing & Billing"
    | "Analytics & Reports"
    | "Team & Security"
    | "Platform & Integrations"
    | "Custom Features";
  description: string;
  icon?: any;
}

const DEFAULT_FEATURE_REGISTRY: Record<string, Omit<FeatureMeta, "key">> = {
  analytics: {
    name: "Advanced Analytics & Insights",
    category: "Analytics & Reports",
    description:
      "Real-time revenue charts, financial breakdowns, churn metrics, and customer cohort insights.",
    icon: PieChart,
  },
  data_export: {
    name: "Automated Data Export (CSV / PDF)",
    category: "Analytics & Reports",
    description:
      "Export invoices, products, contacts, and transaction ledgers to CSV, Excel, and branded PDFs.",
    icon: FileSpreadsheet,
  },
  financial_reports: {
    name: "Financial & Profit Margin Reports",
    category: "Analytics & Reports",
    description:
      "Automated income statements, expense categorizations, and balance tracking across cycles.",
    icon: Coins,
  },
  custom_roles: {
    name: "Granular Roles & Permissions",
    category: "Team & Security",
    description:
      "Define staff permissions, role hierarchies, and module-specific viewing/editing restrictions.",
    icon: Lock,
  },
  audit_logs: {
    name: "Security Audit Trail",
    category: "Team & Security",
    description:
      "Immutable compliance logs tracking user sign-ins, financial record adjustments, and administrative edits.",
    icon: ShieldCheck,
  },
  bulk_import: {
    name: "Bulk CSV Data Import",
    category: "Core CRM",
    description:
      "Asynchronous background streaming and validation for bulk product catalogs and contact lists.",
    icon: Boxes,
  },
  inventory_management: {
    name: "Advanced Inventory & Stock Alerts",
    category: "Core CRM",
    description:
      "Multi-warehouse stock level tracking, low-stock notifications, and automatic deductions.",
    icon: PackageCheck,
  },
  invoicing: {
    name: "Recurring Invoices & Reminders",
    category: "Invoicing & Billing",
    description:
      "Automated recurring billing cycles, payment reminder dispatches, and online receipt links.",
    icon: FileText,
  },
  quotes_estimates: {
    name: "Quotes & Cost Estimation",
    category: "Invoicing & Billing",
    description:
      "Generate quotes with one-click conversion to active client invoices upon customer acceptance.",
    icon: FileText,
  },
  multi_currency: {
    name: "Multi-Currency & FX Rates",
    category: "Invoicing & Billing",
    description:
      "Support for international currencies with live exchange rate conversions on checkout.",
    icon: Coins,
  },
  white_labeling: {
    name: "White-Label & Custom Branding",
    category: "Platform & Integrations",
    description:
      "Custom corporate logo, brand colors, custom invoice email templates, and invoice domain footer.",
    icon: Sparkles,
  },
  custom_domain: {
    name: "Dedicated Custom Domain",
    category: "Platform & Integrations",
    description:
      "Map tenant customer portal and invoicing routes to custom company DNS subdomains.",
    icon: Globe,
  },
  api_access: {
    name: "REST API Access & Keys",
    category: "Platform & Integrations",
    description:
      "Programmatic tenant API access with rate-limited keys and granular endpoint permissions.",
    icon: Settings2,
  },
  webhooks: {
    name: "Outgoing Webhooks",
    category: "Platform & Integrations",
    description:
      "Trigger real-time HTTP webhooks on invoice payments, customer updates, and order creations.",
    icon: Webhook,
  },
  priority_support: {
    name: "24/7 Dedicated Priority Support",
    category: "Platform & Integrations",
    description:
      "Direct priority ticketing queue, expedited SLA responses, and dedicated account onboarding.",
    icon: Headphones,
  },
};

const CATEGORIES = [
  "All",
  "Core CRM",
  "Invoicing & Billing",
  "Analytics & Reports",
  "Team & Security",
  "Platform & Integrations",
  "Custom Features",
] as const;

function RouteComponent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [planFilter, setPlanFilter] = useState<string>("all");

  // Manage Plan modal state
  const [activeFeature, setActiveFeature] = useState<FeatureMeta | null>(null);
  const [selectedPlanIds, setSelectedPlanIds] = useState<string[]>([]);
  const [isSavingAssignments, setIsSavingAssignments] = useState(false);

  // New Custom Feature modal state
  const [customKey, setCustomKey] = useState("");
  const [customName, setCustomName] = useState("");
  const [customCategory, setCustomCategory] =
    useState<string>("Custom Features");
  const [customDesc, setCustomDesc] = useState("");
  const [customSelectedPlanIds, setCustomSelectedPlanIds] = useState<string[]>(
    [],
  );
  const [userCreatedFeatures, setUserCreatedFeatures] = useState<FeatureMeta[]>(
    [],
  );

  const configModalRef = useRef<ModalHandle>(null);
  const newFeatureModalRef = useRef<ModalHandle>(null);

  const featuresQuery = useAdminSubscriptionFeatures();
  const plansQuery = useAdminSubscriptions();
  const updatePlan = useUpdateSubscriptionPlan();

  const plans = plansQuery.data?.data || [];

  // Combine features from backend, default registry, user additions, and existing plan feature lists
  const allFeatures = useMemo(() => {
    const registryMap = new Map<string, FeatureMeta>();

    // 1. Seed with default registry
    Object.entries(DEFAULT_FEATURE_REGISTRY).forEach(([key, meta]) => {
      registryMap.set(key, {
        key,
        name: meta.name,
        category: meta.category,
        description: meta.description,
        icon: meta.icon,
      });
    });

    // 2. Add features returned by backend API
    const rawBackendData = featuresQuery.data;
    if (Array.isArray(rawBackendData)) {
      rawBackendData.forEach((item: any) => {
        if (typeof item === "string") {
          const trimmed = item.trim();
          if (!trimmed) return;
          if (!registryMap.has(trimmed)) {
            const formattedName = trimmed
              .split("_")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" ");
            registryMap.set(trimmed, {
              key: trimmed,
              name: formattedName,
              category: "Custom Features",
              description: `Platform subscription entitlement for ${formattedName.toLowerCase()}.`,
              icon: Sparkles,
            });
          }
        } else if (item && typeof item === "object") {
          const key = item.key || item.slug || item.id || item.name;
          if (key) {
            const existing = registryMap.get(key);
            registryMap.set(key, {
              key,
              name: item.name || existing?.name || key,
              category:
                item.category || existing?.category || "Custom Features",
              description:
                item.description ||
                existing?.description ||
                "Subscription capability.",
              icon: existing?.icon || Sparkles,
            });
          }
        }
      });
    }

    // 3. Add any features found in existing plans
    plans.forEach((plan) => {
      if (Array.isArray(plan.features)) {
        plan.features.forEach((featKey) => {
          const trimmed = typeof featKey === "string" ? featKey.trim() : "";
          if (trimmed && !registryMap.has(trimmed)) {
            const formattedName = trimmed
              .split("_")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" ");
            registryMap.set(trimmed, {
              key: trimmed,
              name: formattedName,
              category: "Custom Features",
              description: `Tenant feature flag for ${formattedName.toLowerCase()}.`,
              icon: Sparkles,
            });
          }
        });
      }
    });

    // 4. Add locally registered custom features
    userCreatedFeatures.forEach((feat) => {
      registryMap.set(feat.key, feat);
    });

    return Array.from(registryMap.values());
  }, [featuresQuery.data, plans, userCreatedFeatures]);

  // Filter features by category, search text, and plan inclusion
  const filteredFeatures = useMemo(() => {
    return allFeatures.filter((feat) => {
      const matchesSearch =
        feat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feat.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feat.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" || feat.category === selectedCategory;

      const matchesPlan =
        planFilter === "all"
          ? true
          : planFilter === "unassigned"
            ? !plans.some((p) => p.features?.includes(feat.key))
            : plans
                .find((p) => p.id === planFilter)
                ?.features?.includes(feat.key);

      return matchesSearch && matchesCategory && matchesPlan;
    });
  }, [allFeatures, searchTerm, selectedCategory, planFilter, plans]);

  // Statistics
  const stats = useMemo(() => {
    const total = allFeatures.length;
    const categoryCount = new Set(allFeatures.map((f) => f.category)).size;

    // Feature with highest adoption across plans
    const adoptionCounts = allFeatures.map((f) => {
      const count = plans.filter((p) => p.features?.includes(f.key)).length;
      return { key: f.key, name: f.name, count };
    });
    adoptionCounts.sort((a, b) => b.count - a.count);
    const topFeature = adoptionCounts[0];

    const unassignedCount = allFeatures.filter(
      (f) => !plans.some((p) => p.features?.includes(f.key)),
    ).length;

    return {
      total,
      categoryCount,
      topFeature: topFeature?.count > 0 ? topFeature.name : "None",
      topFeatureCount: topFeature?.count || 0,
      unassignedCount,
    };
  }, [allFeatures, plans]);

  // Open modal to configure which plans include a feature
  const handleOpenConfigure = (feature: FeatureMeta) => {
    setActiveFeature(feature);
    const enabledPlanIds = plans
      .filter((p) => p.features?.includes(feature.key))
      .map((p) => p.id);
    setSelectedPlanIds(enabledPlanIds);
    configModalRef.current?.open();
  };

  // Toggle plan selection in configuration modal
  const handleTogglePlan = (planId: string) => {
    setSelectedPlanIds((prev) =>
      prev.includes(planId)
        ? prev.filter((id) => id !== planId)
        : [...prev, planId],
    );
  };

  // Save changes to plans for this feature
  const handleSavePlanAssignments = async () => {
    if (!activeFeature) return;
    setIsSavingAssignments(true);

    try {
      const updates = plans.map(async (plan) => {
        const currentlyHas = (plan.features || []).includes(activeFeature.key);
        const shouldHave = selectedPlanIds.includes(plan.id);

        if (currentlyHas !== shouldHave) {
          const nextFeatures = shouldHave
            ? Array.from(new Set([...(plan.features || []), activeFeature.key]))
            : (plan.features || []).filter((f) => f !== activeFeature.key);

          return updatePlan.mutateAsync({
            id: plan.id,
            features: nextFeatures,
          });
        }
        return Promise.resolve();
      });

      await Promise.all(updates);
      toast.success(
        `Updated plan assignments for feature "${activeFeature.name}".`,
      );
      configModalRef.current?.close();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update plans.");
    } finally {
      setIsSavingAssignments(false);
    }
  };

  // Quick toggle a single plan from card/table
  const handleQuickTogglePlanFeature = async (
    featureKey: string,
    featureName: string,
    plan: SubscriptionPlan,
  ) => {
    const isCurrentlyActive = (plan.features || []).includes(featureKey);
    const updatedFeatures = isCurrentlyActive
      ? (plan.features || []).filter((f) => f !== featureKey)
      : Array.from(new Set([...(plan.features || []), featureKey]));

    try {
      await updatePlan.mutateAsync({
        id: plan.id,
        features: updatedFeatures,
      });
      toast.success(
        isCurrentlyActive
          ? `Removed "${featureName}" from ${plan.name} plan.`
          : `Added "${featureName}" to ${plan.name} plan.`,
      );
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || `Failed to update ${plan.name} plan.`,
      );
    }
  };

  // Handle register custom feature
  const handleCreateCustomFeature = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = customKey
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "_");

    if (!cleanKey) {
      toast.error("Feature identifier key is required (e.g., ai_assistant)");
      return;
    }

    if (allFeatures.some((f) => f.key === cleanKey)) {
      toast.error(`Feature key "${cleanKey}" already exists.`);
      return;
    }

    const newFeat: FeatureMeta = {
      key: cleanKey,
      name: customName.trim() || cleanKey,
      category: (customCategory as any) || "Custom Features",
      description:
        customDesc.trim() ||
        `Tenant capability entitlement for ${customName || cleanKey}.`,
      icon: Sparkles,
    };

    // If any plans were pre-selected, update them
    if (customSelectedPlanIds.length > 0) {
      try {
        const updates = plans
          .filter((p) => customSelectedPlanIds.includes(p.id))
          .map((plan) => {
            const nextFeatures = Array.from(
              new Set([...(plan.features || []), cleanKey]),
            );
            return updatePlan.mutateAsync({
              id: plan.id,
              features: nextFeatures,
            });
          });
        await Promise.all(updates);
      } catch (err: any) {
        toast.error("Failed to assign feature to selected plans.");
      }
    }

    setUserCreatedFeatures((prev) => [...prev, newFeat]);
    toast.success(`Feature "${newFeat.name}" registered successfully.`);

    // Reset form
    setCustomKey("");
    setCustomName("");
    setCustomDesc("");
    setCustomSelectedPlanIds([]);
    newFeatureModalRef.current?.close();
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Page Header */}
      <PageHeader
        title="Subscription Features Catalog"
        description="Explore, define, and manage feature flags and capability entitlements across subscription tiers."
      >
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/admin/subscription"
            className="btn btn-sm btn-ghost border border-base-300"
          >
            <Layers className="size-4" /> View Plans
          </Link>
          <button
            onClick={() => newFeatureModalRef.current?.open()}
            className="btn btn-sm btn-primary"
          >
            <Plus className="size-4" /> Add Feature Flag
          </button>
        </div>
      </PageHeader>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Features"
          value={stats.total}
          desc="Available platform entitlements"
          icon={<Sparkles className="size-5" />}
          variant="primary"
        />
        <StatCard
          title="Categories"
          value={stats.categoryCount}
          desc="Functional feature domains"
          icon={<SlidersHorizontal className="size-5" />}
          variant="info"
        />
        <StatCard
          title="Active Plans"
          value={plans.length}
          desc="Configured subscription tiers"
          icon={<Layers className="size-5" />}
          variant="success"
        />
        <StatCard
          title="Unassigned Features"
          value={stats.unassignedCount}
          desc="Features not yet on any tier"
          icon={<Info className="size-5" />}
          variant={stats.unassignedCount > 0 ? "warning" : "default"}
        />
      </div>

      {/* Main Section */}
      <div className="card bg-base-100 border border-base-200 shadow-sm overflow-hidden">
        {/* Search & Filter Toolbar */}
        <div className="p-4 sm:p-5 border-b border-base-200 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-base-content/40 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search features by name, key, or capability..."
                className="input input-sm input-bordered w-full pl-9 bg-base-100"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-base-content/50 hover:text-base-content"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Filter by Plan & View Mode */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-sm">
                <span className="text-base-content/60 font-medium">Plan:</span>
                <select
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value)}
                  className="select select-sm select-bordered"
                >
                  <option value="all">All Tiers</option>
                  <option value="unassigned">Unassigned Only</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* View Switcher */}
              <div className="join border border-base-300 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`join-item btn btn-sm btn-ghost px-2.5 ${
                    viewMode === "grid" ? "bg-base-200 font-semibold" : ""
                  }`}
                  title="Grid view"
                >
                  <LayoutGrid className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`join-item btn btn-sm btn-ghost px-2.5 ${
                    viewMode === "table" ? "bg-base-200 font-semibold" : ""
                  }`}
                  title="Table view"
                >
                  <TableIcon className="size-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Category Chips Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {CATEGORIES.map((cat) => {
              const count =
                cat === "All"
                  ? allFeatures.length
                  : allFeatures.filter((f) => f.category === cat).length;
              const isSelected = selectedCategory === cat;

              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`btn btn-xs rounded-full transition-all shrink-0 ${
                    isSelected
                      ? "btn-primary text-primary-content"
                      : "btn-ghost border border-base-300 text-base-content/70 hover:border-base-content/30"
                  }`}
                >
                  {cat}
                  <span
                    className={`badge badge-xs ml-1 ${
                      isSelected
                        ? "bg-primary-content/20 text-primary-content"
                        : "badge-ghost"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content View */}
        {filteredFeatures.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="size-14 rounded-full bg-base-200 text-base-content/40 flex items-center justify-center mx-auto">
              <Search className="size-6" />
            </div>
            <h3 className="font-semibold text-lg text-base-content">
              No features found
            </h3>
            <p className="text-sm text-base-content/60 max-w-sm mx-auto">
              No features match your current filters. Try changing your search
              term or resetting the category filter.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All");
                setPlanFilter("all");
              }}
              className="btn btn-sm btn-outline"
            >
              Reset Filters
            </button>
          </div>
        ) : viewMode === "grid" ? (
          /* Grid Card View */
          <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredFeatures.map((feat) => {
              const IconComponent = feat.icon || Sparkles;
              const includedPlans = plans.filter((p) =>
                p.features?.includes(feat.key),
              );

              return (
                <div
                  key={feat.key}
                  className="card bg-base-100 border border-base-200 hover:border-primary/30 transition-all duration-200 hover:shadow-md flex flex-col justify-between"
                >
                  <div className="p-5 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <IconComponent className="size-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-base-content text-base leading-snug">
                            {feat.name}
                          </h4>
                          <span className="badge badge-xs badge-ghost font-mono text-base-content/60">
                            {feat.key}
                          </span>
                        </div>
                      </div>

                      <span className="badge badge-sm badge-outline text-xs text-base-content/70 shrink-0">
                        {feat.category}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-base-content/70 line-clamp-2 leading-relaxed">
                      {feat.description}
                    </p>

                    {/* Plan Inclusion Pills */}
                    <div className="pt-2 border-t border-base-200">
                      <div className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-2 flex items-center justify-between">
                        <span>Included in Tiers</span>
                        <span className="text-xs font-normal normal-case text-base-content/60">
                          {includedPlans.length} of {plans.length} plans
                        </span>
                      </div>

                      {plans.length === 0 ? (
                        <p className="text-xs text-base-content/40 italic">
                          No plans configured yet.
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {plans.map((p) => {
                            const isIncluded = (p.features || []).includes(
                              feat.key,
                            );
                            return (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() =>
                                  handleQuickTogglePlanFeature(
                                    feat.key,
                                    feat.name,
                                    p,
                                  )
                                }
                                title={`Click to ${
                                  isIncluded ? "remove from" : "add to"
                                } ${p.name}`}
                                className={`badge badge-sm gap-1 cursor-pointer transition-all ${
                                  isIncluded
                                    ? "badge-primary font-medium"
                                    : "badge-ghost opacity-50 hover:opacity-100 hover:border-primary/40"
                                }`}
                              >
                                {isIncluded ? (
                                  <Check className="size-3" />
                                ) : (
                                  <Plus className="size-3" />
                                )}
                                {p.name}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="px-5 py-3 bg-base-200/40 border-t border-base-200 flex items-center justify-between">
                    <span className="text-xs text-base-content/50">
                      {includedPlans.length > 0 ? (
                        <span className="flex items-center gap-1 text-success font-medium">
                          <CheckCircle2 className="size-3.5" /> Active in{" "}
                          {includedPlans.length} tier
                          {includedPlans.length > 1 ? "s" : ""}
                        </span>
                      ) : (
                        <span className="text-base-content/40">Unassigned</span>
                      )}
                    </span>

                    <button
                      onClick={() => handleOpenConfigure(feat)}
                      className="btn btn-xs btn-outline btn-primary gap-1"
                    >
                      <Settings2 className="size-3.5" /> Configure
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Detailed Table View */
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr className="bg-base-200/50 text-base-content/70">
                  <th className="font-semibold">Feature & Key</th>
                  <th className="font-semibold">Category</th>
                  <th className="font-semibold">Description</th>
                  <th className="font-semibold">Plan Availability</th>
                  <th className="font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-base-200">
                {filteredFeatures.map((feat) => {
                  const IconComponent = feat.icon || Sparkles;

                  return (
                    <tr
                      key={feat.key}
                      className="hover:bg-base-200/30 transition-colors"
                    >
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <IconComponent className="size-4" />
                          </div>
                          <div>
                            <div className="font-semibold text-base-content">
                              {feat.name}
                            </div>
                            <div className="font-mono text-xs text-base-content/50">
                              {feat.key}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="badge badge-sm badge-ghost text-xs">
                          {feat.category}
                        </span>
                      </td>

                      <td>
                        <div className="text-sm text-base-content/70 max-w-sm">
                          {feat.description}
                        </div>
                      </td>

                      <td>
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {plans.map((p) => {
                            const isIncluded = (p.features || []).includes(
                              feat.key,
                            );
                            return (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() =>
                                  handleQuickTogglePlanFeature(
                                    feat.key,
                                    feat.name,
                                    p,
                                  )
                                }
                                title={`Click to ${
                                  isIncluded ? "remove from" : "add to"
                                } ${p.name}`}
                                className={`badge badge-xs gap-1 cursor-pointer transition-all ${
                                  isIncluded
                                    ? "badge-primary font-medium"
                                    : "badge-ghost opacity-40 hover:opacity-100 hover:border-primary/40"
                                }`}
                              >
                                {isIncluded && <Check className="size-2.5" />}
                                {p.name}
                              </button>
                            );
                          })}
                        </div>
                      </td>

                      <td className="text-right">
                        <button
                          onClick={() => handleOpenConfigure(feat)}
                          className="btn btn-xs btn-ghost btn-square"
                          title="Configure Tiers"
                        >
                          <ChevronRight className="size-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Configure Feature Plans Modal */}
      <Modal
        ref={configModalRef}
        title={
          activeFeature
            ? `Configure Feature: ${activeFeature.name}`
            : "Configure Feature"
        }
      >
        {activeFeature && (
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-base-200/50 border border-base-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="badge badge-sm badge-primary badge-outline">
                  {activeFeature.category}
                </span>
                <span className="font-mono text-xs text-base-content/50">
                  key: {activeFeature.key}
                </span>
              </div>
              <p className="text-sm text-base-content/80">
                {activeFeature.description}
              </p>
            </div>

            <div>
              <label className="label">
                <span className="label-text font-semibold text-base-content">
                  Enable Feature for Selected Subscription Plans:
                </span>
              </label>

              {plans.length === 0 ? (
                <div className="p-4 text-center text-sm text-base-content/50">
                  No subscription plans created yet. Create a plan first.
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {plans.map((plan) => {
                    const isChecked = selectedPlanIds.includes(plan.id);
                    return (
                      <label
                        key={plan.id}
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                          isChecked
                            ? "bg-primary/5 border-primary/40 text-base-content"
                            : "bg-base-100 border-base-200 text-base-content/70 hover:bg-base-200/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleTogglePlan(plan.id)}
                            className="checkbox checkbox-primary checkbox-sm"
                          />
                          <div>
                            <div className="font-semibold text-sm">
                              {plan.name}
                            </div>
                            <div className="text-xs text-base-content/50">
                              {plan.isCustomPrice
                                ? "Custom Pricing"
                                : `$${plan.priceMonthly}/mo · $${plan.priceYearly}/yr`}
                            </div>
                          </div>
                        </div>

                        <span
                          className={`badge badge-sm ${
                            isChecked ? "badge-primary" : "badge-ghost"
                          }`}
                        >
                          {isChecked ? "Enabled" : "Disabled"}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-base-200">
              <button
                type="button"
                onClick={() => configModalRef.current?.close()}
                className="btn btn-sm btn-ghost"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePlanAssignments}
                disabled={isSavingAssignments}
                className="btn btn-sm btn-primary"
              >
                {isSavingAssignments ? "Saving Changes..." : "Save Assignments"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Custom Feature Flag Modal */}
      <Modal ref={newFeatureModalRef} title="Register New Feature Flag">
        <form onSubmit={handleCreateCustomFeature} className="space-y-4">
          <div>
            <label className="label">
              <span className="label-text font-semibold">
                Feature Key (Slug) *
              </span>
            </label>
            <input
              type="text"
              required
              value={customKey}
              onChange={(e) => setCustomKey(e.target.value)}
              placeholder="e.g. ai_copilot, custom_ssl, whatsapp_integration"
              className="input input-sm input-bordered font-mono w-full"
            />
            <span className="text-xs text-base-content/50 mt-1 block">
              Unique snake_case identifier used in code and billing limits.
            </span>
          </div>

          <div>
            <label className="label">
              <span className="label-text font-semibold">Display Name *</span>
            </label>
            <input
              type="text"
              required
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g. AI Assistant Copilot"
              className="input input-sm input-bordered w-full"
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text font-semibold">Category</span>
            </label>
            <select
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              className="select select-sm select-bordered w-full"
            >
              <option value="Core CRM">Core CRM</option>
              <option value="Invoicing & Billing">Invoicing & Billing</option>
              <option value="Analytics & Reports">Analytics & Reports</option>
              <option value="Team & Security">Team & Security</option>
              <option value="Platform & Integrations">
                Platform & Integrations
              </option>
              <option value="Custom Features">Custom Features</option>
            </select>
          </div>

          <div>
            <label className="label">
              <span className="label-text font-semibold">Description</span>
            </label>
            <textarea
              value={customDesc}
              onChange={(e) => setCustomDesc(e.target.value)}
              placeholder="Describe what tenant capabilities or limits this feature unlocks"
              className="textarea textarea-bordered textarea-sm w-full"
              rows={2}
            />
          </div>

          {plans.length > 0 && (
            <div>
              <label className="label">
                <span className="label-text font-semibold">
                  Initial Plan Entitlements (Optional)
                </span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {plans.map((plan) => {
                  const checked = customSelectedPlanIds.includes(plan.id);
                  return (
                    <label
                      key={plan.id}
                      className="flex items-center gap-2 p-2 rounded-lg border border-base-200 hover:bg-base-200/50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setCustomSelectedPlanIds((prev) =>
                            prev.includes(plan.id)
                              ? prev.filter((id) => id !== plan.id)
                              : [...prev, plan.id],
                          )
                        }
                        className="checkbox checkbox-primary checkbox-xs"
                      />
                      <span className="text-xs font-medium truncate">
                        {plan.name}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t border-base-200">
            <button
              type="button"
              onClick={() => newFeatureModalRef.current?.close()}
              className="btn btn-sm btn-ghost"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-sm btn-primary">
              Register Feature
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
