// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useDashboardStats } from "@/api/adminApi";
import AdminDashStats from "./AdminDashStats";

vi.mock("@/api/adminApi", () => ({ useDashboardStats: vi.fn() }));
vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

const mockStats = vi.mocked(useDashboardStats);
afterEach(() => vi.clearAllMocks());

describe("admin dashboard stats", () => {
  it("shows live totals and signed percentage changes, including zero", () => {
    mockStats.mockReturnValue({
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
      isPending: false,
      isError: false,
    } as ReturnType<typeof useDashboardStats>);

    render(<AdminDashStats />);

    expect(screen.getAllByText("₦0")).toHaveLength(2);
    expect(screen.getByText("1")).toBeTruthy();
    expect(screen.getAllByText("0% change")).toHaveLength(2);
    expect(screen.getByText("+12.5% change")).toBeTruthy();
    expect(screen.getByText("-100% change")).toBeTruthy();
    expect(screen.queryByText("₦13.2M")).toBeNull();
  });

  it("does not invent percentage changes when the API omits them", () => {
    mockStats.mockReturnValue({
      data: {
        totalStaffs: 0,
        totalInvoices: 0,
        pendingOrders: 0,
        totalCustomers: 0,
        totalProducts: 0,
      },
      isPending: false,
      isError: false,
    } as ReturnType<typeof useDashboardStats>);

    render(<AdminDashStats />);

    expect(screen.getAllByText("Change unavailable")).toHaveLength(4);
  });
});
