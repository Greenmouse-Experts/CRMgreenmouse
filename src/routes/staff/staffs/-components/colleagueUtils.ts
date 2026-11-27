import type { ColleagueRecord } from "@/api/employeesApi";
import type { Colleague } from "./types";

export const UNKNOWN = "—";

export function getInitials(name: string): string {
  if (!name) return "";
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function getAvatarColor(name: string): string {
  const palettes = [
    "bg-primary/15 text-primary border-primary/20",
    "bg-info/15 text-info border-info/20",
    "bg-success/15 text-success border-success/20",
    "bg-warning/20 text-warning-foreground border-warning/30",
    "bg-secondary/15 text-secondary border-secondary/20",
    "bg-accent/15 text-accent-foreground border-accent/20",
  ];
  const sum = [...name].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return palettes[sum % palettes.length];
}

export const titleCase = (value?: string | null) =>
  value
    ? value
        .trim()
        .split(/\s+/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ")
    : UNKNOWN;

export const formatDeptLabel = (rawDept?: string | null) => {
  if (!rawDept || !rawDept.trim()) return UNKNOWN;
  const lower = rawDept.trim().toLowerCase();
  if (lower === "qa") return "QA";
  if (lower === "hr") return "HR";
  if (lower === "it") return "IT";
  return titleCase(rawDept);
};

export const relationName = (
  relation?: { name?: string; title?: string } | string | null,
  fallback?: string | null,
) => {
  if (relation && typeof relation === "object") {
    return relation.name || relation.title || fallback || UNKNOWN;
  }
  if (typeof relation === "string" && relation) return relation;
  return fallback || UNKNOWN;
};

export const toUiColleague = (employee: ColleagueRecord): Colleague => {
  const explicitStatus =
    employee.lifecycleStatus ||
    employee.employmentStatus ||
    employee.status ||
    (employee.isDraft ? "draft" : undefined);

  const rawStatus = explicitStatus || "active";
  const statusKey = rawStatus.toLowerCase();
  const status =
    statusKey === "active"
      ? "Active"
      : statusKey === "preboarding"
        ? "Preboarding"
        : statusKey === "notice_period"
          ? "Notice Period"
          : statusKey === "suspended"
            ? "Suspended"
            : statusKey === "exited"
              ? "Exited"
              : statusKey === "draft"
                ? "Draft"
                : titleCase(rawStatus);

  const firstName = employee.firstName ?? employee.first_name ?? "";
  const middleName = employee.middleName ?? employee.middle_name ?? "";
  const lastName = employee.lastName ?? employee.last_name ?? "";

  const constructedName = [firstName, middleName, lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  const name =
    employee.name ??
    employee.fullName ??
    (constructedName ? titleCase(constructedName) : employee.email || UNKNOWN);

  const empNumber =
    employee.employeeNumber ||
    employee.employee_number ||
    (employee.id && employee.id.length > 8
      ? employee.id.slice(0, 8)
      : employee.id) ||
    UNKNOWN;

  const rawTitle = relationName(
    employee.position ?? employee.role,
    employee.jobTitle ?? employee.positionName ?? employee.position_name,
  );
  const title = rawTitle !== UNKNOWN ? titleCase(rawTitle) : UNKNOWN;

  const rawDept = relationName(
    employee.department,
    employee.departmentName ?? employee.department_name,
  );
  const dept = rawDept !== UNKNOWN ? formatDeptLabel(rawDept) : UNKNOWN;

  const rawType =
    employee.employeeType ??
    employee.employmentType ??
    employee.employment_type ??
    UNKNOWN;
  const type = rawType !== UNKNOWN ? titleCase(rawType) : UNKNOWN;

  const rawLocation =
    employee.workLocation ??
    employee.location ??
    employee.work_location ??
    UNKNOWN;
  const location = rawLocation !== UNKNOWN ? titleCase(rawLocation) : UNKNOWN;

  return {
    id: employee.id || employee._id || UNKNOWN,
    staffId: employee.staffId || undefined,
    employeeNumber: empNumber,
    name,
    firstName,
    middleName,
    lastName,
    email: employee.email ?? UNKNOWN,
    phone:
      employee.phone ||
      employee.phoneNumber ||
      employee.phone_number ||
      UNKNOWN,
    profilePhotoUrl: employee.profilePhotoUrl ?? employee.photoUrl ?? null,
    title,
    dept,
    rawDept: rawDept !== UNKNOWN ? rawDept : undefined,
    location,
    type,
    status,
    hasStatus: Boolean(explicitStatus),
    isDraft: Boolean(employee.isDraft || statusKey === "draft"),
    onLeave: Boolean(employee.onLeave || employee.isOnLeave),
  };
};
