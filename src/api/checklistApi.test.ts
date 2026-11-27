import { describe, expect, it } from "vitest";
import {
  buildCreateChecklistPayload,
  buildUpdateChecklistPayload,
  normalizeChecklistActiveFlag,
  normalizeChecklistItem,
  sortChecklistItems,
  unwrapChecklistList,
  unwrapChecklistOne,
} from "./checklistApi";

describe("checklistApi helpers", () => {
  it("unwraps checklist item lists from direct and wrapped envelopes", () => {
    expect(unwrapChecklistList([{ id: "c-1" }])).toEqual([{ id: "c-1" }]);
    expect(unwrapChecklistList({ data: [{ id: "c-2" }] })).toEqual([
      { id: "c-2" },
    ]);
    expect(
      unwrapChecklistList({ data: { checklist: [{ id: "c-3" }] } }),
    ).toEqual([{ id: "c-3" }]);
    expect(unwrapChecklistList({ items: [{ id: "c-4" }] })).toEqual([
      { id: "c-4" },
    ]);
  });

  it("unwraps a single checklist item from response envelopes", () => {
    expect(unwrapChecklistOne({ id: "c-1", title: "NDA" })).toEqual({
      id: "c-1",
      title: "NDA",
    });
    expect(unwrapChecklistOne({ data: { id: "c-2", title: "Laptop" } })).toEqual(
      {
        id: "c-2",
        title: "Laptop",
      },
    );
    expect(
      unwrapChecklistOne({ data: { item: { id: "c-3", title: "Email" } } }),
    ).toEqual({
      id: "c-3",
      title: "Email",
    });
  });

  it("normalizes active flags between Y/N and boolean/status representations", () => {
    expect(normalizeChecklistActiveFlag("Y")).toBe("Y");
    expect(normalizeChecklistActiveFlag("y")).toBe("Y");
    expect(normalizeChecklistActiveFlag(true)).toBe("Y");
    expect(normalizeChecklistActiveFlag("active")).toBe("Y");
    expect(normalizeChecklistActiveFlag("N")).toBe("N");
    expect(normalizeChecklistActiveFlag("n")).toBe("N");
    expect(normalizeChecklistActiveFlag(false)).toBe("N");
    expect(normalizeChecklistActiveFlag("inactive")).toBe("N");
    expect(normalizeChecklistActiveFlag(0)).toBe("N");
  });

  it("normalizes checklist items and sorts by sortOrder then title", () => {
    const items = [
      normalizeChecklistItem({
        id: "c-2",
        title: "Setup VPN",
        description: "Configure company VPN",
        owner: "IT",
        sortOrder: 2,
        isActive: "Y",
      }),
      normalizeChecklistItem({
        id: "c-1",
        title: "Sign Offer Letter",
        description: "Complete onboarding paperwork",
        owner: "hr",
        sortOrder: 0,
        isActive: "N",
      }),
      normalizeChecklistItem({
        id: "c-3",
        title: "Alpha Step",
        owner: "manager",
        sortOrder: 2,
      }),
    ];

    const sorted = sortChecklistItems(items);
    expect(sorted.map((item) => item.id)).toEqual(["c-1", "c-3", "c-2"]);
    expect(sorted[0]).toMatchObject({
      id: "c-1",
      owner: "hr",
      isActive: "N",
      active: false,
      sortOrder: 0,
    });
    expect(sorted[2]).toMatchObject({
      id: "c-2",
      owner: "it",
      isActive: "Y",
      active: true,
      sortOrder: 2,
    });
  });

  it("builds Postman-aligned create and update payloads", () => {
    expect(
      buildCreateChecklistPayload({
        title: "  Issue ID Card  ",
        description: "  Print staff badge  ",
        owner: "HR",
        sortOrder: 3,
      }),
    ).toEqual({
      title: "Issue ID Card",
      description: "Print staff badge",
      owner: "hr",
      sortOrder: 3,
    });

    expect(
      buildUpdateChecklistPayload({
        title: "  Updated Badge  ",
        isActive: "N",
      }),
    ).toEqual({
      title: "Updated Badge",
      isActive: "N",
    });

    expect(
      buildUpdateChecklistPayload({
        isActive: true,
        sortOrder: -5,
      }),
    ).toEqual({
      isActive: "Y",
      sortOrder: 0,
    });
  });
});
