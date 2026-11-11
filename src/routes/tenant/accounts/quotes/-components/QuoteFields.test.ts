import { describe, expect, it } from "vitest";
import { defaultQuoteValues, quotePayload } from "./QuoteFields";

describe("quote request payload", () => {
  it("sends the client name the backend DTO expects", () => {
    const payload = quotePayload({
      ...defaultQuoteValues(),
      date: "2026-06-15",
      amount: 150000,
      description: "**Website redesign** and SEO optimization",
      status: "draft",
      clientName: "Acme Corporation",
      expiresAt: "2026-10-31",
      notes: "Payment due within 30 days",
    });

    expect(payload).toEqual({
      date: "2026-06-15",
      amount: 150000,
      description: "**Website redesign** and SEO optimization",
      status: "draft",
      clientName: "Acme Corporation",
      expiresAt: "2026-10-31",
      notes: "Payment due within 30 days",
    });
    expect(payload).not.toHaveProperty("contactId");
    expect(payload).not.toHaveProperty("companyRecordId");
    expect(payload).not.toHaveProperty("companyId");
  });
});
