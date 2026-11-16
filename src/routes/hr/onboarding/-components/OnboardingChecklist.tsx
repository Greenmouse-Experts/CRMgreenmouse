import { useState } from "react";
import type { ChecklistItem, DepartmentTag, OnboardingHire } from "./types";
import { Check, Plus, Trash2 } from "lucide-react";

interface OnboardingChecklistProps {
  hire: OnboardingHire;
  checklist: ChecklistItem[];
  onToggleItem: (itemId: string) => void;
  onAddItem: (item: ChecklistItem) => void;
  onDeleteItem?: (itemId: string) => void;
}

export default function OnboardingChecklist({
  hire,
  checklist,
  onToggleItem,
  onAddItem,
  onDeleteItem,
}: OnboardingChecklistProps) {
  const [filterDept, setFilterDept] = useState<string>("All");
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskDept, setNewTaskDept] = useState<DepartmentTag>("HR");

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

  const handleAddNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    const newItem: ChecklistItem = {
      id: `CHK-${Date.now()}`,
      dept: newTaskDept,
      text: newTaskText.trim(),
      completed: false,
    };

    onAddItem(newItem);
    setNewTaskText("");
    setIsAdding(false);
  };

  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm p-4 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-base-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-base-content">
              Checklist — {hire.name}
            </h2>
            <span className="badge badge-sm badge-ghost text-xs font-semibold">
              {completedCount} of {totalCount} completed
            </span>
          </div>
          <p className="text-xs text-base-content/60 mt-0.5">
            Essential onboarding tasks across HR, IT hardware, orientation, and payroll
          </p>
        </div>

        {/* Filters and Add button */}
        <div className="flex items-center gap-2">
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="select select-xs bg-base-200/60 border-base-300 rounded-lg text-xs"
          >
            <option value="All">All Departments</option>
            <option value="HR">HR</option>
            <option value="IT">IT</option>
            <option value="Manager">Manager</option>
            <option value="Payroll">Payroll</option>
          </select>

          <button
            type="button"
            onClick={() => setIsAdding((prev) => !prev)}
            className="btn btn-xs bg-primary text-white hover:bg-primary/90 border-0 rounded-lg px-2.5 font-medium gap-1"
          >
            <Plus className="size-3" />
            <span>Add task</span>
          </button>
        </div>
      </div>

      {/* Add Task Quick Form */}
      {isAdding && (
        <form
          onSubmit={handleAddNewTask}
          className="flex flex-col sm:flex-row items-center gap-2 p-3 bg-base-200/50 rounded-xl border border-base-300/80 animate-in fade-in duration-200"
        >
          <select
            value={newTaskDept}
            onChange={(e) => setNewTaskDept(e.target.value as DepartmentTag)}
            className="select select-xs bg-base-100 border-base-300 rounded-lg text-xs"
          >
            <option value="HR">HR</option>
            <option value="IT">IT</option>
            <option value="Manager">Manager</option>
            <option value="Payroll">Payroll</option>
          </select>
          <input
            type="text"
            placeholder="Describe new onboarding task..."
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            className="input input-xs flex-1 bg-base-100 border-base-300 rounded-lg text-xs"
            autoFocus
          />
          <div className="flex items-center gap-1.5 self-end sm:self-center">
            <button
              type="submit"
              className="btn btn-xs bg-primary text-white hover:bg-primary/90 rounded-lg"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="btn btn-xs btn-ghost rounded-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Checklist items */}
      <ul className="divide-y divide-base-200">
        {filteredItems.length === 0 ? (
          <li className="py-6 text-center text-xs text-base-content/40 italic">
            No checklist tasks for this category.
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
                className={`flex-1 text-xs sm:text-sm transition-colors ${
                  item.completed
                    ? "text-base-content/50 line-through"
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

              {onDeleteItem && (
                <button
                  type="button"
                  title="Remove task"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteItem(item.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-base-content/30 hover:text-error transition-opacity p-1"
                >
                  <Trash2 className="size-3.5" />
                </button>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
