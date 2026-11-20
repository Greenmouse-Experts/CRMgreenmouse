import { useMemo, useState } from "react";
import CustomTable, { type columnType } from "@/components/tables/CustomTable";
import type { Actions } from "@/components/tables/pop-up";
import { Search } from "lucide-react";
import type { LeaveRequest, LeaveStatus } from "./types";
import { getLeaveStatusBadge } from "./StatusBadges";
import { formatDate } from "./selfServiceData";

interface LeaveRequestsTableProps {
  requests: LeaveRequest[];
  onOpenDetail: (request: LeaveRequest) => void;
  onCancelRequest: (request: LeaveRequest) => void;
}

const TABS: { key: LeaveStatus | "All"; label: string }[] = [
  { key: "All", label: "All" },
  { key: "Pending", label: "Pending" },
  { key: "Submitted", label: "Submitted" },
  { key: "Approved", label: "Approved" },
  { key: "Rejected", label: "Rejected" },
];

export default function LeaveRequestsTable({
  requests,
  onOpenDetail,
  onCancelRequest,
}: LeaveRequestsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<(typeof TABS)[number]["key"]>("All");

  const filteredRequests = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return requests.filter((request) => {
      if (statusFilter !== "All" && request.status !== statusFilter) {
        return false;
      }
      if (!term) return true;
      return (
        request.id.toLowerCase().includes(term) ||
        request.type.toLowerCase().includes(term) ||
        request.reason.toLowerCase().includes(term)
      );
    });
  }, [requests, searchTerm, statusFilter]);

  const columns: columnType[] = [
    { key: "id", label: "Request ID" },
    { key: "type", label: "Leave Type" },
    { key: "startDate", label: "Start", render: (value) => formatDate(value) },
    { key: "endDate", label: "End", render: (value) => formatDate(value) },
    { key: "days", label: "Days", render: (value) => value },
    {
      key: "status",
      label: "Status",
      render: (value) => getLeaveStatusBadge(value as LeaveStatus),
    },
  ];

  const actions: Actions[] = [
    {
      key: "view",
      label: "View Details",
      action: (item) => onOpenDetail(item),
    },
    {
      key: "cancel",
      label: "Cancel Request",
      render: () => <span className="text-error">Cancel Request</span>,
      disable_event: (item) => item.status !== "Pending",
      action: (item) => onCancelRequest(item),
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
            className={`px-3 py-1  font-semibold rounded-lg transition-all ${
              statusFilter === tab.key
                ? "bg-primary text-white shadow-2xs"
                : "text-base-content/80 hover:bg-base-200"
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
          placeholder="Search by ID, type, or reason..."
          className="input input-sm input-bordered w-full pl-9  rounded-xl bg-base-200/80"
        />
      </div>

      <CustomTable
        data={filteredRequests}
        columns={columns}
        actions={actions}
      />
    </div>
  );
}
