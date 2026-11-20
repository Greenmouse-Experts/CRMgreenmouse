import type { Department, OrgLeader } from "./types";
import { ShieldCheck, Users } from "lucide-react";

interface OrgHierarchyProps {
  leader: OrgLeader;
  departments: Department[];
  selectedDeptId?: string | null;
  onSelectDept?: (deptId: string) => void;
}

export default function OrgHierarchy({
  leader,
  departments,
  selectedDeptId,
  onSelectDept,
}: OrgHierarchyProps) {
  const getInitials = (name?: string | null) => {
    if (!name || !name.trim()) return "—";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const avatarColors = [
    "bg-indigo-100 text-indigo-700 border-indigo-200",
    "bg-emerald-100 text-emerald-700 border-emerald-200",
    "bg-amber-100 text-amber-700 border-amber-200",
    "bg-rose-100 text-rose-700 border-rose-200",
    "bg-cyan-100 text-cyan-700 border-cyan-200",
    "bg-purple-100 text-purple-700 border-purple-200",
    "bg-teal-100 text-teal-700 border-teal-200",
  ];

  const safeLeader = leader || {
    name: "Ifeoma Chukwu",
    title: "Chief Executive Officer",
  };

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
        {/* CEO Root Node */}
        <div className="group relative rounded-2xl border-2 border-primary bg-primary/10 px-6 py-4 text-center shadow-xs transition-all hover:shadow-md hover:scale-[1.02] min-w-[220px]">
          <div className="flex justify-center mb-2">
            <div className="relative">
              <div className="size-12 rounded-full bg-primary text-white font-bold text-sm flex items-center justify-center shadow-sm">
                {getInitials(safeLeader.name)}
              </div>
              <span className="absolute -bottom-1 -right-1 size-5 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-base-100 shadow-xs">
                <ShieldCheck className="size-3" />
              </span>
            </div>
          </div>
          <p className="font-bold text-sm sm:text-base text-base-content">
            {safeLeader.name}
          </p>
          <p className=" text-primary font-semibold tracking-wide">
            {safeLeader.title}
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
            <div className="hidden xl:block w-[88%] h-0.5 bg-primary/20 mb-3 relative">
              <div className="absolute left-0 top-0 size-2 rounded-full bg-primary/80 -translate-y-1/2" />
              <div className="absolute right-0 top-0 size-2 rounded-full bg-primary/80 -translate-y-1/2" />
              <div className="absolute left-1/2 top-0 size-2.5 rounded-full bg-primary -translate-x-1/2 -translate-y-1/2" />
            </div>

            {/* Department Heads Level */}
            <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7 pt-1">
              {departments.map((dept, idx) => {
                const isSelected = selectedDeptId === dept.id;
                const colorClass = avatarColors[idx % avatarColors.length];
                const headText = dept.head || "Unassigned";

                return (
                  <div
                    key={dept.id || idx}
                    onClick={() => dept.id && onSelectDept?.(dept.id)}
                    className={`group relative rounded-xl border p-3.5 text-center transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm scale-[1.02]"
                        : "border-base-200 bg-base-100 hover:border-primary/80 hover:shadow-md"
                    }`}
                  >
                    {/* Department Head Initials Avatar */}
                    <div className="flex justify-center mb-2">
                      <div
                        className={`size-9 rounded-full flex items-center justify-center font-bold  border ${colorClass}`}
                      >
                        {getInitials(
                          headText !== "Unassigned" ? headText : dept.name,
                        )}
                      </div>
                    </div>

                    {/* Department Info */}
                    <p className="text-sm font-bold text-base-content group-hover:text-primary transition-colors truncate">
                      {dept.name || "Department"}
                    </p>
                    <p className=" text-base-content/80 truncate mt-0.5">
                      {headText}
                    </p>

                    {/* Staff Count Pill */}
                    <div className="mt-2.5">
                      <span className="inline-block rounded-full bg-primary/10 border border-primary/15 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                        {dept.count ?? 0} staff
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
