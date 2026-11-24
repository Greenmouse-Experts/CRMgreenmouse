import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/Headers/PageHeader";
import LeaveStats from "./-components/LeaveStats";
import LeaveRequestsTable from "./-components/LeaveRequestsTable";
import LeaveTypesSection from "./-components/LeaveTypesSection";
import NewLeaveRequestModal from "./-components/NewLeaveRequestModal";
import LeaveTypeModal from "./-components/LeaveTypeModal";
import type {
  LeaveRequest,
  LeaveType,
  LeaveTypeSummary,
} from "./-components/types";
import {
  useCreateLeaveRequest,
  useDecideLeaveRequest,
  useLeaveRequests,
} from "@/api/leaveApi";
import { extract_message } from "@/helpers/errors";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/hr/leave/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [selectedLeaveType, setSelectedLeaveType] =
    useState<LeaveType>("Annual");
  const [isLeaveTypeModalOpen, setIsLeaveTypeModalOpen] = useState(false);
  const [editingLeaveType, setEditingLeaveType] =
    useState<LeaveTypeSummary | null>(null);

  const requestsQuery = useLeaveRequests();
  const createLeaveRequest = useCreateLeaveRequest();
  const decideLeaveRequest = useDecideLeaveRequest();

  const requests = requestsQuery.data ?? [];

  const handleCreateRequest = async (newRequest: LeaveRequest) => {
    await createLeaveRequest.mutateAsync({
      leaveTypeId: newRequest.leaveTypeId ?? newRequest.type,
      startDate: newRequest.startDate ?? newRequest.from,
      endDate: newRequest.endDate ?? newRequest.to,
      isHalfDay: newRequest.half !== "No",
      halfDayPeriod:
        newRequest.half === "Second half"
          ? "PM"
          : newRequest.half === "First half"
            ? "AM"
            : undefined,
      coveringEmployeeId: newRequest.coverId,
      reason: newRequest.reason ?? "",
      contactPhone: newRequest.phone,
      contactAddress: newRequest.address,
    });
  };

  const handleApprove = async (id: string) => {
    try {
      await decideLeaveRequest.mutateAsync({ id, decision: "approve" });
      toast.success(`Leave ${id} approved`);
    } catch (error) {
      toast.error(extract_message(error));
    }
  };

  const handleReject = async (id: string) => {
    try {
      await decideLeaveRequest.mutateAsync({ id, decision: "reject" });
      toast.error(`Leave ${id} rejected`);
    } catch (error) {
      toast.error(extract_message(error));
    }
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
      <LeaveTypesSection
        onSelectType={handleSelectTypeFromCards}
        onAddType={() => {
          setEditingLeaveType(null);
          setIsLeaveTypeModalOpen(true);
        }}
        onEditType={(leaveType) => {
          setEditingLeaveType(leaveType);
          setIsLeaveTypeModalOpen(true);
        }}
      />

      {/* New Leave Request Modal */}
      <NewLeaveRequestModal
        isOpen={isNewRequestOpen}
        onClose={() => setIsNewRequestOpen(false)}
        onSubmitRequest={handleCreateRequest}
        defaultType={selectedLeaveType}
      />

      {/* Create / Configure Leave Type Modal */}
      <LeaveTypeModal
        isOpen={isLeaveTypeModalOpen}
        onClose={() => {
          setIsLeaveTypeModalOpen(false);
          setEditingLeaveType(null);
        }}
        initialType={editingLeaveType}
      />
    </div>
  );
}
