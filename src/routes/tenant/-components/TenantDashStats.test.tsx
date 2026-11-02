// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useDashboardStats } from "@/api/tenantApi";
import { useInvoiceRevenueReport } from "@/api/reportsApi";
import TenantDashStats from "./TenantDashStats";

vi.mock("@/api/tenantApi", () => ({ useDashboardStats: vi.fn() }));
vi.mock("@/api/reportsApi", () => ({ useInvoiceRevenueReport: vi.fn() }));
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
  it("shows totals and percentage changes from dashboard stats while keeping debts separate", () => {
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
    vi.mocked(useInvoiceRevenueReport).mockReturnValue({
      data: { outstandingTotal: 125 },
      isLoading: false,
    } as ReturnType<typeof useInvoiceRevenueReport>);

    render(<TenantDashStats />);

    expect(screen.getAllByText("₦0")).toHaveLength(2);
    expect(screen.getAllByText("0% change")).toHaveLength(2);
    expect(screen.getByText("+12.5% change")).toBeTruthy();
    expect(screen.getByText("-100% change")).toBeTruthy();
    expect(screen.getByText("₦125")).toBeTruthy();
  });
});
