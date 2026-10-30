import { useState, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  useAdminSubscriptions,
  useAdminSubscriptionFeatures,
  useUpdateSubscriptionPlan,
  type SubscriptionPlan,
} from "@/api/adminApi";
import PageHeader from "@/components/Headers/PageHeader";
import PageLoader from "@/components/layout/PageLoader";
import StatCard from "@/components/StatCard";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import { toast } from "sonner";
import {
  Sparkles,
  Layers,
  Search,
  CheckCircle2,
  SlidersHorizontal,
  Settings2,
  LayoutGrid,
  Table as TableIcon,
  Check,
  Info,
  X,
} from "lucide-react";

export const Route = createFileRoute("/admin/subscription/features/")({
  component: RouteComponent,
});

interface FeatureMeta {
  key: string;
  name: string;
  category: string;
  description: string;
}

function normalizeFeatures(data: unknown): FeatureMeta[] {
  if (!Array.isArray(data)) return [];

  const features = new Map<string, FeatureMeta>();
  for (const item of data) {
    if (typeof item === "string") {
      const key = item.trim();
      if (!key) continue;
      features.set(key, {
        key,
        name: key
          .replace(/_/g, " ")
          .replace(/\b\w/g, (letter) => letter.toUpperCase()),
        category: "General",
        description: "",
      });
    } else if (item && typeof item === "object") {
      const feature = item as Record<string, unknown>;
      const rawKey = feature.key ?? feature.value;
      const key = typeof rawKey === "string" ? rawKey.trim() : "";
      if (!key) continue;
      const rawName = feature.name ?? feature.label;
      features.set(key, {
        key,
        name:
          typeof rawName === "string" && rawName.trim() ? rawName.trim() : key,
        category:
          typeof feature.category === "string" && feature.category.trim()
            ? feature.category.trim()
            : "General",
        description:
          typeof feature.description === "string" ? feature.description : "",
      });
    }
  }
  return Array.from(features.values());
}

