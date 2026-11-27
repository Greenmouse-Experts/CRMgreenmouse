import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/Headers/PageHeader";
import PageLoader from "@/components/layout/PageLoader";
import PersonalLeaveStats from "./-components/PersonalLeaveStats";
import PersonalLeaveHistoryTable from "./-components/PersonalLeaveHistoryTable";
import StaffNewLeaveRequestModal from "./-components/StaffNewLeaveRequestModal";
import { useCurrentStaffIdentity } from "../-components/useCurrentStaffIdentity";
import type { LeaveRequest } from "@/routes/hr/leave/-components/types";
import {
  useCancelLeaveRequest,
  useCreateLeaveRequest,
  useMyLeaveRequests,
} from "@/api/leaveApi";
import { extract_message } from "@/helpers/errors";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/staff/leave/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const { identity } = useCurrentStaffIdentity();
  const myRequestsQuery = useMyLeaveRequests();
  const createLeaveRequest = useCreateLeaveRequest();
  const cancelLeaveRequest = useCancelLeaveRequest();

  const requests = myRequestsQuery.data ?? [];

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

  const handleCancelRequest = async (id: string) => {
    setCancellingId(id);
    try {
      await cancelLeaveRequest.mutateAsync(id);
      toast.success("Leave request cancelled");
    } catch (error) {
      toast.error(extract_message(error));
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="My Leave"
        description="View your personal leave balances, request time off, and track your leave history."
      >
        <button
          type="button"
          onClick={() => setIsNewRequestOpen(true)}
          className="btn btn-sm bg-primary text-white hover:bg-primary/90 border-0 rounded-xl px-4 font-medium gap-1.5 shadow-sm shadow-primary/20"
        >
          <Plus className="size-4" />
          <span>Request leave</span>
        </button>
      </PageHeader>

      <PersonalLeaveStats requests={requests} />

      <PageLoader
        query={myRequestsQuery}
        loadingText="Loading your leave history..."
        emptyState={{
          title: "No leave history yet",
          description:
            "You haven't submitted any leave requests yet. Click Request leave to apply.",
          actionText: "Request leave",
          onAction: () => setIsNewRequestOpen(true),
        }}
      >
        {(loadedRequests) => (
          <PersonalLeaveHistoryTable
            requests={loadedRequests}
            onCancelRequest={handleCancelRequest}
            cancellingId={cancellingId}
          />
        )}
      </PageLoader>

      <StaffNewLeaveRequestModal
        isOpen={isNewRequestOpen}
        onClose={() => setIsNewRequestOpen(false)}
        onSubmitRequest={handleCreateRequest}
        employeeName={identity.fullName}
        currentEmployeeId={identity.employeeId}
      />
    </div>
  );
}
