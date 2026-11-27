import type { EmployeeRecord } from "@/api/employeesApi";
import type {
  PerformanceAppraisal,
  PerformanceGoal,
} from "@/api/performanceApi";
import type { Task } from "@/api/tasksApi";
import type { DisciplinaryCase } from "@/routes/hr/disciplinary/-components/types";
import type { Department } from "@/routes/hr/organization/-components/types";
import type { Course } from "@/routes/hr/training/-components/types";

export interface AuthUserLike {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  roleId?: string;
  role?: { id?: string; name?: string };
}

export interface StaffIdentity {
  authUserId?: string;
  employeeId?: string;
  staffId?: string;
  roleId?: string;
  departmentId?: string;
  departmentName?: string;
  email?: string;
  fullName: string;
  employeeNumber?: string;
  idCandidates: Set<string>;
  nameCandidates: Set<string>;
}

export const normalizeIdentityText = (value?: string | null): string =>
  (value ?? "").trim().toLowerCase().replace(/\s+/g, " ");

const extractDeptName = (
  dept?: { id?: string; name?: string } | string | null,
): string | undefined => {
  if (!dept) return undefined;
  if (typeof dept === "string") return dept.trim() || undefined;
  return dept.name?.trim() || undefined;
};

const extractDeptId = (
  dept?: { id?: string; name?: string } | string | null,
): string | undefined => {
  if (!dept || typeof dept === "string") return undefined;
  return dept.id?.trim() || undefined;
};

