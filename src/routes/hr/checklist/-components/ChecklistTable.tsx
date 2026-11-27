import type { ChecklistItemRecord } from "@/api/checklistApi";
import CustomTable, { type columnType } from "@/components/tables/CustomTable";
import type { Actions } from "@/components/tables/pop-up";
import { ClipboardCheck, Eye, Pencil, Search, Trash2 } from "lucide-react";
import {
  formatChecklistDate,
  formatChecklistOwner,
  getOwnerBadgeClass,
} from "./checklistHelpers";

interface ChecklistTableProps {
  items: ChecklistItemRecord[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedOwner: string;
  onOwnerChange: (value: string) => void;
  selectedStatus: "all" | "active" | "inactive";
  onStatusChange: (value: "all" | "active" | "inactive") => void;
  ownerOptions: string[];
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  onViewItem: (item: ChecklistItemRecord) => void;
  onEditItem: (item: ChecklistItemRecord) => void;
  onToggleActive: (item: ChecklistItemRecord) => void;
  onDeleteItem: (item: ChecklistItemRecord) => void;
  togglingItemId?: string | null;
}

export default function ChecklistTable({
  items,
  searchTerm,
  onSearchChange,
  selectedOwner,
  onOwnerChange,
  selectedStatus,
  onStatusChange,
  ownerOptions,
  hasActiveFilters,
  onResetFilters,
  onViewItem,
  onEditItem,
  onToggleActive,
  onDeleteItem,
  togglingItemId = null,
}: ChecklistTableProps) {
  const columns: columnType<ChecklistItemRecord>[] = [
    {
      key: "sortOrder",
      label: "Order",
      render: (value) => (
        <span className="inline-flex min-w-7 items-center justify-center rounded-lg bg-base-200 px-2 py-0.5 text-xs font-bold text-base-content/80">
          {Number(value ?? 0)}
        </span>
      ),
    },
    {
      key: "title",
      label: "Checklist Item",
      render: (value, item) => (
        <div className="space-y-0.5 max-w-md">
          <p
            className={
              item.active
                ? "font-semibold text-base-content"
                : "font-medium text-base-content/60"
            }
          >
            {value}
          </p>
          {item.description ? (
            <p className="line-clamp-2 text-xs text-base-content/70">
              {item.description}
            </p>
          ) : (
            <p className="text-xs text-base-content/45 italic">
              No description provided
            </p>
          )}
        </div>
      ),
    },
    {
      key: "owner",
      label: "Owner",
      render: (value) => (
        <span
          className={`badge badge-sm rounded-lg border font-semibold ${getOwnerBadgeClass(
            value,
          )}`}
        >
          {formatChecklistOwner(value)}
        </span>
      ),
    },
    {
      key: "isActive",
      label: "Status",
      render: (_value, item) => {
        const isUpdating = togglingItemId === item.id;
        return (
          <button
            type="button"
            disabled={isUpdating}
            onClick={(e) => {
              e.stopPropagation();
              onToggleActive(item);
            }}
            title={
              item.active
                ? "Click to deactivate checklist item"
                : "Click to activate checklist item"
            }
            className={`badge badge-sm rounded-lg border font-semibold cursor-pointer transition-opacity hover:opacity-80 ${
              item.active
                ? "bg-success/15 text-success border-success/25"
                : "bg-base-200 text-base-content/70 border-base-300"
            }`}
          >
            {isUpdating ? (
              <span className="loading loading-spinner loading-xs" />
            ) : item.active ? (
              "Active"
            ) : (
              "Inactive"
            )}
          </button>
        );
      },
    },
    {
      key: "updatedAt",
      label: "Updated",
      render: (_value, item) => (
        <span className="text-xs text-base-content/70">
          {formatChecklistDate(item.updatedAt ?? item.createdAt)}
        </span>
      ),
    },
  ];

  const actions: Actions[] = [
    {
      key: "view",
      label: "View details",
      action: (item: ChecklistItemRecord) => onViewItem(item),
    },
    {
      key: "edit",
      label: "Edit item",
      action: (item: ChecklistItemRecord) => onEditItem(item),
    },
    {
      key: "toggle",
      label: "Toggle active",
      action: (item: ChecklistItemRecord) => onToggleActive(item),
    },
    {
      key: "delete",
      label: "Delete item",
      action: (item: ChecklistItemRecord) => onDeleteItem(item),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="card bg-base-100 border border-base-200 shadow-xs p-4 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="size-4 text-base-content/50 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search checklist items by title, description, or owner..."
              className="input input-sm input-bordered w-full pl-9 rounded-xl bg-base-200/40"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 flex-1 justify-end">
            <select
              value={selectedOwner}
              onChange={(e) => onOwnerChange(e.target.value)}
              className="select select-sm select-bordered rounded-xl bg-base-200/40"
              aria-label="Filter by owner"
            >
              <option value="all">All Owners</option>
              {ownerOptions.map((owner) => (
                <option key={owner} value={owner}>
                  {formatChecklistOwner(owner)}
                </option>
              ))}
            </select>

            <div className="join rounded-xl border border-base-300 bg-base-200/40 p-0.5">
              {(["all", "active", "inactive"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => onStatusChange(tab)}
                  className={`btn btn-xs rounded-lg border-0 capitalize ${
                    selectedStatus === tab
                      ? "bg-primary text-white shadow-xs"
                      : "btn-ghost text-base-content/75"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                className="btn btn-sm btn-ghost rounded-xl text-base-content/70"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="card bg-base-100 border border-base-200 p-12 text-center space-y-3">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-base-200 text-base-content/60">
            <ClipboardCheck className="size-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-base-content">
              No checklist items match your filters
            </h3>
            <p className="text-sm text-base-content/70">
              Try adjusting your search or filter criteria.
            </p>
          </div>
          {hasActiveFilters && (
            <div>
              <button
                type="button"
                onClick={onResetFilters}
                className="btn btn-sm btn-outline rounded-xl"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <CustomTable
            data={items}
            columns={columns}
            actions={actions}
            totalCount={items.length}
            onRowClick={onViewItem}
          />
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-base-content/65 px-1">
            <span>
              Showing {items.length} checklist{" "}
              {items.length === 1 ? "item" : "items"} ordered by sort priority.
            </span>
            <span className="inline-flex items-center gap-3">
              <span className="inline-flex items-center gap-1">
                <Eye className="size-3.5" /> Click row to view
              </span>
              <span className="inline-flex items-center gap-1">
                <Pencil className="size-3.5" /> Edit via action menu
              </span>
              <span className="inline-flex items-center gap-1">
                <Trash2 className="size-3.5" /> Delete via action menu
              </span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
