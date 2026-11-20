import { useState } from "react";
import type { ChecklistItem, DepartmentTag, OnboardingHire } from "./types";
import { Check } from "lucide-react";

interface OnboardingChecklistProps {
  hire: OnboardingHire;
  checklist: ChecklistItem[];
  onToggleItem: (itemId: string) => void;
}

const DEPARTMENTS: DepartmentTag[] = ["HR", "IT", "Manager", "Payroll"];

export default function OnboardingChecklist({
  hire,
  checklist,
  onToggleItem,
}: OnboardingChecklistProps) {
  const [filterDept, setFilterDept] = useState<string>("All");

  const completedCount = checklist.filter((i) => i.completed).length;
  const totalCount = checklist.length;

  const filteredItems = checklist.filter((item) => {
    if (filterDept !== "All" && item.dept !== filterDept) return false;
    return true;
  });

  const getDeptBadgeClass = (dept: DepartmentTag) => {
    switch (dept) {
      case "HR":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "IT":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Manager":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "Payroll":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      default:
        return "bg-base-200 text-base-content/70 border-base-300";
    }
  };

  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-base-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-base-content">
              Checklist — {hire.name}
            </h2>
            <span className="badge badge-sm badge-ghost  font-semibold">
              {completedCount} of {totalCount} completed
            </span>
          </div>
          <p className=" text-base-content/80 mt-0.5">
            Onboarding tasks assigned to this employee
          </p>
        </div>

        <select
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          className="select select-xs bg-base-200/80 border-base-300 rounded-lg "
        >
          <option value="All">All Departments</option>
          {DEPARTMENTS.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>

      <ul className="divide-y divide-base-200">
        {filteredItems.length === 0 ? (
          <li className="py-6 text-center  text-base-content/40 italic">
            No onboarding tasks available for this employee.
          </li>
        ) : (
          filteredItems.map((item) => (
            <li
              key={item.id}
              onClick={() => onToggleItem(item.id)}
              className="group flex items-center gap-3.5 py-3 hover:bg-base-200/30 px-2 rounded-xl transition-colors cursor-pointer"
            >
              <button
                type="button"
                className={`size-5 rounded-full flex items-center justify-center border transition-all shrink-0 ${
                  item.completed
                    ? "bg-emerald-500 border-emerald-500 text-white shadow-xs"
                    : "border-base-300 bg-base-100 hover:border-primary"
                }`}
              >
                {item.completed && <Check className="size-3 stroke-[3]" />}
              </button>

              <span
                className={`flex-1  sm:text-sm transition-colors ${
                  item.completed
                    ? "text-base-content/80 line-through"
                    : "text-base-content font-medium"
                }`}
              >
                {item.text}
              </span>

              <span
                className={`rounded-md border px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase shrink-0 ${getDeptBadgeClass(
                  item.dept,
                )}`}
              >
                {item.dept}
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
