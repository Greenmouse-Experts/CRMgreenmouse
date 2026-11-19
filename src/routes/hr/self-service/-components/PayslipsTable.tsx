import { useMemo, useState } from "react";
import CustomTable, { type columnType } from "@/components/tables/CustomTable";
import type { Actions } from "@/components/tables/pop-up";
import { Search } from "lucide-react";
import { formatCurrency } from "./selfServiceData";
import { getPayslipStatusBadge } from "./StatusBadges";
import type { Payslip, PayslipStatus } from "./types";

interface PayslipsTableProps {
  payslips: Payslip[];
  onOpenDetail: (payslip: Payslip) => void;
}

const TABS: { key: PayslipStatus | "All"; label: string }[] = [
  { key: "All", label: "All" },
  { key: "Ready", label: "Ready" },
  { key: "Paid", label: "Paid" },
  { key: "On hold", label: "On hold" },
];

export default function PayslipsTable({
  payslips,
  onOpenDetail,
}: PayslipsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    (typeof TABS)[number]["key"]
  >("All");

  const filteredPayslips = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return payslips.filter((payslip) => {
      if (statusFilter !== "All" && payslip.status !== statusFilter) {
        return false;
      }
      if (!term) return true;
      return (
        payslip.id.toLowerCase().includes(term) ||
        payslip.month.toLowerCase().includes(term)
      );
    });
  }, [payslips, searchTerm, statusFilter]);

  const columns: columnType[] = [
    { key: "id", label: "Payslip ID" },
    { key: "month", label: "Month" },
    { key: "gross", label: "Gross", render: (value) => formatCurrency(value) },
    {
      key: "deductions",
      label: "Deductions",
      render: (value) => formatCurrency(value),
    },
    {
      key: "netPay",
      label: "Net Pay",
      render: (value) => formatCurrency(value),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => getPayslipStatusBadge(value as PayslipStatus),
    },
  ];

  const actions: Actions[] = [
    {
      key: "view",
      label: "View Payslip",
      action: (item) => onOpenDetail(item),
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-1.5 border-b border-base-200 pb-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setStatusFilter(tab.key)}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              statusFilter === tab.key
                ? "bg-primary text-white shadow-2xs"
                : "text-base-content/60 hover:bg-base-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="relative w-full sm:w-56">
        <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search payslip ID, month..."
          className="input input-sm input-bordered w-full pl-9 text-xs rounded-xl bg-base-200/50"
        />
      </div>

      <CustomTable data={filteredPayslips} columns={columns} actions={actions} />
    </div>
  );
}
