import { describe, expect, it } from "vitest";
import {
  mapBackendOffboardingCase,
  mapBackendOffboardingTask,
  unwrapList,
} from "./offboardingApi";

describe("unwrapList", () => {
  it("extracts offboarding arrays from direct and wrapped envelopes", () => {
    expect(unwrapList([{ id: "1" }], ["cases"])).toEqual([{ id: "1" }]);
    expect(unwrapList({ data: [{ id: "2" }] }, ["cases"])).toEqual([
      { id: "2" },
    ]);
    expect(unwrapList({ cases: [{ id: "3" }] }, ["cases"])).toEqual([
      { id: "3" },
    ]);
    expect(
      unwrapList({ data: { cases: [{ id: "4" }] } }, ["cases"]),
    ).toEqual([{ id: "4" }]);
    expect(
      unwrapList({ data: { data: { items: [{ id: "5" }] } } }, [
        "cases",
        "items",
      ]),
    ).toEqual([{ id: "5" }]);
  });
});

describe("mapBackendOffboardingCase", () => {
  it("maps nested { case, employee, tasks, settlement } records and preserves case id", () => {
    const mapped = mapBackendOffboardingCase({
      case: {
        id: "case-nested-1",
        employeeId: "emp-1",
        category: "resignation",
        noticeDate: "2026-11-01T00:00:00.000Z",
        lastWorkingDate: "2026-11-30T00:00:00.000Z",
        currentStage: "clearance",
        status: "clearance_in_progress",
      },
      employee: {
        id: "emp-1",
        firstName: "Ada",
        lastName: "Lovelace",
        department: { name: "Engineering" },
        position: { title: "Staff Engineer" },
      },
      settlement: { status: "submitted" },
      tasks: [
        {
          id: "task-1",
          title: "Return laptop",
          department: "IT",
          status: "pending",
        },
      ],
    });

    expect(mapped.id).toBe("case-nested-1");
    expect(mapped.employee).toBe("Ada Lovelace");
    expect(mapped.employeeId).toBe("emp-1");
    expect(mapped.department).toBe("Engineering");
    expect(mapped.role).toBe("Staff Engineer");
    expect(mapped.currentStep).toBe("Clearance");
    expect(mapped.status).toBe("Clearance in progress");
    expect(mapped.settlementStatus).toBe("submitted");
    expect(mapped.lastWorkingDay).toBe("2026-11-30");
    expect(mapped.tasks?.[0]).toMatchObject({
      id: "task-1",
      caseId: "case-nested-1",
      item: "Return laptop",
    });
  });

  it("maps flat and alternative id keys (caseId, offboardingCaseId, _id)", () => {
    expect(
      mapBackendOffboardingCase({
        caseId: "case-alt-1",
        employeeName: "Grace Hopper",
        status: "notice_period",
      }).id,
    ).toBe("case-alt-1");

    expect(
      mapBackendOffboardingCase({
        offboardingCaseId: "case-alt-2",
        employeeName: "Alan Turing",
      }).id,
    ).toBe("case-alt-2");

    expect(
      mapBackendOffboardingCase({
        offboardingCase: { _id: "case-alt-3" },
        employee: "Katherine Johnson",
      }).id,
    ).toBe("case-alt-3");
  });
});

describe("mapBackendOffboardingTask", () => {
  it("resolves nested task objects and falls back to parent caseId", () => {
    const mapped = mapBackendOffboardingTask(
      {
        task: {
          id: "t-9",
          title: "Revoke VPN",
          department: "it",
          status: "in_progress",
          dueDate: "2026-11-25T10:00:00.000Z",
        },
        assignee: { firstName: "Linus", lastName: "Torvalds" },
      },
      "case-parent-9",
    );

    expect(mapped).toMatchObject({
      id: "t-9",
      caseId: "case-parent-9",
      department: "IT",
      item: "Revoke VPN",
      owner: "Linus Torvalds",
      status: "In Progress",
      dueDate: "2026-11-25",
    });
  });
});
