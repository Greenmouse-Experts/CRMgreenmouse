// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useDashboardStats } from "@/api/tenantApi";
import TenantDashStats from "./TenantDashStats";

vi.mock("@/api/tenantApi", () => ({ useDashboardStats: vi.fn() }));
vi.mock("@/components/layout/QueryCompLayout", () => ({
  default: ({
    query,
    children,
  }: {
    query: { data: unknown };
    children: (data: unknown) => React.ReactNode;
  }) => <>{children(query.data)}</>,
}));
vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

afterEach(() => vi.clearAllMocks());

describe("tenant dashboard stats", () => {
  it("shows totals, month-over-month changes and the all-time customer count", () => {
    vi.mocked(useDashboardStats).mockReturnValue({
      data: {
        totalStaffs: 0,
        totalInvoices: 0,
        pendingOrders: 0,
        totalCustomers: 1,
        totalProducts: 0,
        totalIncome: 0,
        incomeChange: 0,
        totalExpenses: 0,
        expenseChange: 12.5,
        customerChange: -100,
        invoiceChange: 0,
      },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useDashboardStats>);

    render(<TenantDashStats />);

    // Income and expenses both render ₦0.
    expect(screen.getAllByText("₦0")).toHaveLength(2);
    // Zero changes render as 0% (income + invoices); expenses show 12.5%.
    expect(screen.getAllByText("0%")).toHaveLength(2);
    expect(screen.getByText("12.5%")).toBeTruthy();
    // Three cards compare against the previous month.
    expect(screen.getAllByText(/^vs /)).toHaveLength(3);
    // Customers card shows the all-time count instead of a change.
    expect(screen.getByText("All time")).toBeTruthy();
    expect(screen.getByText("1")).toBeTruthy();
  });
});
