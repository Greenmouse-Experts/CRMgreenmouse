// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PlanDetails, { availablePlanLimits } from "./-plan-details";

describe("PlanDetails", () => {
  it("shows all available limits and features without inventing missing limits", () => {
    const plan = {
      id: "growth",
      name: "Growth",
      maxStaff: 10,
      maxProducts: 100,
      maxFinancialRecordsPerMonth: -1,
      maxQuotes: 0,
      features: ["data_export"],
    };
    render(<PlanDetails plan={plan} />);
    expect(screen.getByText("Financial records / month")).toBeTruthy();
    expect(screen.getByText("Unlimited")).toBeTruthy();
    expect(screen.getByText("Quotes")).toBeTruthy();
    expect(screen.getByText("0")).toBeTruthy();
    expect(screen.getByText("Data Export")).toBeTruthy();
    expect(screen.queryByText("Contacts")).toBeNull();
    expect(availablePlanLimits(plan)).toHaveLength(4);
  });
});
