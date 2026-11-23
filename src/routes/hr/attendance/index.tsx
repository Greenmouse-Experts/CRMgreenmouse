import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/Headers/PageHeader";
import PageLoader from "@/components/layout/PageLoader";
import AttendanceStats from "./-components/AttendanceStats";
import TodayAttendanceLog from "./-components/TodayAttendanceLog";
import CorrectionRequests from "./-components/CorrectionRequests";
import ClockInModal from "./-components/ClockInModal";
import RequestCorrectionModal from "./-components/RequestCorrectionModal";
import { correctionLabel } from "./-components/attendanceData";
import type {
  AttendanceRecord,
  AttendanceStatus,
  CorrectionRequest,
  CorrectionStatus,
} from "./-components/types";
import {
  useAttendanceDashboard,
  useAttendanceRecords,
  useClockIn,
  useCorrectionRequests,
  useCreateCorrection,
  useDecideCorrection,
  type AttendanceRecordApi,
  type CorrectionApi,
  type CreateCorrectionPayload,
} from "@/api/attendanceApi";
import { extract_message } from "@/helpers/auth";
import { Clock, LogIn } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/hr/attendance/")({
  component: RouteComponent,
});

const UNKNOWN = "—";

const STATUS_MAP: Record<string, AttendanceStatus> = {
  present: "Present",
  late: "Late",
  absent: "Absent",
  half_day: "Half-day",
  halfday: "Half-day",
};

const CORRECTION_STATUS_MAP: Record<string, CorrectionStatus> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

const formatTime = (value?: string) => {
  if (!value) return UNKNOWN;
  if (!value.includes("T")) return value;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? UNKNOWN
    : date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
};

const formatDate = (value?: string) => {
  if (!value) return UNKNOWN;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? UNKNOWN
    : date.toLocaleDateString("en-GB", { month: "short", day: "numeric" });
};

const staffName = (raw: {
  staff?: { firstName?: string; lastName?: string; name?: string };
  staffName?: string;
}) =>
  `${raw.staff?.firstName ?? ""} ${raw.staff?.lastName ?? ""}`.trim() ||
  raw.staff?.name ||
  raw.staffName ||
  UNKNOWN;

const toUiRecord = (raw: AttendanceRecordApi): AttendanceRecord => {
  const statusKey = raw.status?.toLowerCase();
  return {
    id: raw.id,
    name: staffName(raw),
    shift:
      typeof raw.shift === "object"
        ? raw.shift?.name ?? UNKNOWN
        : raw.shift ?? UNKNOWN,
    timeIn: formatTime(raw.clockInAt),
    timeOut: formatTime(raw.clockOutAt),
    status:
      (statusKey && STATUS_MAP[statusKey]) ||
      (raw.clockInAt ? "Present" : "Absent"),
    workMode: raw.workMode as AttendanceRecord["workMode"],
    location: raw.location,
    date: raw.date,
  };
};

const toUiCorrection = (raw: CorrectionApi): CorrectionRequest => {
  const date = formatDate(raw.date);
  const label = correctionLabel(raw.correctionType);
  const statusKey = raw.status?.toLowerCase();

  return {
    id: raw.id,
    employeeName: staffName(raw),
    date,
    type: label,
    detail: `${date} · ${label.toLowerCase()}`,
    status:
      (statusKey && CORRECTION_STATUS_MAP[statusKey]) || "Pending",
    correctIn: formatTime(raw.correctedClockInAt),
    correctOut: formatTime(raw.correctedClockOutAt),
    reason: raw.reason,
  };
};

function RouteComponent() {
  const dashboardQuery = useAttendanceDashboard();
  const recordsQuery = useAttendanceRecords();
  const correctionsQuery = useCorrectionRequests();

  const clockInMutation = useClockIn();
  const createCorrectionMutation = useCreateCorrection();
  const decideCorrectionMutation = useDecideCorrection();

  const [isClockInOpen, setIsClockInOpen] = useState(false);
  const [isCorrectionOpen, setIsCorrectionOpen] = useState(false);

  const logs = useMemo(
    () => (recordsQuery.data ?? []).map(toUiRecord),
    [recordsQuery.data],
  );
  const corrections = useMemo(
    () => (correctionsQuery.data ?? []).map(toUiCorrection),
    [correctionsQuery.data],
  );

  const todayFormatted = `Today · ${new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date())}`;

  const handleClockIn = (staffId: string) => {
    const promise = clockInMutation
      .mutateAsync(staffId)
      .then(() => setIsClockInOpen(false));
    toast.promise(promise, {
      loading: "Clocking in...",
      success: "Clocked in successfully",
      error: (error) => extract_message(error as never),
    });
    return promise.catch(() => undefined);
  };

  const handleCreateCorrection = (payload: CreateCorrectionPayload) => {
    const promise = createCorrectionMutation
      .mutateAsync(payload)
      .then(() => setIsCorrectionOpen(false));
    toast.promise(promise, {
      loading: "Submitting correction...",
      success: "Correction request submitted",
      error: (error) => extract_message(error as never),
    });
    return promise.catch(() => undefined);
  };

  const handleDecide = (id: string, decision: "approve" | "reject") => {
    toast.promise(decideCorrectionMutation.mutateAsync({ id, decision }), {
      loading: "Updating correction request...",
      success: decision === "approve" ? "Correction approved" : "Correction rejected",
      error: (error) => extract_message(error as never),
    });
  };

  return (
    <div className="space-y-6 pb-12">
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

      <PageLoader
        query={dashboardQuery}
        loadingText="Loading attendance overview..."
      >
        {(dashboard) => <AttendanceStats stats={dashboard} />}
      </PageLoader>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8">
          <PageLoader
            query={recordsQuery}
            emptyState={{
              title: "No attendance records",
              description: "Clock in to start tracking attendance.",
            }}
          >
            <TodayAttendanceLog logs={logs} />
          </PageLoader>
        </div>
        <div className="lg:col-span-4">
          <PageLoader
            query={correctionsQuery}
            emptyState={{
              title: "No correction requests",
              description: "Correction requests will appear here.",
            }}
          >
            <CorrectionRequests
              requests={corrections}
              onApprove={(id) => handleDecide(id, "approve")}
              onReject={(id) => handleDecide(id, "reject")}
            />
          </PageLoader>
        </div>
      </div>

      <ClockInModal
        isOpen={isClockInOpen}
        onClose={() => setIsClockInOpen(false)}
        onClockIn={handleClockIn}
      />

      <RequestCorrectionModal
        isOpen={isCorrectionOpen}
        onClose={() => setIsCorrectionOpen(false)}
        onSubmitCorrection={handleCreateCorrection}
      />
    </div>
  );
}
