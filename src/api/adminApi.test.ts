import { describe, expect, it } from "vitest";
import { parseTenantRevenueTrend } from "./adminApi";

describe("parseTenantRevenueTrend", () => {
  it("reads monthly records inside an API envelope", () => {
    expect(
      parseTenantRevenueTrend({
        data: {
          currency: "NGN",
          outstandingTotal: 400,
          monthly: [
            { month: "2026-01", invoiced: 1500, received: 1100 },
            { month: "2026-02", invoiced: "900", received: "900" },
          ],
        },
      }),
    ).toEqual({
      currency: "NGN",
      outstandingTotal: 400,
      months: [
        { month: "2026-01", invoiced: 1500, received: 1100 },
        { month: "2026-02", invoiced: 900, received: 900 },
      ],
    });
  });

  it("reads parallel month and amount arrays", () => {
    expect(
      parseTenantRevenueTrend({
        data: { months: ["Jan", "Feb"], invoiced: [20, 30], received: [10, 25] },
      }).months,
    ).toEqual([
      { month: "Jan", invoiced: 20, received: 10 },
      { month: "Feb", invoiced: 30, received: 25 },
    ]);
  });

  it("rejects unknown data instead of plotting invented zeroes", () => {
    expect(() => parseTenantRevenueTrend({ data: [{ month: "Jan", value: 20 }] })).toThrow(
      "Revenue report format is not supported.",
    );
  });
});
