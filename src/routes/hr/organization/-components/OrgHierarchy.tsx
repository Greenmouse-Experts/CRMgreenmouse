import { useMemo } from "react";
import type { Department, OrgLeader } from "./types";
import { Building2, ShieldCheck, Users } from "lucide-react";

interface OrgHierarchyProps {
  leader?: OrgLeader | null;
  departments: Department[];
  selectedDeptId?: string | null;
  onSelectDept?: (deptId: string) => void;
}

const AVATAR_COLORS = [
  "bg-indigo-100 text-indigo-700 border-indigo-200",
  "bg-emerald-100 text-emerald-700 border-emerald-200",
  "bg-amber-100 text-amber-700 border-amber-200",
  "bg-rose-100 text-rose-700 border-rose-200",
  "bg-cyan-100 text-cyan-700 border-cyan-200",
  "bg-purple-100 text-purple-700 border-purple-200",
  "bg-teal-100 text-teal-700 border-teal-200",
];

const getInitials = (name?: string | null) => {
  if (!name || !name.trim()) return "—";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export interface DepartmentTree {
  roots: Department[];
  childrenMap: Map<string, Department[]>;
}

/**
 * Build a parent/child tree from `parentDepartmentId`.
 *
 * Departments whose parent is missing, unknown, or themselves are treated as
 * roots. A pure cycle (A → B → A) has no roots, so it falls back to a flat
 * list instead of rendering nothing.
 */
export function buildDepartmentTree(departments: Department[]): DepartmentTree {
  const byId = new Map(departments.map((dept) => [dept.id, dept]));
  const childrenMap = new Map<string, Department[]>();
  const roots: Department[] = [];

  for (const dept of departments) {
    const parentId = dept.parentDepartmentId ?? null;
    const parent = parentId ? byId.get(parentId) : undefined;

    if (parent && parent.id !== dept.id) {
      const siblings = childrenMap.get(parent.id) ?? [];
      siblings.push(dept);
      childrenMap.set(parent.id, siblings);
    } else {
      roots.push(dept);
    }
  }

  if (roots.length === 0 && departments.length > 0) {
    return { roots: departments, childrenMap: new Map() };
  }

  return { roots, childrenMap };
}

interface DepartmentCardProps {
  dept: Department;
  index: number;
  depth: number;
  childCount: number;
  isSelected: boolean;
  onSelect?: (deptId: string) => void;
}

function DepartmentCard({
  dept,
  index,
  depth,
  childCount,
  isSelected,
  onSelect,
}: DepartmentCardProps) {
  const compact = depth > 0;
  const colorClass = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const headText = dept.head || dept.headName || "Unassigned";
  const hasHead = Boolean(headText && headText !== "Unassigned");

  return (
    <div
      onClick={() => dept.id && onSelect?.(dept.id)}
      className={`group relative rounded-xl border text-center transition-all duration-200 cursor-pointer ${
        compact ? "p-2.5" : "p-3.5"
      } ${
        isSelected
          ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
          : "border-base-200 bg-base-100 hover:border-primary/80 hover:shadow-md"
      }`}
    >
      {/* Department Head Initials Avatar */}
      <div className="flex justify-center mb-2">
        <div
          className={`${
            compact ? "size-7 text-[10px]" : "size-9"
          } rounded-full flex items-center justify-center font-bold border ${colorClass}`}
        >
          {getInitials(hasHead ? headText : dept.name)}
        </div>
      </div>

      {/* Department Info */}
      <p
        className={`${
          compact ? "text-xs" : "text-sm"
        } font-bold text-base-content group-hover:text-primary transition-colors truncate`}
      >
        {dept.name || "Department"}
      </p>
      <p className="text-[11px] text-base-content/80 truncate mt-0.5">
        {headText}
      </p>
      {dept.code && (
        <p className="text-[10px] font-mono uppercase tracking-wide text-base-content/50 truncate">
          {dept.code}
        </p>
      )}

      {/* Staff / Sub-department Pills */}
      <div className="mt-2 flex flex-wrap items-center justify-center gap-1">
        <span className="inline-block rounded-full bg-primary/10 border border-primary/15 px-2.5 py-0.5 text-[11px] font-bold text-primary">
          {dept.count ?? 0} staff
        </span>
        {childCount > 0 && (
          <span className="inline-block rounded-full bg-base-200 border border-base-300 px-2.5 py-0.5 text-[10px] font-semibold text-base-content/70">
            {childCount} sub
          </span>
        )}
      </div>
    </div>
  );
}

interface HierarchyBranchProps {
  dept: Department;
  index: number;
  depth: number;
  tree: DepartmentTree;
  selectedDeptId?: string | null;
  onSelectDept?: (deptId: string) => void;
}

function HierarchyBranch({
  dept,
  index,
  depth,
  tree,
  selectedDeptId,
  onSelectDept,
}: HierarchyBranchProps) {
  const children = tree.childrenMap.get(dept.id) ?? [];

  return (
    <div className="flex flex-col">
      <DepartmentCard
        dept={dept}
        index={index}
        depth={depth}
        childCount={children.length}
        isSelected={selectedDeptId === dept.id}
        onSelect={onSelectDept}
      />

      {children.length > 0 && (
        <div className="mt-2 ml-3 space-y-2 border-l-2 border-primary/20 pl-3">
          {children.map((child, childIdx) => (
            <HierarchyBranch
              key={child.id || `${dept.id}-${childIdx}`}
              dept={child}
              index={index + childIdx + 1}
              depth={depth + 1}
              tree={tree}
              selectedDeptId={selectedDeptId}
              onSelectDept={onSelectDept}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrgHierarchy({
  leader,
  departments,
  selectedDeptId,
  onSelectDept,
}: OrgHierarchyProps) {
  const tree = useMemo(() => buildDepartmentTree(departments), [departments]);

  const hasLeader = Boolean(leader?.name?.trim());

  const totalHeadcount = departments.reduce(
    (acc, d) => acc + (Number(d.count) || 0),
    0,
  );

  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-base-200">
        <div>
          <h2 className="text-lg font-bold text-base-content">Hierarchy</h2>
          <p className=" text-base-content/80">
            Executive leadership structure, functional department heads, and
            reporting channels
          </p>
        </div>
        <div className="flex items-center gap-1.5  text-base-content/80">
          <Users className="size-3.5" />
          <span>{totalHeadcount} Total Reporting Headcount</span>
        </div>
      </div>

      {/* Visual Org Tree */}
      <div className="flex flex-col items-center pt-2 overflow-x-auto pb-4">
        {/* Organization / Leader Root Node */}
        <div className="group relative rounded-2xl border-2 border-primary bg-primary/10 px-6 py-4 text-center shadow-xs transition-all hover:shadow-md hover:scale-[1.02] min-w-[220px]">
          <div className="flex justify-center mb-2">
            <div className="relative">
              <div className="size-12 rounded-full bg-primary text-white font-bold text-sm flex items-center justify-center shadow-sm">
                {hasLeader ? (
                  getInitials(leader?.name)
                ) : (
                  <Building2 className="size-5" />
                )}
              </div>
              {hasLeader && (
                <span className="absolute -bottom-1 -right-1 size-5 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-base-100 shadow-xs">
                  <ShieldCheck className="size-3" />
                </span>
              )}
            </div>
          </div>
          <p className="font-bold text-sm sm:text-base text-base-content">
            {hasLeader ? leader?.name : "Organization"}
          </p>
          <p className=" text-primary font-semibold tracking-wide">
            {hasLeader
              ? leader?.title || "Organization"
              : `${departments.length} ${departments.length === 1 ? "Department" : "Departments"}`}
          </p>
        </div>

        {departments.length === 0 ? (
          <div className="pt-6 text-center  text-base-content/80">
            No departments configured yet. Click "Add department" above to start
            building your organizational structure.
          </div>
        ) : (
          <>
            {/* Vertical Trunk Line */}
            <div className="h-7 w-0.5 bg-primary/80" />

            {/* Horizontal Cross Branch Line */}
            <div className="hidden lg:block w-[88%] h-0.5 bg-primary/20 mb-3 relative">
              <div className="absolute left-0 top-0 size-2 rounded-full bg-primary/80 -translate-y-1/2" />
              <div className="absolute right-0 top-0 size-2 rounded-full bg-primary/80 -translate-y-1/2" />
              <div className="absolute left-1/2 top-0 size-2.5 rounded-full bg-primary -translate-x-1/2 -translate-y-1/2" />
            </div>

            {/* Department tree: roots side by side, children nested under parents */}
            <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pt-1 items-start">
              {tree.roots.map((dept, idx) => (
                <HierarchyBranch
                  key={dept.id || idx}
                  dept={dept}
                  index={idx}
                  depth={0}
                  tree={tree}
                  selectedDeptId={selectedDeptId}
                  onSelectDept={onSelectDept}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
