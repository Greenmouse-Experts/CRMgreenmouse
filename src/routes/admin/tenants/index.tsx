import { useState, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  useAdminTenants,
  useAdminTenantStats,
  useToggleTenantStatus,
  useAssignTenantSubscription,
  useAdminSubscriptions,
  type Tenant,
} from "@/api/adminApi";
import PageHeader from "@/components/Headers/PageHeader";
import SimpleContainer from "@/components/SimpleContainer";
import CustomTable from "@/components/tables/CustomTable";
import type { Actions } from "@/components/tables/pop-up";
import PageLoader from "@/components/layout/PageLoader";
import QueryCompLayout from "@/components/layout/QueryCompLayout";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import { toast } from "sonner";
import {
  Building2,
  Search,
  CheckCircle,
  ShieldAlert,
  UserCheck,
  RotateCw,
} from "lucide-react";

export const Route = createFileRoute("/admin/tenants/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [subFilter, setSubFilter] = useState("all");

  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const statsQuery = useAdminTenantStats();
  const tenantsQuery = useAdminTenants({
    search: searchTerm || undefined,
    status: statusFilter,
    subscriptionStatus: subFilter,
  });

  const { data: plansData } = useAdminSubscriptions({ isActive: true });
  const toggleStatus = useToggleTenantStatus();
  const assignSubscription = useAssignTenantSubscription();

  const detailsModalRef = useRef<ModalHandle>(null);
  const planModalRef = useRef<ModalHandle>(null);

  const handleToggleStatus = async (tenant: Tenant) => {
    const isSuspending = tenant.status === "active";
    const confirmMessage = isSuspending
      ? `Are you sure you want to suspend "${tenant.companyName}"?`
      : `Activate "${tenant.companyName}"?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      await toggleStatus.mutateAsync(tenant.id);
      toast.success(
        isSuspending
          ? `Tenant "${tenant.companyName}" suspended.`
          : `Tenant "${tenant.companyName}" activated.`
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update tenant status.");
    }
  };

  const handleOpenPlanModal = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setSelectedPlanId(tenant.subscriptionPlanId || "");
    setBillingCycle((tenant.billingCycle as "monthly" | "yearly") || "monthly");
    planModalRef.current?.open();
  };

  const handleAssignPlan = async () => {
    if (!selectedTenant || !selectedPlanId) {
      toast.error("Please select a subscription plan");
      return;
    }

    try {
      await assignSubscription.mutateAsync({
        id: selectedTenant.id,
        subscriptionPlanId: selectedPlanId,
        billingCycle,
      });
      toast.success(`Plan updated for "${selectedTenant.companyName}"`);
      planModalRef.current?.close();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update subscription plan.");
    }
  };

  const columns = [
    {
      key: "companyName",
      label: "Tenant Company",
      render: (_value: string, item: Tenant) => (
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <Building2 className="size-5" />
          </div>
          <div>
            <div className="font-bold text-base-content leading-tight">
              {item.companyName || "Unnamed Business"}
            </div>
            <div className="text-xs text-base-content/60">{item.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "phoneNumber",
      label: "Contact",
      render: (value: string) => (
        <span className="text-xs text-base-content/70">{value || "—"}</span>
      ),
    },
    {
      key: "subscriptionStatus",
      label: "Plan Status",
      render: (value: string, item: Tenant) => {
        const isTrial = value === "trial";
        const isActive = value === "active";
        return (
          <div className="flex flex-col gap-0.5">
            <span
              className={`badge badge-sm font-semibold w-fit ${
                isActive
                  ? "badge-success badge-soft"
                  : isTrial
                    ? "badge-warning badge-soft"
                    : "badge-ghost"
              }`}
            >
              {value ? value.toUpperCase() : "NO PLAN"}
            </span>
            {item.billingCycle && (
              <span className="text-[10px] text-base-content/50 capitalize">
                {item.billingCycle} billing
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "status",
      label: "Account Status",
      render: (value: string) => (
        <span
          className={`badge badge-sm font-medium ${
            value === "active"
              ? "badge-success text-success-content"
              : "badge-error text-error-content"
          }`}
        >
          {value === "active" ? "Active" : "Suspended"}
        </span>
      ),
    },
    {
      key: "isEmailVerified",
      label: "Verified",
      render: (value: boolean) => (
        <span
          className={`badge badge-xs gap-1 font-medium ${
            value ? "badge-success badge-soft" : "badge-neutral badge-soft"
          }`}
        >
          {value ? "Verified" : "Pending"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Registered",
      render: (value: string) => (
        <span className="text-xs text-base-content/60">
          {value ? new Date(value).toLocaleDateString() : "—"}
        </span>
      ),
    },
  ];

  const actions: Actions<Tenant>[] = [
    {
      key: "view-details",
      label: "View Details",
      action: (item: Tenant) => {
        setSelectedTenant(item);
        detailsModalRef.current?.open();
      },
    },
    {
      key: "change-plan",
      label: "Assign Plan",
      action: (item: Tenant) => {
        handleOpenPlanModal(item);
      },
    },
    {
      key: "toggle-status",
      label: "Toggle Status",
      render: (item: Tenant) => (
        <span className={item.status === "active" ? "text-error font-medium" : "text-success font-medium"}>
          {item.status === "active" ? "Suspend Tenant" : "Activate Tenant"}
        </span>
      ),
      action: (item: Tenant) => {
        handleToggleStatus(item);
      },
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Business Tenants"
        description="Manage customer accounts, active subscriptions, and account statuses across Greenmouse CRM."
      />

      {/* Tenant Stats Row */}
      <QueryCompLayout query={statsQuery}>
        {(stats) => (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="stat bg-base-100 rounded-xl border border-base-200 p-4">
              <div className="stat-figure text-primary">
                <Building2 className="size-6" />
              </div>
              <div className="stat-title text-xs">Total Tenants</div>
              <div className="stat-value text-2xl font-black">{stats.total}</div>
            </div>
            <div className="stat bg-base-100 rounded-xl border border-base-200 p-4">
              <div className="stat-figure text-success">
                <CheckCircle className="size-6" />
              </div>
              <div className="stat-title text-xs">Active</div>
              <div className="stat-value text-2xl font-black text-success">
                {stats.active}
              </div>
            </div>
            <div className="stat bg-base-100 rounded-xl border border-base-200 p-4">
              <div className="stat-figure text-warning">
                <RotateCw className="size-6" />
              </div>
              <div className="stat-title text-xs">On Trial</div>
              <div className="stat-value text-2xl font-black text-warning">
                {stats.trial}
              </div>
            </div>
            <div className="stat bg-base-100 rounded-xl border border-base-200 p-4">
              <div className="stat-figure text-error">
                <ShieldAlert className="size-6" />
              </div>
              <div className="stat-title text-xs">Suspended</div>
              <div className="stat-value text-2xl font-black text-error">
                {stats.suspended}
              </div>
            </div>
            <div className="stat bg-base-100 rounded-xl border border-base-200 p-4">
              <div className="stat-figure text-info">
                <UserCheck className="size-6" />
              </div>
              <div className="stat-title text-xs">Verified</div>
              <div className="stat-value text-2xl font-black text-info">
                {stats.verified}
              </div>
            </div>
          </div>
        )}
      </QueryCompLayout>

      {/* Filters & Table */}
      <SimpleContainer
        title={
          <div className="flex items-center gap-2">
            <span>Registered Businesses</span>
            {tenantsQuery.data && (
              <span className="badge badge-sm badge-ghost">
                {tenantsQuery.data.length}
              </span>
            )}
          </div>
        }
      >
        <div className="p-4 border-b border-base-200 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
            <input
              type="text"
              placeholder="Search by company or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input input-sm input-bordered w-full pl-9"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select select-sm select-bordered"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="suspended">Suspended Only</option>
            </select>

            <select
              value={subFilter}
              onChange={(e) => setSubFilter(e.target.value)}
              className="select select-sm select-bordered"
            >
              <option value="all">All Subscriptions</option>
              <option value="active">Active Subscriptions</option>
              <option value="trial">Trial Accounts</option>
            </select>
          </div>
        </div>

        <PageLoader query={tenantsQuery}>
          {(tenants) => (
            <CustomTable
              ring={false}
              data={tenants}
              columns={columns}
              actions={actions}
            />
          )}
        </PageLoader>
      </SimpleContainer>

      {/* Details Modal */}
      <Modal
        ref={detailsModalRef}
        title="Tenant Account Details"
        actions={
          <button
            type="button"
            onClick={() => detailsModalRef.current?.close()}
            className="btn btn-sm btn-ghost"
          >
            Close
          </button>
        }
      >
        {selectedTenant && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-base-200/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-base-content/60">Company Name</span>
                <span className="font-bold text-base-content">{selectedTenant.companyName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-base-content/60">Email</span>
                <span className="text-sm">{selectedTenant.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-base-content/60">Phone</span>
                <span className="text-sm">{selectedTenant.phoneNumber || "Not provided"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-base-content/60">Account Status</span>
                <span
                  className={`badge badge-sm ${
                    selectedTenant.status === "active" ? "badge-success" : "badge-error"
                  }`}
                >
                  {selectedTenant.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-base-content/60">Subscription</span>
                <span className="badge badge-sm badge-warning">{selectedTenant.subscriptionStatus}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-base-content/60">Email Verified</span>
                <span className="text-sm">{selectedTenant.isEmailVerified ? "Yes" : "No"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-base-content/60">Onboarded</span>
                <span className="text-sm">{selectedTenant.isOnboarded ? "Completed" : "Pending"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-base-content/60">Tenant ID</span>
                <span className="text-xs font-mono bg-base-100 px-2 py-0.5 rounded border border-base-300">
                  {selectedTenant.id}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Assign Subscription Modal */}
      <Modal
        ref={planModalRef}
        title="Assign Subscription Plan"
        actions={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => planModalRef.current?.close()}
              className="btn btn-sm btn-ghost"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAssignPlan}
              disabled={assignSubscription.isPending || !selectedPlanId}
              className="btn btn-sm btn-primary"
            >
              {assignSubscription.isPending ? "Updating..." : "Save Plan"}
            </button>
          </div>
        }
      >
        {selectedTenant && (
          <div className="space-y-4">
            <p className="text-sm text-base-content/70">
              Update the subscription tier and billing cycle for{" "}
              <strong className="text-base-content">{selectedTenant.companyName}</strong>.
            </p>

            <div className="space-y-3">
              <div>
                <label className="label">
                  <span className="label-text font-semibold">Select Subscription Plan</span>
                </label>
                <select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="select select-bordered w-full"
                >
                  <option value="">-- Choose a Plan --</option>
                  {plansData?.data.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} — ${plan.priceMonthly}/mo (Yearly: ${plan.priceYearly})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-semibold">Billing Cycle</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setBillingCycle("monthly")}
                    className={`btn btn-sm ${
                      billingCycle === "monthly" ? "btn-primary" : "btn-outline"
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingCycle("yearly")}
                    className={`btn btn-sm ${
                      billingCycle === "yearly" ? "btn-primary" : "btn-outline"
                    }`}
                  >
                    Yearly
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