const collectNameForms = (
  record?: {
    firstName?: string;
    middleName?: string;
    lastName?: string;
    name?: string;
    fullName?: string;
  } | null,
): string[] => {
  if (!record) return [];
  const candidates: string[] = [];
  const firstLast = [record.firstName, record.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  const fullThree = [record.firstName, record.middleName, record.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  if (firstLast) candidates.push(firstLast);
  if (fullThree) candidates.push(fullThree);
  if (record.name) candidates.push(record.name);
  if (record.fullName) candidates.push(record.fullName);

  return candidates.map(normalizeIdentityText).filter(Boolean);
};

export function resolveStaffIdentity({
  authUser,
  myProfile,
  employees = [],
  departments = [],
}: {
  authUser?: AuthUserLike | null;
  myProfile?: EmployeeRecord | null;
  employees?: EmployeeRecord[];
  departments?: Department[];
}): StaffIdentity {
  const authUserId = authUser?.id?.trim() || undefined;
  const emailCandidates = new Set(
    [myProfile?.email, authUser?.email]
      .map((e) => normalizeIdentityText(e))
      .filter(Boolean),
  );

  const matchedEmployee =
    employees.find((e) => myProfile?.id && e.id === myProfile.id) ??
    employees.find(
      (e) => authUserId && (e.staffId === authUserId || e.id === authUserId),
    ) ??
    employees.find(
      (e) => e.email && emailCandidates.has(normalizeIdentityText(e.email)),
    ) ??
    employees.find(
      (e) =>
        myProfile?.employeeNumber &&
        e.employeeNumber === myProfile.employeeNumber,
    );

  const employeeId =
    myProfile?.id?.trim() || matchedEmployee?.id?.trim() || undefined;
  const staffId = matchedEmployee?.staffId?.trim() || authUserId;
  const roleId =
    matchedEmployee?.roleId?.trim() ||
    matchedEmployee?.role?.id?.trim() ||
    authUser?.roleId?.trim() ||
    authUser?.role?.id?.trim() ||
    undefined;
  const employeeNumber =
    myProfile?.employeeNumber?.trim() ||
    matchedEmployee?.employeeNumber?.trim() ||
    undefined;

  let departmentName =
    matchedEmployee?.departmentName?.trim() ||
    extractDeptName(matchedEmployee?.department) ||
    myProfile?.departmentName?.trim() ||
    extractDeptName(myProfile?.department);

  let departmentId =
    matchedEmployee?.departmentId?.trim() ||
    extractDeptId(matchedEmployee?.department) ||
    myProfile?.departmentId?.trim() ||
    extractDeptId(myProfile?.department);

  if (!departmentId && departmentName) {
    const normalizedDept = normalizeIdentityText(departmentName);
    const matchedDept = departments.find(
      (d) => normalizeIdentityText(d.name) === normalizedDept,
    );
    if (matchedDept?.id) departmentId = matchedDept.id;
  }

  if (!departmentName && departmentId) {
    const matchedDept = departments.find((d) => d.id === departmentId);
    if (matchedDept?.name) departmentName = matchedDept.name;
  }

  const nameCandidates = new Set<string>([
    ...collectNameForms(myProfile),
    ...collectNameForms(matchedEmployee),
    ...collectNameForms(authUser),
  ]);

  const idCandidates = new Set<string>(
    [employeeId, staffId, employeeNumber].filter(
      (v): v is string => typeof v === "string" && v.length > 0,
    ),
  );

  const primaryName =
    [myProfile?.firstName, myProfile?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    [matchedEmployee?.firstName, matchedEmployee?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    [authUser?.firstName, authUser?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    myProfile?.email ||
    authUser?.email ||
    "Employee";

  return {
    authUserId,
    employeeId,
    staffId,
    roleId,
    departmentId,
    departmentName,
    email: myProfile?.email || matchedEmployee?.email || authUser?.email,
    fullName: primaryName,
    employeeNumber,
    idCandidates,
    nameCandidates,
  };
}

export function isCourseRelatedToDepartment(
  course: Pick<Course, "targetType" | "targetIds">,
  identity: Pick<StaffIdentity, "departmentId" | "departmentName">,
): boolean {
  if (String(course.targetType ?? "").toLowerCase() !== "department") {
    return false;
  }
  const targetIds = Array.isArray(course.targetIds) ? course.targetIds : [];
  if (targetIds.length === 0) return false;

  if (identity.departmentId && targetIds.includes(identity.departmentId)) {
    return true;
  }

  if (identity.departmentName) {
    const normDept = normalizeIdentityText(identity.departmentName);
    return targetIds.some((tid) => normalizeIdentityText(tid) === normDept);
  }

  return false;
}

export function isCourseRelevantToStaff(
  course: Pick<Course, "id" | "status" | "targetType" | "targetIds">,
  identity: Pick<
    StaffIdentity,
    "departmentId" | "departmentName" | "roleId" | "idCandidates"
  >,
  enrolledCourseIds: Set<string>,
): boolean {
  if (String(course.status ?? "").toLowerCase() === "archived") {
    return false;
  }

  if (enrolledCourseIds.has(course.id)) {
    return true;
  }

  const targetType = String(course.targetType ?? "all").toLowerCase();
  const targetIds = Array.isArray(course.targetIds) ? course.targetIds : [];

  switch (targetType) {
    case "department":
      return isCourseRelatedToDepartment(course, identity);
    case "all":
      return true;
    case "role":
      return Boolean(identity.roleId && targetIds.includes(identity.roleId));
    case "selected":
      return targetIds.some((tid) => identity.idCandidates.has(tid));
    default:
      return false;
  }
}

export type StaffTrainingScopeTab = "all-relevant" | "department" | "enrolled";

export function filterStaffCourses<
  T extends Pick<Course, "id" | "status" | "targetType" | "targetIds">,
>(
  courses: T[],
  identity: Pick<
    StaffIdentity,
    "departmentId" | "departmentName" | "roleId" | "idCandidates"
  >,
  enrolledCourseIds: Set<string>,
  tab: StaffTrainingScopeTab = "all-relevant",
): T[] {
  const nonArchived = courses.filter(
    (c) => String(c.status ?? "").toLowerCase() !== "archived",
  );

  if (tab === "enrolled") {
    return nonArchived.filter((c) => enrolledCourseIds.has(c.id));
  }

  if (tab === "department") {
    return nonArchived.filter((c) => isCourseRelatedToDepartment(c, identity));
  }

  return nonArchived.filter((c) =>
    isCourseRelevantToStaff(c, identity, enrolledCourseIds),
  );
}

export function filterPersonalGoals<
  T extends Pick<PerformanceGoal, "employeeId"> & {
    employeeName?: string;
    employee?: string;
  },
>(
  goals: T[],
  identity: Pick<StaffIdentity, "idCandidates" | "nameCandidates">,
): T[] {
  if (identity.idCandidates.size === 0 && identity.nameCandidates.size === 0) {
    return [];
  }
  return goals.filter((goal) => {
    if (goal.employeeId && identity.idCandidates.has(String(goal.employeeId))) {
      return true;
    }
    const candidateName = normalizeIdentityText(
      goal.employeeName ?? goal.employee,
    );
    return Boolean(candidateName && identity.nameCandidates.has(candidateName));
  });
}

export function filterPersonalAppraisals<
  T extends Pick<PerformanceAppraisal, "employeeId" | "employee">,
>(
  appraisals: T[],
  identity: Pick<StaffIdentity, "idCandidates" | "nameCandidates">,
): T[] {
  if (identity.idCandidates.size === 0 && identity.nameCandidates.size === 0) {
    return [];
  }
  return appraisals.filter((appraisal) => {
    if (
      appraisal.employeeId &&
      identity.idCandidates.has(String(appraisal.employeeId))
    ) {
      return true;
    }
    const candidateName = normalizeIdentityText(appraisal.employee);
    return Boolean(candidateName && identity.nameCandidates.has(candidateName));
  });
}

export function filterPersonalDisciplinaryCases<
  T extends Pick<DisciplinaryCase, "employeeId" | "employee">,
>(
  cases: T[],
  identity: Pick<StaffIdentity, "idCandidates" | "nameCandidates">,
): T[] {
  if (identity.idCandidates.size === 0 && identity.nameCandidates.size === 0) {
    return [];
  }
  return cases.filter((item) => {
    if (item.employeeId && identity.idCandidates.has(String(item.employeeId))) {
      return true;
    }
    const candidateName = normalizeIdentityText(item.employee);
    return Boolean(candidateName && identity.nameCandidates.has(candidateName));
  });
}

export function filterPersonalTasks<
  T extends Pick<Task, "assignedTo" | "assignee">,
>(
  tasks: T[],
  identity: Pick<StaffIdentity, "idCandidates" | "nameCandidates" | "email">,
): T[] {
  const normalizedIdentityEmail = normalizeIdentityText(identity.email);
  if (
    identity.idCandidates.size === 0 &&
    identity.nameCandidates.size === 0 &&
    !normalizedIdentityEmail
  ) {
    return [];
  }

  return tasks.filter((task) => {
    const rawAssignedTo = task.assignedTo as
      | string
      | { id?: string }
      | null
      | undefined;
    const assignedToId =
      typeof rawAssignedTo === "string"
        ? rawAssignedTo.trim()
        : rawAssignedTo?.id?.trim();

    if (assignedToId && identity.idCandidates.has(assignedToId)) {
      return true;
    }

    if (
      task.assignee?.id &&
      identity.idCandidates.has(String(task.assignee.id).trim())
    ) {
      return true;
    }

    const assigneeEmail = normalizeIdentityText(task.assignee?.email);
    if (
      normalizedIdentityEmail &&
      assigneeEmail &&
      assigneeEmail === normalizedIdentityEmail
    ) {
      return true;
    }

    const assigneeName = normalizeIdentityText(
      task.assignee?.name ??
        ([task.assignee?.firstName, task.assignee?.lastName]
          .filter(Boolean)
          .join(" ") ||
          undefined),
    );
    return Boolean(assigneeName && identity.nameCandidates.has(assigneeName));
  });
}
