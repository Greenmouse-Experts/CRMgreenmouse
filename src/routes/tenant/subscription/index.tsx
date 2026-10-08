import { useState, useEffect, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/Headers/PageHeader";
import PageLoader from "@/components/layout/PageLoader";
import SimpleContainer from "@/components/SimpleContainer";
import CustomTable from "@/components/tables/CustomTable";
import {
  useTenantSubscriptionCurrent,
  useTenantSubscriptionPlans,
  useTenantSubscriptionHistory,
  useTenantSubscriptionUpgrade,
  useTenantSubscriptionDowngrade,
  useTenantSubscriptionCancel,
  useTenantSubscriptionVerify,
} from "@/api/tenantApi";
import { toast } from "sonner";
import {
  Check,
  Zap,
  ShieldCheck,
  Calendar,
  CreditCard,
  AlertCircle,
  Clock,
  Sparkles,
  RefreshCw,
  XCircle,
  Layers,
} from "lucide-react";

export const Route = createFileRoute("/tenant/subscription/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly",
  );
  const [checkoutPlanId, setCheckoutPlanId] = useState<string | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const verifyingReferences = useRef(new Set<string>());

  const currentQuery = useTenantSubscriptionCurrent();
  const plansQuery = useTenantSubscriptionPlans();
  const historyQuery = useTenantSubscriptionHistory();

  const upgradeMutation = useTenantSubscriptionUpgrade();
  const downgradeMutation = useTenantSubscriptionDowngrade();
  const cancelMutation = useTenantSubscriptionCancel();
  const verifyMutation = useTenantSubscriptionVerify();

  const currentSub = currentQuery.data;
  const plans = plansQuery.data || [];
  const history = historyQuery.data || [];

  const verifyPayment = async (reference: string) => {
    if (verifyingReferences.current.has(reference)) return;
    verifyingReferences.current.add(reference);
    setVerificationError(null);

    try {
      const result = await verifyMutation.mutateAsync({ reference });
      const verification = result?.data ?? result;
      if (
        verification?.success === false ||
        verification?.verified === false ||
        ["failed", "pending", "abandoned", "reversed", "declined", "error"].includes(
          String(verification?.status ?? "").toLowerCase(),
        )
      ) {
        throw new Error("Payment has not been confirmed yet.");
      }

      toast.success("Subscription payment verified successfully!");
      const url = new URL(window.location.href);
      url.searchParams.delete("reference");
      url.searchParams.delete("trxref");
      window.history.replaceState(
        window.history.state,
        "",
        `${url.pathname}${url.search}${url.hash}`,
      );
    } catch (err: any) {
      verifyingReferences.current.delete(reference);
      setVerificationError(reference);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to verify subscription payment.",
      );
    } finally {
      setCheckoutPlanId(null);
    }
  };

  // Hosted Paystack checkout returns to this page with a transaction reference.
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const reference =
      searchParams.get("reference") || searchParams.get("trxref");
    if (reference) void verifyPayment(reference);
  }, []);

  const handleSubscribeOrUpgrade = async (plan: any) => {
    if (checkoutPlanId) return;
    setCheckoutPlanId(plan.id);
    try {
      const res = await upgradeMutation.mutateAsync({
        planId: plan.id,
        billingCycle,
      });

      const checkout = res?.data ?? res;
      const accessCode = checkout?.access_code || checkout?.accessCode;
      const reference = checkout?.reference;
      const authUrl =
        checkout?.authorization_url ||
        checkout?.authorizationUrl ||
        checkout?.checkoutUrl ||
        checkout?.paystackUrl ||
        checkout?.url;

      if (accessCode) {
        try {
          const { default: PaystackPop } = await import("@paystack/inline-js");
          const paystack = new PaystackPop();
          paystack.resumeTransaction(accessCode, {
            onSuccess: (transaction) => {
              const paymentReference = transaction.reference || reference;
              if (paymentReference) {
                void verifyPayment(paymentReference);
              } else {
                setCheckoutPlanId(null);
                toast.error(
                  "Payment completed, but no reference was returned. Please contact support.",
                );
              }
            },
            onCancel: () => {
              setCheckoutPlanId(null);
              toast.info("Payment was cancelled. Your plan has not changed.");
            },
            onError: (error) => {
              setCheckoutPlanId(null);
              toast.error(error.message || "Unable to open Paystack checkout.");
            },
          });
        } catch (error) {
          if (!authUrl) throw error;
          toast.info("Opening Paystack checkout...");
          window.location.assign(authUrl);
        }
      } else if (authUrl) {
        toast.info("Redirecting to Paystack checkout...");
        window.location.assign(authUrl);
      } else {
        throw new Error("Payment checkout details were not returned. Please try again.");
      }
    } catch (err: any) {
      setCheckoutPlanId(null);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to initiate subscription upgrade. Please try again.",
      );
    }
  };

  const handleDowngrade = async (plan: any) => {
    if (
      !window.confirm(`Are you sure you want to downgrade to "${plan.name}"?`)
    ) {
      return;
    }
    try {
      await downgradeMutation.mutateAsync({ planId: plan.id });
      toast.success(`Downgraded to ${plan.name} plan successfully.`);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to downgrade subscription.",
      );
    }
  };

  const handleCancel = async () => {
    if (
      !window.confirm(
        "Are you sure you want to cancel your subscription? Your workspace will remain active until the end of the current billing cycle.",
      )
    ) {
      return;
    }
    try {
      await cancelMutation.mutateAsync();
      toast.success(
        "Subscription cancelled. Access will remain active until the billing period ends.",
      );
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to cancel subscription.",
      );
    }
  };

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return "₦0";
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const historyColumns = [
    {
      key: "planName",
      label: "Plan",
      render: (_val: any, item: any) => (
        <span className="font-semibold text-base-content">
          {item.planName || item.plan?.name || "Subscription"}
        </span>
      ),
    },
    {
      key: "billingCycle",
      label: "Billing Cycle",
      render: (cycle: string) => (
        <span className="capitalize text-xs text-base-content/70">
          {cycle || "Monthly"}
        </span>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      render: (amount: number) => (
        <span className="font-medium text-base-content">
          {formatCurrency(amount)}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (status: string) => {
        const s = (status || "completed").toLowerCase();
        let badgeClass = "badge-ghost";
        if (s === "success" || s === "completed" || s === "active")
          badgeClass = "badge-success badge-soft";
        else if (s === "pending") badgeClass = "badge-warning badge-soft";
        else if (s === "failed" || s === "cancelled")
          badgeClass = "badge-error badge-soft";

        return (
          <span
            className={`badge badge-sm font-semibold uppercase text-[10px] ${badgeClass}`}
          >
            {status || "Completed"}
          </span>
        );
      },
    },
    {
      key: "createdAt",
      label: "Date",
      render: (date: string) => (
        <span className="text-xs text-base-content/70">
          {date ? new Date(date).toLocaleDateString() : "—"}
        </span>
      ),
    },
  ];

  const currentPlanId = currentSub?.planId || currentSub?.plan?.id;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscription & Billing"
        description="View your current plan, upgrade your tier, manage billing cycles, and view payment history"
      />

      {verificationError && (
        <div role="alert" className="alert alert-warning flex flex-wrap justify-between gap-3">
          <span>We could not confirm your payment yet. Retry verification before starting another checkout.</span>
          <button
            type="button"
            className="btn btn-sm btn-outline"
            disabled={verifyMutation.isPending}
            onClick={() => void verifyPayment(verificationError)}
          >
            {verifyMutation.isPending ? "Verifying..." : "Retry verification"}
          </button>
        </div>
      )}

      <PageLoader query={currentQuery}>
        {/* Current Subscription Card */}
        {currentSub && (
          <div className="card bg-base-100 shadow-md border border-base-200 overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 via-base-100 to-base-100 p-6 border-b border-base-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="badge badge-primary uppercase text-[10px] font-semibold tracking-wider">
                    Current Active Plan
                  </span>
                  {currentSub.cancelAtPeriodEnd && (
                    <span className="badge badge-warning text-[10px] font-semibold gap-1">
                      <AlertCircle className="size-3" /> Cancels at period end
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-semibold text-base-content flex items-center gap-2">
                  {currentSub.planName ||
                    currentSub.plan?.name ||
                    "Standard Plan"}
                  <ShieldCheck className="size-6 text-primary" />
                </h2>
                <p className="text-sm text-base-content/70 flex items-center gap-3">
                  <span className="capitalize font-semibold text-base-content">
                    {currentSub.billingCycle || "Monthly"} Billing
                  </span>
                  <span>•</span>
                  <span>
                    Status:{" "}
                    <span className="font-semibold uppercase text-success">
                      {currentSub.status || "Active"}
                    </span>
                  </span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {currentSub.status !== "cancelled" &&
                  !currentSub.cancelAtPeriodEnd && (
                    <button
                      onClick={handleCancel}
                      disabled={cancelMutation.isPending}
                      className="btn btn-sm btn-outline btn-error gap-1"
                    >
                      <XCircle className="size-4" /> Cancel Subscription
                    </button>
                  )}
                <button
                  onClick={() => currentQuery.refetch()}
                  className="btn btn-sm btn-ghost gap-1"
                >
                  <RefreshCw className="size-4" /> Refresh
                </button>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm bg-base-100">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-base-200/50">
                <div className="size-10 rounded-lg bg-primary/10 text-primary grid place-items-center">
                  <CreditCard className="size-5" />
                </div>
                <div>
                  <p className="text-xs text-base-content/60">Plan Price</p>
                  <p className="font-semibold text-base text-base-content">
                    {formatCurrency(currentSub.plan?.price || currentSub.price)}
                    <span className="text-xs font-normal text-base-content/60">
                      /{currentSub.billingCycle === "yearly" ? "yr" : "mo"}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-base-200/50">
                <div className="size-10 rounded-lg bg-info/10 text-info grid place-items-center">
                  <Calendar className="size-5" />
                </div>
                <div>
                  <p className="text-xs text-base-content/60">Period Start</p>
                  <p className="font-semibold text-base-content">
                    {currentSub.currentPeriodStart
                      ? new Date(
                          currentSub.currentPeriodStart,
                        ).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-base-200/50">
                <div className="size-10 rounded-lg bg-success/10 text-success grid place-items-center">
                  <Clock className="size-5" />
                </div>
                <div>
                  <p className="text-xs text-base-content/60">
                    Renews / Expiration
                  </p>
                  <p className="font-semibold text-base-content">
                    {currentSub.currentPeriodEnd
                      ? new Date(
                          currentSub.currentPeriodEnd,
                        ).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </PageLoader>

      {/* Subscription Plans Selection Grid */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-base-100 p-6 rounded-box shadow border border-base-200">
          <div>
            <h3 className="text-xl font-semibold text-base-content flex items-center gap-2">
              <Sparkles className="size-5 text-primary" /> Choose a Subscription
              Plan
            </h3>
            <p className="text-sm text-base-content/70">
              Upgrade or switch your workspace plan to unlock more staff,
              contacts, and features.
            </p>
          </div>

          {/* Billing Cycle Switcher */}
          <div className="flex items-center gap-3 bg-base-200/60 p-1.5 rounded-xl border border-base-200 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                billingCycle === "monthly"
                  ? "bg-base-100 text-primary shadow"
                  : "text-base-content/70 hover:text-base-content"
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("yearly")}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 ${
                billingCycle === "yearly"
                  ? "bg-base-100 text-primary shadow"
                  : "text-base-content/70 hover:text-base-content"
              }`}
            >
              Yearly Billing
              <span className="badge badge-accent badge-xs text-[9px] uppercase font-semibold">
                Save
              </span>
            </button>
          </div>
        </div>

        <PageLoader query={plansQuery}>
          {plans.length === 0 ? (
            <div className="text-center py-12 bg-base-100 rounded-box border border-base-200 space-y-2">
              <Layers className="size-12 mx-auto text-base-content/30" />
              <p className="text-base font-semibold text-base-content/70">
                No active subscription plans available at the moment.
              </p>
              <p className="text-xs text-base-content/50">
                Please check back later or contact system administration.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan: any) => {
                const isCurrent = currentPlanId === plan.id;
                const price =
                  billingCycle === "yearly"
                    ? (plan.priceYearly ?? plan.price ?? 0)
                    : (plan.priceMonthly ?? plan.price ?? 0);

                const isHigher =
                  currentSub?.plan?.price !== undefined
                    ? price > currentSub.plan.price
                    : true;

                return (
                  <div
                    key={plan.id}
                    className={`card bg-base-100 shadow-md border-2 transition-all hover:shadow-lg flex flex-col justify-between ${
                      isCurrent
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-base-200"
                    }`}
                  >
                    <div className="card-body p-6 space-y-4">
                      {isCurrent && (
                        <div className="badge badge-primary font-semibold text-[10px] uppercase tracking-wider self-start">
                          Your Active Plan
                        </div>
                      )}

                      <div className="space-y-1">
                        <h4 className="text-xl font-semibold text-base-content">
                          {plan.name}
                        </h4>
                        {plan.description && (
                          <p className="text-xs text-base-content/60 min-h-[32px] leading-relaxed">
                            {plan.description}
                          </p>
                        )}
                      </div>

                      <div className="py-2 border-y border-base-200">
                        <div className="text-3xl font-semibold text-base-content">
                          {plan.isCustomPrice ? (
                            "Custom"
                          ) : (
                            <>
                              {formatCurrency(price)}
                              <span className="text-xs font-normal text-base-content/60 ml-1">
                                /{billingCycle === "yearly" ? "year" : "month"}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Quotas & Limits */}
                      <div className="space-y-2 text-xs">
                        <p className="font-semibold text-base-content/70 uppercase text-[10px] tracking-wider">
                          Resource Limits
                        </p>
                        <ul className="space-y-1.5 text-base-content/80">
                          {plan.maxStaff !== undefined && (
                            <li className="flex justify-between border-b border-base-200/50 pb-1">
                              <span>Max Staff Users</span>
                              <span className="font-semibold">
                                {plan.maxStaff === 0 || plan.maxStaff === -1
                                  ? "Unlimited"
                                  : plan.maxStaff}
                              </span>
                            </li>
                          )}
                          {plan.maxContacts !== undefined && (
                            <li className="flex justify-between border-b border-base-200/50 pb-1">
                              <span>Max Contacts</span>
                              <span className="font-semibold">
                                {plan.maxContacts === 0 ||
                                plan.maxContacts === -1
                                  ? "Unlimited"
                                  : plan.maxContacts}
                              </span>
                            </li>
                          )}
                          {plan.maxInvoicesPerMonth !== undefined && (
                            <li className="flex justify-between border-b border-base-200/50 pb-1">
                              <span>Invoices / Month</span>
                              <span className="font-semibold">
                                {plan.maxInvoicesPerMonth === 0 ||
                                plan.maxInvoicesPerMonth === -1
                                  ? "Unlimited"
                                  : plan.maxInvoicesPerMonth}
                              </span>
                            </li>
                          )}
                        </ul>
                      </div>

                      {/* Included Features */}
                      {Array.isArray(plan.features) &&
                        plan.features.length > 0 && (
                          <div className="space-y-2 text-xs">
                            <p className="font-semibold text-base-content/70 uppercase text-[10px] tracking-wider">
                              Included Features
                            </p>
                            <ul className="space-y-1.5">
                              {plan.features.map(
                                (feat: string, idx: number) => (
                                  <li
                                    key={idx}
                                    className="flex items-start gap-2 text-base-content/80"
                                  >
                                    <Check className="size-4 text-success shrink-0 mt-0.5" />
                                    <span>{feat}</span>
                                  </li>
                                ),
                              )}
                            </ul>
                          </div>
                        )}
                    </div>

                    {/* Action Footer */}
                    <div className="p-6 pt-0 mt-auto">
                      {isCurrent ? (
                        <button
                          disabled
                          className="btn btn-outline btn-block btn-disabled"
                        >
                          Current Plan
                        </button>
                      ) : isHigher ? (
                        <button
                          onClick={() => handleSubscribeOrUpgrade(plan)}
                          disabled={
                            Boolean(checkoutPlanId) ||
                            verifyMutation.isPending ||
                            Boolean(verificationError)
                          }
                          className="btn btn-primary btn-block gap-2"
                        >
                          <Zap className="size-4" />{" "}
                          {checkoutPlanId === plan.id
                            ? "Payment in progress..."
                            : "Subscribe / Upgrade"}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDowngrade(plan)}
                          disabled={downgradeMutation.isPending}
                          className="btn btn-outline btn-secondary btn-block"
                        >
                          Downgrade
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </PageLoader>
      </section>

      {/* Subscription Change & Payment History */}
      <SimpleContainer title="Subscription History">
        <PageLoader query={historyQuery}>
          <div className="bg-base-100">
            <CustomTable ring={false} data={history} columns={historyColumns} />
          </div>
        </PageLoader>
      </SimpleContainer>
    </div>
  );
}