function RouteComponent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [planFilter, setPlanFilter] = useState<string>("all");

  // Manage Plan modal state
  const [activeFeature, setActiveFeature] = useState<FeatureMeta | null>(null);
  const [selectedPlanIds, setSelectedPlanIds] = useState<string[]>([]);
  const [isSavingAssignments, setIsSavingAssignments] = useState(false);

  const configModalRef = useRef<ModalHandle>(null);

  const featuresQuery = useAdminSubscriptionFeatures();
  const plansQuery = useAdminSubscriptions();
  const updatePlan = useUpdateSubscriptionPlan();

  const plans = plansQuery.data?.data || [];

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
      toast.success(`Updated plan assignments for "${activeFeature.name}".`);
      configModalRef.current?.close();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update plans.");
    } finally {
      setIsSavingAssignments(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Page Header */}
      <PageHeader
        title="Subscription Features Catalog"
        description="Manage platform entitlements and configure which subscription plans include them."
      >
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/admin/subscription"
            className="btn btn-sm btn-ghost border border-base-300 gap-1.5"
          >
            <Layers className="size-4" /> View Plans
          </Link>
        </div>
      </PageHeader>

      <PageLoader
        query={featuresQuery}
        loadingText="Loading subscription features..."
        emptyState={{
          title: "No features available",
          description:
            "The backend has not returned any subscription features.",
        }}
      >
        {(data) => {
          const allFeatures = normalizeFeatures(data);
          const categories = [
            "All",
            ...Array.from(
              new Set(allFeatures.map((feature) => feature.category)),
            ),
          ];
          const term = searchTerm.toLowerCase();
          const filteredFeatures = allFeatures.filter((feature) => {
            const matchesSearch =
              feature.name.toLowerCase().includes(term) ||
              feature.key.toLowerCase().includes(term) ||
              feature.description.toLowerCase().includes(term);
            const matchesCategory =
              selectedCategory === "All" ||
              feature.category === selectedCategory;
            const matchesPlan =
              planFilter === "all" ||
              (planFilter === "unassigned"
                ? !plans.some((plan) => plan.features?.includes(feature.key))
                : plans
                    .find((plan) => plan.id === planFilter)
                    ?.features?.includes(feature.key));
            return matchesSearch && matchesCategory && matchesPlan;
          });
          const stats = {
            total: allFeatures.length,
            categoryCount: categories.length - 1,
            unassignedCount: allFeatures.filter(
              (feature) =>
                !plans.some((plan) => plan.features?.includes(feature.key)),
            ).length,
          };

          return (
            <div className="space-y-6">
              {/* Overview Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Total Features"
                  value={stats.total}
                  desc="Platform entitlements"
                  icon={<Sparkles className="size-5" />}
                  variant="primary"
                />
                <StatCard
                  title="Categories"
                  value={stats.categoryCount}
                  desc="Functional domains"
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
                  desc="Features not on any tier"
                  icon={<Info className="size-5" />}
                  variant={stats.unassignedCount > 0 ? "warning" : "default"}
                />
              </div>

              {/* Search & Filter Toolbar */}
              <div className="card bg-base-100 border border-base-200/80 shadow-xs p-4 sm:p-5 space-y-4 rounded-2xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  {/* Search Input */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-base-content/40 pointer-events-none" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search features by name, key, or capability..."
                      className="input input-sm input-bordered w-full pl-9 pr-8 bg-base-100 rounded-lg text-sm"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content p-0.5"
                        title="Clear search"
                      >
                        <X className="size-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Filter by Plan & View Mode */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 text-xs text-base-content/70">
                      <span className="font-medium">Plan:</span>
                      <select
                        value={planFilter}
                        onChange={(e) => setPlanFilter(e.target.value)}
                        className="select select-sm select-bordered rounded-lg text-xs"
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
                    <div className="join border border-base-300 rounded-lg overflow-hidden bg-base-200/40">
                      <button
                        type="button"
                        onClick={() => setViewMode("grid")}
                        className={`join-item btn btn-sm btn-ghost px-3 ${
                          viewMode === "grid"
                            ? "bg-base-100 font-semibold text-primary shadow-xs"
                            : "text-base-content/60"
                        }`}
                        title="Grid view"
                      >
                        <LayoutGrid className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode("table")}
                        className={`join-item btn btn-sm btn-ghost px-3 ${
                          viewMode === "table"
                            ? "bg-base-100 font-semibold text-primary shadow-xs"
                            : "text-base-content/60"
                        }`}
                        title="Table view"
                      >
                        <TableIcon className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Category Chips Filter */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin pt-2 border-t border-base-200/50">
                  <span className="text-[11px] font-semibold text-base-content/40 uppercase tracking-wider shrink-0 mr-1">
                    Category:
                  </span>
                  {categories.map((cat) => {
                    const count =
                      cat === "All"
                        ? allFeatures.length
                        : allFeatures.filter((f) => f.category === cat).length;
                    const isSelected = selectedCategory === cat;

                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`btn btn-xs rounded-full transition-all shrink-0 font-normal ${
                          isSelected
                            ? "btn-primary text-primary-content font-medium shadow-xs"
                            : "btn-ghost border border-base-300/80 text-base-content/70 hover:border-base-content/30"
                        }`}
                      >
                        {cat}
                        <span
                          className={`badge badge-xs ml-1 ${
                            isSelected
                              ? "bg-primary-content/25 text-primary-content"
                              : "badge-ghost opacity-70"
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Main Content View */}
              {allFeatures.length === 0 ? (
                <div className="card bg-base-100 border border-base-200 p-12 text-center space-y-2 rounded-2xl">
                  <h3 className="font-semibold text-lg">
                    No features available
                  </h3>
                  <p className="text-sm text-base-content/60">
                    The backend has not returned any subscription features.
                  </p>
                </div>
              ) : filteredFeatures.length === 0 ? (
                <div className="card bg-base-100 border border-base-200 p-12 text-center space-y-3 rounded-2xl">
                  <div className="size-12 rounded-full bg-base-200 text-base-content/40 flex items-center justify-center mx-auto">
                    <Search className="size-5" />
                  </div>
                  <h3 className="font-semibold text-base text-base-content">
                    No matching features
                  </h3>
                  <p className="text-xs text-base-content/60 max-w-sm mx-auto">
                    No features match your current search or filters. Try
                    clearing filters to see all available features.
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("All");
                      setPlanFilter("all");
                    }}
                    className="btn btn-xs btn-outline rounded-lg mx-auto"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : viewMode === "grid" ? (
                /* Spacious, Uncluttered Grid Card View */
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filteredFeatures.map((feat) => {
                    const includedPlans = plans.filter((p) =>
                      p.features?.includes(feat.key),
                    );

                    return (
                      <div
                        key={feat.key}
                        className="card bg-base-100 border border-base-200/80 hover:border-primary/40 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between rounded-2xl overflow-hidden group"
                      >
                        {/* Card Body */}
                        <div className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col">
                          {/* Top Row: Category Badge & Tier Counter */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="badge badge-sm badge-ghost font-medium text-xs text-base-content/70">
                              {feat.category}
                            </span>
                            <span
                              className={`badge badge-sm font-medium ${
                                includedPlans.length > 0
                                  ? "badge-success/15 text-success border-success/20"
                                  : "badge-warning/15 text-warning border-warning/20"
                              }`}
                            >
                              {includedPlans.length > 0
                                ? `${includedPlans.length} / ${plans.length} tiers`
                                : "Unassigned"}
                            </span>
                          </div>

                          {/* Title & Key */}
                          <div className="flex items-start gap-3">
                            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform duration-200">
                              <Sparkles className="size-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4
                                className="font-semibold text-base text-base-content leading-snug line-clamp-1"
                                title={feat.name}
                              >
                                {feat.name}
                              </h4>
                              <div
                                className="font-mono text-xs text-base-content/40 truncate mt-0.5"
                                title={feat.key}
                              >
                                {feat.key}
                              </div>
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-sm text-base-content/70 leading-relaxed line-clamp-2 min-h-[2.5rem]">
                            {feat.description ||
                              "Platform entitlement rule for feature gating and subscription tier enforcement."}
                          </p>

                          {/* Included Tiers Section */}
                          <div className="mt-auto pt-3.5 border-t border-base-200/70">
                            <div className="text-[11px] font-semibold text-base-content/50 uppercase tracking-wider mb-2">
                              Active In Plans
                            </div>
                            {includedPlans.length === 0 ? (
                              <p className="text-xs text-base-content/40 italic py-1">
                                Not enabled in any plan yet
                              </p>
                            ) : (
                              <div className="flex flex-wrap gap-1.5">
                                {includedPlans.map((p) => (
                                  <span
                                    key={p.id}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                                  >
                                    <Check className="size-3" />
                                    {p.name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Card Footer */}
                        <div className="px-5 py-3 bg-base-200/40 border-t border-base-200 flex items-center justify-between gap-2">
                          <div className="text-xs text-base-content/50 truncate">
                            {includedPlans.length === plans.length &&
                            plans.length > 0 ? (
                              <span className="text-success font-medium flex items-center gap-1">
                                <CheckCircle2 className="size-3.5" /> All plans
                                active
                              </span>
                            ) : includedPlans.length > 0 ? (
                              <span>Partially assigned</span>
                            ) : (
                              <span className="text-warning font-medium">
                                Needs assignment
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleOpenConfigure(feat)}
                            className="btn btn-xs btn-outline btn-primary gap-1.5 rounded-lg"
                          >
                            <Settings2 className="size-3.5" /> Configure Tiers
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Detailed Clean Table View */
                <div className="card bg-base-100 border border-base-200/80 shadow-xs overflow-hidden rounded-2xl">
                  <div className="overflow-x-auto">
                    <table className="table w-full">
                      <thead>
                        <tr className="bg-base-200/40 text-base-content/70 text-xs uppercase tracking-wider">
                          <th className="font-semibold py-3.5 pl-6">
                            Feature & Key
                          </th>
                          <th className="font-semibold py-3.5">Category</th>
                          <th className="font-semibold py-3.5">Description</th>
                          <th className="font-semibold py-3.5">
                            Plan Availability
                          </th>
                          <th className="font-semibold py-3.5 text-right pr-6">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-base-200/60">
                        {filteredFeatures.map((feat) => {
                          const includedPlans = plans.filter((p) =>
                            p.features?.includes(feat.key),
                          );

                          return (
                            <tr
                              key={feat.key}
                              className="hover:bg-base-200/30 transition-colors"
                            >
                              <td className="py-4 pl-6">
                                <div className="flex items-center gap-3">
                                  <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                    <Sparkles className="size-4" />
                                  </div>
                                  <div>
                                    <div className="font-semibold text-sm text-base-content">
                                      {feat.name}
                                    </div>
                                    <div className="font-mono text-xs text-base-content/40">
                                      {feat.key}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td className="py-4">
                                <span className="badge badge-sm badge-ghost text-xs">
                                  {feat.category}
                                </span>
                              </td>

                              <td className="py-4">
                                <div className="text-sm text-base-content/70 max-w-sm leading-relaxed">
                                  {feat.description || "—"}
                                </div>
                              </td>

                              <td className="py-4">
                                {includedPlans.length > 0 ? (
                                  <div className="flex flex-wrap gap-1.5 max-w-xs">
                                    {includedPlans.map((p) => (
                                      <span
                                        key={p.id}
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                                      >
                                        <Check className="size-3" />
                                        {p.name}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-xs text-base-content/40 italic">
                                    Unassigned
                                  </span>
                                )}
                              </td>

                              <td className="py-4 text-right pr-6">
                                <button
                                  type="button"
                                  onClick={() => handleOpenConfigure(feat)}
                                  className="btn btn-xs btn-outline btn-primary gap-1 rounded-lg"
                                >
                                  <Settings2 className="size-3.5" /> Configure
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        }}
      </PageLoader>

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
              {activeFeature.description && (
                <p className="text-sm text-base-content/80 leading-relaxed">
                  {activeFeature.description}
                </p>
              )}
            </div>

            <div>
              <label className="label pb-2">
                <span className="label-text font-semibold text-base-content">
                  Enable Feature for Selected Subscription Plans:
                </span>
                <span className="text-xs text-base-content/50">
                  {selectedPlanIds.length} of {plans.length} selected
                </span>
              </label>

              {plans.length === 0 ? (
                <div className="p-6 text-center text-sm text-base-content/50 border border-dashed border-base-300 rounded-xl">
                  No subscription plans created yet. Create a plan first.
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {plans.map((plan) => {
                    const isChecked = selectedPlanIds.includes(plan.id);
                    return (
                      <label
                        key={plan.id}
                        className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                          isChecked
                            ? "bg-primary/5 border-primary/40 text-base-content shadow-xs"
                            : "bg-base-100 border-base-200 text-base-content/70 hover:bg-base-200/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleTogglePlan(plan.id)}
                            className="checkbox checkbox-primary checkbox-sm rounded"
                          />
                          <div>
                            <div className="font-semibold text-sm">
                              {plan.name}
                            </div>
                            <div className="text-xs text-base-content/50">
                              {plan.isCustomPrice
                                ? "Custom Pricing"
                                : `₦${plan.priceMonthly?.toLocaleString() || 0}/mo · ₦${plan.priceYearly?.toLocaleString() || 0}/yr`}
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
    </div>
  );
}
