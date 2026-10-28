// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import InvoicesStat from "./InvocesStat";

vi.mock("@/api/financeApi", () => ({
  useInvoiceStats: () => ({
    data: { totalInvoices: 1, paid: { count: 1, total: 150 } },
    isPending: false,
    isError: false,
  }),
}));

describe("tenant invoice statistics", () => {
  it("renders only fields supplied by the API", () => {
    render(<InvoicesStat />);
    expect(screen.getByText("Total Invoices")).toBeTruthy();
    expect(screen.getByText("Paid Invoices")).toBeTruthy();
    expect(screen.getByText("Amount: 150.00")).toBeTruthy();
    expect(screen.queryByText("Pending Invoices")).toBeNull();
  });
});
