import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/Headers/PageHeader";
import LeaveStats from "./-components/LeaveStats";
import LeaveRequestsTable from "./-components/LeaveRequestsTable";
import LeaveTypesSection from "./-components/LeaveTypesSection";
import NewLeaveRequestModal from "./-components/NewLeaveRequestModal";
import { INITIAL_LEAVE_REQUESTS } from "./-components/leaveData";
import type { LeaveRequest, LeaveType } from "./-components/types";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/hr/leave/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [requests, setRequests] = useState<LeaveRequest[]>(
    INITIAL_LEAVE_REQUESTS,
  );
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [selectedLeaveType, setSelectedLeaveType] =
    useState<LeaveType>("Annual");

  const handleCreateRequest = (newRequest: LeaveRequest) => {
    setRequests((prev) => [newRequest, ...prev]);
  };

  const handleApprove = (id: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "Approved" as const } : r,
      ),
    );
    toast.success(`Leave ${id} approved`);
  };

  const handleReject = (id: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "Rejected" as const } : r,
      ),
    );
    toast.error(`Leave ${id} rejected`);
  };

  const handleSelectTypeFromCards = (type: LeaveType) => {
    setSelectedLeaveType(type);
    setIsNewRequestOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <PageHeader
        title="Leave Management"
        description="Draft → Submitted → Manager → HR → Approved. Approved leave updates attendance and calendars."
      >
        <button
          type="button"
          onClick={() => {
            setSelectedLeaveType("Annual");
            setIsNewRequestOpen(true);
          }}
          className="btn btn-sm bg-primary text-white hover:bg-primary/90 border-0 rounded-xl px-4 font-medium gap-1.5 shadow-sm shadow-primary/20"
        >
          <Plus className="size-4" />
          <span>New request</span>
        </button>
      </PageHeader>

      {/* Top 4 Balance Metrics */}
      <LeaveStats requests={requests} />

      {/* Leave Requests Table */}
      <LeaveRequestsTable
        requests={requests}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      {/* Leave Types & Policy Reference */}
      <LeaveTypesSection onSelectType={handleSelectTypeFromCards} />

      {/* New Leave Request Modal */}
      <NewLeaveRequestModal
        isOpen={isNewRequestOpen}
        onClose={() => setIsNewRequestOpen(false)}
        onSubmitRequest={handleCreateRequest}
        defaultType={selectedLeaveType}
      />
    </div>
  );
}
