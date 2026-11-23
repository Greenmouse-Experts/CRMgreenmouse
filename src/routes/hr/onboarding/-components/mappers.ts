import type { EmployeeRecord } from "@/api/employeesApi";
import type { OnboardingTask } from "@/api/onboardingApi";
import type { ChecklistItem, DepartmentTag, OnboardingHire } from "./types";

export const UNKNOWN = "—";

export const DEPARTMENT_MAP: Record<string, DepartmentTag> = {
  hr: "HR",
  human_resources: "HR",
  it: "IT",
  ict: "IT",
  manager: "Manager",
  payroll: "Payroll",
};

export function toUiHire(employee: EmployeeRecord): OnboardingHire {
  const firstName = employee.firstName ?? employee.first_name ?? "";
  const lastName = employee.lastName ?? employee.last_name ?? "";
  const name =
    (employee.name ?? employee.fullName ?? `${firstName} ${lastName}`.trim()) ||
    UNKNOWN;

  const roleName =
    typeof employee.position === "object"
      ? employee.position?.name
      : typeof employee.role === "object"
        ? employee.role?.name
        : (employee.positionName ??
          employee.position_name ??
          employee.jobTitle ??
          employee.position ??
          UNKNOWN);

  const deptName =
    typeof employee.department === "object"
      ? employee.department?.name
      : (employee.departmentName ??
        employee.department_name ??
        employee.department ??
        UNKNOWN);

  const startFormatted = employee.startDate
    ? new Date(employee.startDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : employee.createdAt
      ? new Date(employee.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      : UNKNOWN;

  return {
    id: employee.id,
    name,
    role: roleName,
    dept: deptName,
    email: employee.email ?? UNKNOWN,
    start: startFormatted,
    progress: 0,
    probationStep: 0,
  };
}

export function toChecklistItem(raw: OnboardingTask): ChecklistItem {
  const deptKey = String(raw.department ?? raw.dept ?? "hr").toLowerCase();
  const status = String(raw.status ?? "").toLowerCase();

  return {
    id: raw.id,
    dept: DEPARTMENT_MAP[deptKey] ?? "HR",
    text:
      raw.title ?? raw.name ?? raw.text ?? raw.description ?? "Untitled task",
    completed: Boolean(
      raw.completed ??
      raw.isCompleted ??
      (status === "completed" || status === "done"),
    ),
  };
}

export const employeeDisplayName = (employee: EmployeeRecord): string => {
  const firstName = employee.firstName ?? employee.first_name ?? "";
  const lastName = employee.lastName ?? employee.last_name ?? "";
  return (
    (employee.name ??
      employee.fullName ??
      `${firstName} ${lastName}`.trim()) ||
    employee.email ||
    employee.id
  );
};
