import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/Headers/PageHeader";
import AttendanceStats from "./-components/AttendanceStats";
import TodayAttendanceLog from "./-components/TodayAttendanceLog";
import CorrectionRequests from "./-components/CorrectionRequests";
import ClockInModal from "./-components/ClockInModal";
import RequestCorrectionModal from "./-components/RequestCorrectionModal";
import {
  INITIAL_ATTENDANCE_LOGS,
  INITIAL_CORRECTIONS,
} from "./-components/attendanceData";
import type { AttendanceRecord, CorrectionRequest } from "./-components/types";
import { Clock, LogIn } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/hr/attendance/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [logs, setLogs] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE_LOGS);
  const [corrections, setCorrections] =
    useState<CorrectionRequest[]>(INITIAL_CORRECTIONS);
  const [isClockInOpen, setIsClockInOpen] = useState(false);
  const [isCorrectionOpen, setIsCorrectionOpen] = useState(false);

  // Dynamic formatted date matching Lovable format e.g. "Today · Thursday, 12 Nov 2026"
  const todayFormatted = `Today · ${new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date())}`;

  const handleClockIn = (record: AttendanceRecord) => {
    setLogs((prev) => [record, ...prev]);
  };

  const handleAddCorrection = (correction: CorrectionRequest) => {
    setCorrections((prev) => [correction, ...prev]);
  };

  const handleApproveCorrection = (id: string) => {
    setCorrections((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: "Approved" as const } : c,
      ),
    );
    toast.success("Correction request approved");
  };

  const handleRejectCorrection = (id: string) => {
    setCorrections((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: "Rejected" as const } : c,
      ),
    );
    toast.error("Correction request rejected");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header with dual action buttons */}
      <PageHeader title="Attendance & Time" description={todayFormatted}>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCorrectionOpen(true)}
            className="btn btn-sm btn-outline border-base-300 hover:bg-base-200 text-base-content rounded-xl px-4 font-medium gap-1.5"
          >
            <Clock className="size-4" />
            <span>Request correction</span>
          </button>
          <button
            type="button"
            onClick={() => setIsClockInOpen(true)}
            className="btn btn-sm bg-primary text-white hover:bg-primary/90 border-0 rounded-xl px-4 font-medium gap-1.5 shadow-sm shadow-primary/20"
          >
            <LogIn className="size-4" />
            <span>Clock in</span>
          </button>
        </div>
      </PageHeader>

      {/* 4-Card Summary Metrics */}
      <AttendanceStats logs={logs} />

      {/* Main Grid: Today's Log + Correction Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8">
          <TodayAttendanceLog logs={logs} />
        </div>
        <div className="lg:col-span-4">
          <CorrectionRequests
            requests={corrections}
            onApprove={handleApproveCorrection}
            onReject={handleRejectCorrection}
          />
        </div>
      </div>

      {/* Modals */}
      <ClockInModal
        isOpen={isClockInOpen}
        onClose={() => setIsClockInOpen(false)}
        onClockIn={handleClockIn}
      />

      <RequestCorrectionModal
        isOpen={isCorrectionOpen}
        onClose={() => setIsCorrectionOpen(false)}
        onSubmitCorrection={handleAddCorrection}
      />
    </div>
  );
}
