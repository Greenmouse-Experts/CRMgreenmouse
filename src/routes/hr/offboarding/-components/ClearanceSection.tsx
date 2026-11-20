import { useState } from "react";
import CustomTable, { type columnType } from "@/components/tables/CustomTable";
import type { Actions } from "@/components/tables/pop-up";
import type {
  ClearanceDepartment,
  ClearanceItem,
  ClearanceStatus,
} from "./types";
import { Clock, Plus, Search } from "lucide-react";
import { toast } from "sonner";

interface ClearanceSectionProps {
  items: ClearanceItem[];
  employeeName: string;
  onUpdateStatus: (id: string, status: ClearanceStatus) => void;
  onOpenAddItemModal: () => void;
}

export default function ClearanceSection({
  items,
  employeeName,
  onUpdateStatus,
  onOpenAddItemModal,
}: ClearanceSectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState<string>("All");

  const filteredItems = items.filter((item) => {
    if (selectedDept !== "All" && item.department !== selectedDept)
      return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        item.item.toLowerCase().includes(q) ||
        item.owner.toLowerCase().includes(q) ||
        item.department.toLowerCase().includes(q) ||
        (item.notes && item.notes.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const completedCount = items.filter((i) => i.status === "Completed").length;

  const getStatusBadge = (status: ClearanceStatus) => {
    switch (status) {
      case "Completed":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5  font-semibold text-emerald-700 border border-emerald-200">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Completed
          </span>
        );
      case "In Progress":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5  font-semibold text-blue-700 border border-blue-200">
            <span className="size-1.5 rounded-full bg-blue-500 animate-pulse" />
            In Progress
          </span>
        );
      case "Scheduled":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-2.5 py-0.5  font-semibold text-purple-700 border border-purple-200">
            <Clock className="size-3" />
            Scheduled
          </span>
        );
      case "Pending":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5  font-semibold text-amber-700 border border-amber-200">
            <span className="size-1.5 rounded-full bg-amber-500" />
            Pending
          </span>
        );
    }
  };

  const getDepartmentBadge = (dept: ClearanceDepartment) => {
    switch (dept) {
      case "IT":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Finance":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "HR":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Manager":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const columns: columnType<ClearanceItem>[] = [
    {
      key: "department",
      label: "Department",
      render: (dept: ClearanceDepartment) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${getDepartmentBadge(
            dept,
          )}`}
        >
          {dept}
        </span>
      ),
    },
    {
      key: "item",
      label: "Item / Task",
      render: (itemText: string, row: ClearanceItem) => (
        <div className="space-y-0.5">
          <div className="font-semibold  text-base-content">{itemText}</div>
          {row.notes && (
            <div className="text-[11px] text-base-content/80 max-w-sm line-clamp-1">
              {row.notes}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "owner",
      label: "Owner / Assignee",
      render: (owner: string) => (
        <span className=" font-medium text-base-content/80">{owner}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (status: ClearanceStatus) => getStatusBadge(status),
    },
    {
      key: "dueDate",
      label: "Due Date",
      render: (date?: string) => (
        <span className=" text-base-content/80">
          {date
            ? new Date(date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
            : "—"}
        </span>
      ),
    },
  ];

  const actions: Actions<ClearanceItem>[] = [
    {
      key: "complete",
      label: "Mark Completed",
      action: (item) => {
        onUpdateStatus(item.id, "Completed");
        toast.success(`Marked "${item.item}" as completed`);
      },
    },
    {
      key: "in_progress",
      label: "Mark In Progress",
      action: (item) => {
        onUpdateStatus(item.id, "In Progress");
        toast.info(`Marked "${item.item}" as in progress`);
      },
    },
    {
      key: "pending",
      label: "Set as Pending",
      action: (item) => {
        onUpdateStatus(item.id, "Pending");
        toast.info(`Reset "${item.item}" to pending`);
      },
    },
  ];

  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm p-4 sm:p-6 space-y-4">
      {/* Header with Title and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-base-content">
              Clearance Checklist
            </h2>
            <span className="badge badge-sm badge-ghost  font-semibold">
              {completedCount} of {items.length} cleared
            </span>
          </div>
          <p className=" text-base-content/80 mt-0.5">
            Inter-departmental sign-offs required for {employeeName} before
            final settlement.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenAddItemModal}
          className="btn btn-sm bg-primary text-white hover:bg-primary/90 rounded-xl px-3.5 gap-1.5 self-start sm:self-auto shadow-sm shadow-primary/20"
        >
          <Plus className="size-3.5" />
          <span>Add task</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Department Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          {["All", "IT", "Finance", "HR", "Manager"].map((dept) => (
            <button
              key={dept}
              type="button"
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1  font-semibold rounded-lg transition-all ${
                selectedDept === dept
                  ? "bg-primary text-white shadow-2xs"
                  : "text-base-content/80 hover:bg-base-200"
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-60">
          <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/80" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search task or owner..."
            className="input input-sm input-bordered w-full pl-9  rounded-xl bg-base-200/80"
          />
        </div>
      </div>

      {/* CustomTable for Clearance Items */}
      <div className="overflow-hidden rounded-xl border border-base-200">
        <CustomTable
          ring={false}
          data={filteredItems}
          columns={columns}
          actions={actions}
        />
      </div>
    </div>
  );
}
