// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import TenantProfile from "./TenantProfile";
import type { Tenant } from "@/api/adminApi";

const tenant: Tenant = {
  id: "7ae983cb-4679-477e-86da-86342b82aafb",
  email: "greenmousedev+dan@gmail.com",
  companyName: "DAN BEST",
  isEmailVerified: true,
  isOnboarded: false,
  status: "active",
  subscriptionStatus: "trial",
  subscriptionPlanId: "8f57bbde-dce3-42fb-9c5d-486150d44bf9",
  billingCycle: null,
  trialEndsAt: "2026-11-06T09:25:51.722Z",
  createdAt: "2026-10-23T09:25:51.959Z",
  updatedAt: "2026-10-23T09:25:51.959Z",
  subscriptionPlan: {
    id: "8f57bbde-dce3-42fb-9c5d-486150d44bf9",
    name: "Free Trial",
    priceMonthly: 0,
    priceYearly: 0,
    features: ["analytics"],
    maxStaff: 2,
    maxContacts: 2,
    maxProducts: 2,
  },
};

describe("TenantProfile", () => {
  it("shows the subscription plan details supplied with a tenant", () => {
    render(<TenantProfile tenant={tenant} />);
    expect(screen.getByText("Free Trial")).toBeTruthy();
    expect(screen.getByText("analytics")).toBeTruthy();
    expect(screen.getByText("Plan limits")).toBeTruthy();
    expect(screen.getByText("Monthly price")).toBeTruthy();
    expect(screen.getByText("Trial ends")).toBeTruthy();
    expect(screen.getByText("Staff")).toBeTruthy();
  });
});
