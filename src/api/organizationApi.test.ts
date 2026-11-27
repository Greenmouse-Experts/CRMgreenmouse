import { describe, expect, it } from "vitest";
import {
  mapPortalOrganizationPayload,
  toUiHierarchyNode,
  toUiPosition,
} from "./organizationApi";

describe("toUiPosition", () => {
  it("maps portal organization gradeName and filledHeadcount fields", () => {
    const pos = toUiPosition({
      id: "pos-1",
      title: "QA Analyst",
      departmentId: "dept-1",
      department: { id: "dept-1", name: "qa" },
      gradeName: "IC-2",
      approvedHeadcount: 4,
      filledHeadcount: 2,
    });

    expect(pos.id).toBe("pos-1");
    expect(pos.title).toBe("QA Analyst");
    expect(pos.dept).toBe("qa");
    expect(pos.grade).toBe("IC-2");
    expect(pos.approved).toBe(4);
    expect(pos.filled).toBe(2);
  });
});

describe("toUiHierarchyNode", () => {
  it("recursively maps nested department children", () => {
    const node = toUiHierarchyNode({
      id: "dept-root",
      name: "Engineering",
      code: "ENG",
      status: "active",
      staffCount: 12,
      children: [
        {
          id: "dept-child",
          name: "QA",
          code: "QA",
          status: "active",
          staffCount: 3,
          children: [],
        },
      ],
    });

    expect(node.name).toBe("Engineering");
    expect(node.status).toBe("Active");
    expect(node.children).toHaveLength(1);
    expect(node.children[0].name).toBe("QA");
    expect(node.children[0].count).toBe(3);
  });
});

describe("mapPortalOrganizationPayload", () => {
  it("maps summary, departments, positions, and hierarchy from /employees/portal/organization", () => {
    const result = mapPortalOrganizationPayload({
      summary: {
        totalWorkforce: 25,
        departments: 3,
        approvedHeadcount: 30,
        openRequisitions: 5,
      },
      departments: [
        {
          id: "dept-1",
          name: "qa",
          code: "QA",
          status: "active",
          staffCount: 5,
          headName: "Ada Lovelace",
        },
      ],
      positions: [
        {
          id: "pos-1",
          title: "QA Lead",
          departmentName: "qa",
          gradeName: "M1",
          approvedHeadcount: 2,
          filledHeadcount: 1,
        },
      ],
      hierarchy: [
        {
          id: "dept-1",
          name: "qa",
          code: "QA",
          status: "active",
          children: [],
        },
      ],
    });

    expect(result.summary).toEqual({
      totalWorkforce: 25,
      departments: 3,
      approvedHeadcount: 30,
      openRequisitions: 5,
    });
    expect(result.departments).toHaveLength(1);
    expect(result.departments[0].head).toBe("Ada Lovelace");
    expect(result.positions[0].grade).toBe("M1");
    expect(result.positions[0].filled).toBe(1);
    expect(result.hierarchy).toHaveLength(1);
  });

  it("derives summary totals when summary block is omitted", () => {
    const result = mapPortalOrganizationPayload({
      departments: [
        { id: "d1", name: "Ops", status: "active", staffCount: 4 },
        { id: "d2", name: "Sales", status: "active", staffCount: 6 },
      ],
      positions: [
        {
          id: "p1",
          title: "Rep",
          departmentName: "Sales",
          approvedHeadcount: 8,
          filledHeadcount: 5,
        },
      ],
      hierarchy: [],
    });

    expect(result.summary).toEqual({
      totalWorkforce: 10,
      departments: 2,
      approvedHeadcount: 8,
      openRequisitions: 3,
    });
  });
});
