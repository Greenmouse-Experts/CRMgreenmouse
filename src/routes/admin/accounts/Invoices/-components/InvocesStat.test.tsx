// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import InvoicesStat from "./InvocesStat";

describe("InvoicesStat", () => {
  it("renders the admin invoice response shape", () => {
    render(
      <InvoicesStat
        statsData={{ totalInvoices: 1, paid: { count: 1, total: 150 } }}
      />,
    );

    expect(screen.getAllByText("1")).toHaveLength(2);
    expect(screen.getByText("Collected: ₦150")).toBeTruthy();
  });

  it("renders grouped invoice counts and the paid total", () => {
    render(
      <InvoicesStat
        statsData={{
          total: { count: 12, total: 120000 },
          paid: { count: 5, total: 50000 },
          pending: { count: 4, total: 40000 },
          overdue: { count: 3, total: 30000 },
        }}
      />,
    );

    expect(screen.getByText("12")).toBeTruthy();
    expect(screen.getByText("5")).toBeTruthy();
    expect(screen.getByText("4")).toBeTruthy();
    expect(screen.getByText("3")).toBeTruthy();
    expect(screen.getByText("Collected: ₦50,000")).toBeTruthy();
  });
});
