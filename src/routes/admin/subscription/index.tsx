import { useState, useRef, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  useAdminSubscriptions,
  useAdminSubscriptionFeatures,
  useCreateSubscriptionPlan,
  useUpdateSubscriptionPlan,
  useDeleteSubscriptionPlan,
  type SubscriptionPlan,
} from "@/api/adminApi";
import PageHeader from "@/components/Headers/PageHeader";
import SimpleContainer from "@/components/SimpleContainer";
import CustomTable from "@/components/tables/CustomTable";
import type { Actions } from "@/components/tables/pop-up";
import PageLoader from "@/components/layout/PageLoader";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import { toast } from "sonner";
import { PlusCircleIcon, Layers, Sparkles, Check, Plus } from "lucide-react";

export const Route = createFileRoute("/admin/subscription/")({
  component: RouteComponent,
});

const DEFAULT_PLAN_FORM = {
  name: "",
  description: "",
  priceMonthly: 0,
  priceYearly: 0,
  trialDays: 14,
  maxStaff: 3,
  maxContacts: 100,
  maxProducts: 25,
  maxServices: 10,
  maxInvoicesPerMonth: 30,
  maxOrdersPerMonth: 60,
  maxCategories: 10,
  features: "analytics, data_export",
  isCustomPrice: false,
  isActive: true,
};

const SUGGESTED_FEATURES = [
  "analytics",
  "data_export",
  "financial_reports",
  "custom_roles",
  "audit_logs",
  "bulk_import",
  "inventory_management",
  "invoicing",
  "quotes_estimates",
  "multi_currency",
  "white_labeling",
  "custom_domain",
  "api_access",
  "webhooks",
  "priority_support",
];

