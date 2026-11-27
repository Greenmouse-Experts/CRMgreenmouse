import { describe, expect, it } from "vitest";
import {
  filterPersonalAppraisals,
  filterPersonalDisciplinaryCases,
  filterPersonalGoals,
  filterStaffCourses,
  resolveStaffIdentity,
} from "./staffScoping";

describe("staffScoping", () => {
  const identity = resolveStaffIdentity({
    authUser: {
      id: "staff-user-1",
      email: "ada@company.com",
      firstName: "Ada",
      lastName: "Okafor",
      roleId: "role-eng",
    },
    myProfile: {
      id: "emp-1",
      employeeNumber: "EMP-001",
      firstName: "Ada",
      middleName: "Grace",
      lastName: "Okafor",
      email: "ada@company.com",
    },
    employees: [
      {
        id: "emp-1",
        staffId: "staff-user-1",
        employeeNumber: "EMP-001",
        firstName: "Ada",
        lastName: "Okafor",
        department: "Engineering",
        roleId: "role-eng",
      },
    ],
    departments: [
      {
        id: "dept-eng-uuid",
        code: "ENG",
        name: "Engineering",
        head: "Chidi",
        count: 5,
        status: "Active",
      },
      {
        id: "dept-sales-uuid",
        code: "SLS",
        name: "Sales",
        head: "Bola",
        count: 4,
        status: "Active",
      },
    ],
  });

  it("resolves employeeId, staffId, departmentId, and name candidates", () => {
    expect(identity.employeeId).toBe("emp-1");
    expect(identity.staffId).toBe("staff-user-1");
    expect(identity.departmentId).toBe("dept-eng-uuid");
    expect(identity.departmentName).toBe("Engineering");
    expect(identity.nameCandidates.has("ada okafor")).toBe(true);
    expect(identity.nameCandidates.has("ada grace okafor")).toBe(true);
  });

  it("filters department-targeted courses accurately and hides other departments", () => {
    const courses = [
      {
        id: "c-eng",
        status: "published",
        targetType: "department",
        targetIds: ["dept-eng-uuid"],
      },
      {
        id: "c-sales",
        status: "published",
        targetType: "department",
        targetIds: ["dept-sales-uuid"],
      },
      {
        id: "c-all",
        status: "published",
        targetType: "all",
        targetIds: [],
      },
      {
        id: "c-archived",
        status: "archived",
        targetType: "department",
        targetIds: ["dept-eng-uuid"],
      },
      {
        id: "c-other-selected",
        status: "published",
        targetType: "selected",
        targetIds: ["emp-999"],
      },
    ];

    const deptOnly = filterStaffCourses(
      courses,
      identity,
      new Set(),
      "department",
    );
    expect(deptOnly.map((c) => c.id)).toEqual(["c-eng"]);

    const allRelevant = filterStaffCourses(
      courses,
      identity,
      new Set(["c-other-selected"]),
      "all-relevant",
    );
    expect(allRelevant.map((c) => c.id)).toEqual([
      "c-eng",
      "c-all",
      "c-other-selected",
    ]);
  });

  it("filters performance goals and appraisals strictly to the employee", () => {
    const goals = [
      { id: "g1", employeeId: "emp-1" },
      { id: "g2", employeeId: "emp-2" },
    ];
    expect(filterPersonalGoals(goals, identity).map((g) => g.id)).toEqual([
      "g1",
    ]);

    const appraisals = [
      { id: "a1", employeeId: "emp-1", employee: "Ada Okafor" },
      { id: "a2", employeeId: "emp-2", employee: "Bola Ade" },
      { id: "a3", employee: "Ada Grace Okafor" },
    ];
    expect(
      filterPersonalAppraisals(appraisals, identity).map((a) => a.id),
    ).toEqual(["a1", "a3"]);
  });

  it("filters disciplinary cases strictly to the employee by ID or name", () => {
    const cases = [
      { id: "dc1", employeeId: "emp-1", employee: "Ada Okafor" },
      { id: "dc2", employee: "JOHN O" },
      { id: "dc3", employee: "  ada   grace   okafor " },
    ];
    expect(
      filterPersonalDisciplinaryCases(cases, identity).map((c) => c.id),
    ).toEqual(["dc1", "dc3"]);
  });
});
