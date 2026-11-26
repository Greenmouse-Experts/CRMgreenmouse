import { useLeaveTypes } from "@/api/leaveApi";
import type { LeaveType, LeaveTypeSummary } from "./types";
import { Info, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";

interface LeaveTypesSectionProps {
  onSelectType?: (type: LeaveType) => void;
  onAddType?: () => void;
  onEditType?: (leaveType: LeaveTypeSummary) => void;
}

export default function LeaveTypesSection({
  onSelectType,
  onAddType,
  onEditType,
}: LeaveTypesSectionProps) {
  const { data: leaveTypes = [] } = useLeaveTypes();
  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-base-content">Leave types</h2>
            <span className="badge badge-sm badge-ghost  font-semibold">
              {leaveTypes.length} policies
            </span>
          </div>
          <p className=" text-base-content/80 mt-0.5">
            Company leave policies, standard allowances, and document
            requirement rules.
          </p>
        </div>

        {onAddType && (
          <button
            type="button"
            onClick={onAddType}
            className="btn btn-sm btn-outline border-primary/30 text-primary hover:bg-primary hover:text-white hover:border-primary rounded-xl px-3.5 gap-1.5 self-start sm:self-auto"
          >
            <Plus className="size-4" />
            <span>New leave type</span>
          </button>
        )}
      </div>

      {leaveTypes.length === 0 ? (
        <p className="text-[11px] italic text-base-content/80 py-6 text-center">
          No leave types configured yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {leaveTypes.map((item, index) => (
            <div
              key={item.code ?? item.type ?? index}
              onClick={() => {
                onSelectType?.(item.type);
                toast.info(`${item.name ?? item.type}: ${item.entitlement}`, {
                  description: item.description,
                });
              }}
              className="group p-3.5 rounded-xl border border-base-200 bg-base-200/30 hover:bg-base-200/80 hover:border-base-300 transition-all cursor-pointer space-y-1.5"
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-sm font-bold text-base-content truncate">
                  {item.name ?? item.type}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[11px] font-semibold text-primary">
                    {item.entitlement}
                  </span>
                  {onEditType && (
                    <button
                      type="button"
                      title="Configure leave type"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditType(item);
                      }}
                      className="btn btn-ghost btn-sm btn-square opacity-70 group-hover:opacity-100 hover:text-primary"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {(item.isPaid !== undefined || item.isActive === false) && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {item.isPaid !== undefined && (
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md border ${
                        item.isPaid
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-slate-50 text-slate-600 border-slate-200"
                      }`}
                    >
                      {item.isPaid ? "Paid" : "Unpaid"}
                    </span>
                  )}
                  {item.isActive === false && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                      Inactive
                    </span>
                  )}
                </div>
              )}

              {item.description && (
                <p className="text-[11px] text-base-content/80 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 p-3 rounded-xl bg-info/5 border border-info/20  text-base-content/80">
        <Info className="size-4 text-info shrink-0" />
        <span>
          Supporting documents (medical report, admission slip, or certificate)
          are required for sick leave exceeding 2 days, maternity leave, and
          study leave.
        </span>
      </div>
    </div>
  );
}