function RouteComponent() {
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [formData, setFormData] = useState(DEFAULT_PLAN_FORM);

  const query = useAdminSubscriptions();
  const featuresQuery = useAdminSubscriptionFeatures();
  const createPlan = useCreateSubscriptionPlan();
  const updatePlan = useUpdateSubscriptionPlan();
  const deletePlan = useDeleteSubscriptionPlan();

  const planModalRef = useRef<ModalHandle>(null);

  // Available feature keys list
  const availableFeatures = useMemo(() => {
    const list = new Set(SUGGESTED_FEATURES);
    if (Array.isArray(featuresQuery.data)) {
      featuresQuery.data.forEach((f: any) => {
        if (typeof f === "string") list.add(f);
        else if (f && typeof f === "object" && f.key) list.add(f.key);
      });
    }
    return Array.from(list);
  }, [featuresQuery.data]);

  const handleOpenCreate = () => {
    setEditingPlan(null);
    setFormData(DEFAULT_PLAN_FORM);
    planModalRef.current?.open();
  };

  const handleOpenEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description || "",
      priceMonthly: plan.priceMonthly || 0,
      priceYearly: plan.priceYearly || 0,
      trialDays: plan.trialDays || 14,
      maxStaff: plan.maxStaff ?? 3,
      maxContacts: plan.maxContacts ?? 100,
      maxProducts: plan.maxProducts ?? 25,
      maxServices: plan.maxServices ?? 10,
      maxInvoicesPerMonth: plan.maxInvoicesPerMonth ?? 30,
      maxOrdersPerMonth: plan.maxOrdersPerMonth ?? 60,
      maxCategories: plan.maxCategories ?? 10,
      features: (plan.features || []).join(", "),
      isCustomPrice: plan.isCustomPrice || false,
      isActive: plan.isActive !== undefined ? plan.isActive : true,
    });
    planModalRef.current?.open();
  };

  const toggleFeatureInForm = (featureKey: string) => {
    const currentFeatures = formData.features
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean);

    let updated: string[];
    if (currentFeatures.includes(featureKey)) {
      updated = currentFeatures.filter((f) => f !== featureKey);
    } else {
      updated = [...currentFeatures, featureKey];
    }
    setFormData({ ...formData, features: updated.join(", ") });
  };

  const handleDelete = async (plan: SubscriptionPlan) => {
    if (
      !window.confirm(`Are you sure you want to delete plan "${plan.name}"?`)
    ) {
      return;
    }

    try {
      await deletePlan.mutateAsync(plan.id);
      toast.success(`Plan "${plan.name}" deleted successfully.`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete plan.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Plan name is required");
      return;
    }

    const payload: Partial<SubscriptionPlan> = {
      name: formData.name,
      description: formData.description,
      priceMonthly: Number(formData.priceMonthly),
      priceYearly: Number(formData.priceYearly),
      trialDays: Number(formData.trialDays),
      maxStaff: Number(formData.maxStaff),
      maxContacts: Number(formData.maxContacts),
      maxProducts: Number(formData.maxProducts),
      maxServices: Number(formData.maxServices),
      maxInvoicesPerMonth: Number(formData.maxInvoicesPerMonth),
      maxOrdersPerMonth: Number(formData.maxOrdersPerMonth),
      maxCategories: Number(formData.maxCategories),
      features: formData.features
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean),
      isCustomPrice: formData.isCustomPrice,
      isActive: formData.isActive,
    };

    try {
      if (editingPlan) {
        await updatePlan.mutateAsync({
          id: editingPlan.id,
          ...payload,
        });
        toast.success(`Plan "${formData.name}" updated successfully.`);
      } else {
        await createPlan.mutateAsync(payload);
        toast.success(`Plan "${formData.name}" created successfully.`);
      }
      planModalRef.current?.close();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Operation failed.");
    }
  };

  const columns = [
    {
      key: "name",
      label: "Plan Name",
      render: (_value: string, item: SubscriptionPlan) => (
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-semibold">
            <Layers className="size-4" />
          </div>
          <div>
            <div className="font-semibold text-base-content leading-tight">
              {item.name}
            </div>
            <div className="text-sm text-base-content/60 max-w-xs truncate">
              {item.description || "No description provided"}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "priceMonthly",
      label: "Monthly / Yearly",
      render: (_value: any, item: SubscriptionPlan) => (
        <div>
          {item.isCustomPrice ? (
            <span className="badge badge-info badge-soft badge-md">
              Custom Price
            </span>
          ) : (
            <div className="text-sm">
              <span className="font-semibold text-base-content">
                ${Number(item.priceMonthly).toLocaleString()}
              </span>
              <span className="text-sm text-base-content/50">/mo</span>
              <div className="text-sm text-base-content/60">
                ${Number(item.priceYearly).toLocaleString()}/yr
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "limits",
      label: "Resource Limits",
      render: (_value: any, item: SubscriptionPlan) => (
        <div className="text-sm space-y-0.5 text-base-content/70">
          <div>
            Staff:{" "}
            <strong>
              {item.maxStaff === -1 ? "Unlimited" : item.maxStaff}
            </strong>
          </div>
          <div>
            Contacts:{" "}
            <strong>
              {item.maxContacts === -1 ? "Unlimited" : item.maxContacts}
            </strong>
          </div>
          <div>
            Products:{" "}
            <strong>
              {item.maxProducts === -1 ? "Unlimited" : item.maxProducts}
            </strong>
          </div>
        </div>
      ),
    },
    {
      key: "features",
      label: "Features",
      render: (features: string[]) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {features && features.length > 0 ? (
            features.map((feat, i) => (
              <span key={i} className="badge badge-xs badge-ghost">
                {feat}
              </span>
            ))
          ) : (
            <span className="text-sm text-base-content/40">Standard</span>
          )}
        </div>
      ),
    },
    {
      key: "isActive",
      label: "Status",
      render: (value: boolean) => (
        <span
          className={`badge badge-md ${
            value ? "badge-success text-success-content" : "badge-ghost"
          }`}
        >
          {value ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  const actions: Actions<SubscriptionPlan>[] = [
    {
      key: "edit",
      label: "Edit Plan",
      action: (item: SubscriptionPlan) => {
        handleOpenEdit(item);
      },
    },
    {
      key: "delete",
      label: "Delete Plan",
      render: () => <span className="text-error font-medium">Delete Plan</span>,
      action: (item: SubscriptionPlan) => {
        handleDelete(item);
      },
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Subscription Plans"
        description="Configure subscription tiers, pricing, and resource allocations for tenant businesses."
      >
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/admin/subscription/features"
            className="btn btn-sm btn-ghost border border-base-300"
          >
            <Sparkles className="size-4" /> Feature Catalog
          </Link>
          <button onClick={handleOpenCreate} className="btn btn-primary btn-sm">
            <PlusCircleIcon className="size-4" /> Create Plan
          </button>
        </div>
      </PageHeader>

      <SimpleContainer title="Platform Subscription Tiers">
        <PageLoader query={query}>
          {(response) => (
            <CustomTable
              ring={false}
              data={response.data}
              columns={columns}
              actions={actions}
            />
          )}
        </PageLoader>
      </SimpleContainer>

      {/* Create / Edit Plan Modal */}
      <Modal
        ref={planModalRef}
        title={
          editingPlan
            ? `Edit Plan: ${editingPlan.name}`
            : "Create Subscription Plan"
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="label">
                <span className="label-text font-semibold">Plan Name *</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g. Starter, Growth, Enterprise"
                className="input input-sm input-bordered w-full"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="label">
                <span className="label-text font-semibold">Description</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Brief description of who this plan is for"
                className="textarea textarea-bordered textarea-sm w-full"
                rows={2}
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text font-semibold">
                  Monthly Price ($)
                </span>
              </label>
              <input
                type="number"
                value={formData.priceMonthly}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priceMonthly: Number(e.target.value),
                  })
                }
                className="input input-sm input-bordered w-full"
                min={0}
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text font-semibold">
                  Yearly Price ($)
                </span>
              </label>
              <input
                type="number"
                value={formData.priceYearly}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priceYearly: Number(e.target.value),
                  })
                }
                className="input input-sm input-bordered w-full"
                min={0}
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text font-semibold">Trial Days</span>
              </label>
              <input
                type="number"
                value={formData.trialDays}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    trialDays: Number(e.target.value),
                  })
                }
                className="input input-sm input-bordered w-full"
                min={0}
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text font-semibold">
                  Max Staff (-1 for unlimited)
                </span>
              </label>
              <input
                type="number"
                value={formData.maxStaff}
                onChange={(e) =>
                  setFormData({ ...formData, maxStaff: Number(e.target.value) })
                }
                className="input input-sm input-bordered w-full"
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text font-semibold">Max Contacts</span>
              </label>
              <input
                type="number"
                value={formData.maxContacts}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxContacts: Number(e.target.value),
                  })
                }
                className="input input-sm input-bordered w-full"
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text font-semibold">Max Products</span>
              </label>
              <input
                type="number"
                value={formData.maxProducts}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxProducts: Number(e.target.value),
                  })
                }
                className="input input-sm input-bordered w-full"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="label">
                <span className="label-text font-semibold">
                  Features (comma separated)
                </span>
              </label>
              <input
                type="text"
                value={formData.features}
                onChange={(e) =>
                  setFormData({ ...formData, features: e.target.value })
                }
                placeholder="analytics, data_export, custom_roles, bulk_import"
                className="input input-sm input-bordered w-full"
              />

              {/* Clickable Feature Quick-Select Chips */}
              <div className="mt-2 space-y-1">
                <span className="text-xs text-base-content/60 font-medium">
                  Quick toggle available features:
                </span>
                <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto pr-1">
                  {availableFeatures.map((featKey) => {
                    const currentSelected = formData.features
                      .split(",")
                      .map((f) => f.trim())
                      .includes(featKey);
                    return (
                      <button
                        type="button"
                        key={featKey}
                        onClick={() => toggleFeatureInForm(featKey)}
                        className={`badge badge-xs gap-1 cursor-pointer transition-all ${
                          currentSelected
                            ? "badge-primary"
                            : "badge-ghost opacity-60 hover:opacity-100"
                        }`}
                      >
                        {currentSelected ? (
                          <Check className="size-2.5" />
                        ) : (
                          <Plus className="size-2.5" />
                        )}
                        {featKey}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 sm:col-span-2 pt-2">
              <label className="label cursor-pointer gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="checkbox checkbox-primary checkbox-sm"
                />
                <span className="label-text font-medium">
                  Active (Visible to Tenants)
                </span>
              </label>

              <label className="label cursor-pointer gap-2">
                <input
                  type="checkbox"
                  checked={formData.isCustomPrice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      isCustomPrice: e.target.checked,
                    })
                  }
                  className="checkbox checkbox-primary checkbox-sm"
                />
                <span className="label-text font-medium">
                  Custom Enterprise Pricing
                </span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-base-200">
            <button
              type="button"
              onClick={() => planModalRef.current?.close()}
              className="btn btn-sm btn-ghost"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createPlan.isPending || updatePlan.isPending}
              className="btn btn-sm btn-primary"
            >
              {createPlan.isPending || updatePlan.isPending
                ? "Saving..."
                : editingPlan
                  ? "Update Plan"
                  : "Create Plan"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
