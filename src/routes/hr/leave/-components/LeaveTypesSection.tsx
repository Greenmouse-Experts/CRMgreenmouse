import { LEAVE_TYPES } from "./leaveData";
import type { LeaveType } from "./types";
import { Info } from "lucide-react";
import { toast } from "sonner";

interface LeaveTypesSectionProps {
  onSelectType?: (type: LeaveType) => void;
}

export default function LeaveTypesSection({
  onSelectType,
}: LeaveTypesSectionProps) {
  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm p-4 sm:p-6 space-y-4">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-base-content">Leave types</h2>
          <span className="badge badge-sm badge-ghost  font-semibold">
            {LEAVE_TYPES.length} policies
          </span>
        </div>
        <p className=" text-base-content/80 mt-0.5">
          Company leave policies, standard allowances, and document requirement
          rules.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {LEAVE_TYPES.map((item) => (
          <div
            key={item.type}
            onClick={() => {
              onSelectType?.(item.type);
              toast.info(`${item.type} Leave: ${item.entitlement}`, {
                description: item.description,
              });
            }}
            className="p-3.5 rounded-xl border border-base-200 bg-base-200/30 hover:bg-base-200/70 hover:border-base-300 transition-all cursor-pointer space-y-1.5"
          >
            <div className="flex items-center justify-between gap-1">
              <span className="text-sm font-bold text-base-content">
                {item.type}
              </span>
              <span className="text-[11px] font-semibold text-primary">
                {item.entitlement}
              </span>
            </div>

            <p className="text-[11px] text-base-content/70 line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 p-3 rounded-xl bg-info/5 border border-info/20  text-base-content/70">
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
