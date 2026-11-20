import { Info, Settings2 } from "lucide-react";
import { PAYROLL_POLICIES } from "./payrollData";
import { toast } from "sonner";

export default function PayrollConfigSection() {
  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm p-4 sm:p-6 space-y-4">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-base-content">
            Deduction & earning rules
          </h2>
          <span className="badge badge-sm badge-ghost  font-semibold">
            {PAYROLL_POLICIES.length} rules
          </span>
        </div>
        <p className=" text-base-content/80 mt-0.5">
          Statutory and company rules applied automatically during calculation.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {PAYROLL_POLICIES.map((policy) => (
          <button
            key={policy.name}
            type="button"
            onClick={() =>
              toast.info(`${policy.name} · ${policy.rate}`, {
                description: policy.description,
              })
            }
            className="flex items-start justify-between gap-3 p-3 rounded-xl border border-base-200 bg-base-200/30 hover:bg-base-200/80 hover:border-base-300 transition-all text-left"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className=" font-bold text-base-content">
                  {policy.name}
                </span>
                <span
                  className={`rounded-full border px-1.5 py-0.5 text-[10px] font-semibold ${policy.color}`}
                >
                  {policy.basis}
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-base-content/80">
                {policy.description}
              </p>
            </div>
            <span className="shrink-0 text-[11px] font-semibold text-primary">
              {policy.rate}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-2.5 rounded-xl border border-base-200 bg-base-200/30 p-3">
        <div className="flex items-center gap-2  font-bold text-base-content">
          <Settings2 className="size-4 text-base-content/80" />
          <span>Pay schedule</span>
        </div>
        <dl className="grid grid-cols-2 gap-2 text-[11px] text-base-content/80">
          <div>
            <dt className="text-base-content/80">Frequency</dt>
            <dd className="font-semibold text-base-content">Monthly</dd>
          </div>
          <div>
            <dt className="text-base-content/80">Cut-off</dt>
            <dd className="font-semibold text-base-content">24th</dd>
          </div>
          <div>
            <dt className="text-base-content/80">Pay date</dt>
            <dd className="font-semibold text-base-content">28th</dd>
          </div>
          <div>
            <dt className="text-base-content/80">Approver</dt>
            <dd className="font-semibold text-base-content">
              Finance director
            </dd>
          </div>
        </dl>
      </div>

      <div className="flex items-center gap-2 p-3 rounded-xl bg-info/5 border border-info/20  text-base-content/80">
        <Info className="size-4 text-info shrink-0" />
        <span>
          Statutory remittances (PAYE, pension, NHF) are due within 7 days of
          payout and are exported with the bank schedule.
        </span>
      </div>
    </div>
  );
}
