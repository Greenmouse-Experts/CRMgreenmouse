import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/Headers/PageHeader";
import PageLoader from "@/components/layout/PageLoader";
import AttendanceStats from "./-components/AttendanceStats";
import TodayAttendanceLog from "./-components/TodayAttendanceLog";
import CorrectionRequests from "./-components/CorrectionRequests";
import RequestCorrectionModal from "./-components/RequestCorrectionModal";
import { correctionLabel } from "./-components/attendanceData";
import type {
  AttendanceRecord,
  AttendanceStatus,
  CorrectionRequest,
  CorrectionStatus,
} from "./-components/types";
import {
  useAttendanceRecords,
  useClockIn,
  useClockOut,
  useCreateCorrection,
  useMyCorrectionRequests,
  type AttendanceRecordApi,
  type CorrectionApi,
  type CreateCorrectionPayload,
} from "@/api/attendanceApi";
import { useAuth } from "@/store/authStore";
import { extract_message } from "@/helpers/errors";
import { Clock, LogIn, LogOut } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/staff/attendance/")({
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

const formatTime = (value?: string | null) => {
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
    ? value
    : date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
};

const staffName = (raw: {
  staff?: { firstName?: string; lastName?: string; name?: string };
  staffName?: string;
}) =>
  `${raw.staff?.firstName ?? ""} ${raw.staff?.lastName ?? ""}`.trim() ||
  raw.staff?.name ||
  raw.staffName ||
  UNKNOWN;

const toUiCorrection = (
  raw: CorrectionApi,
  fallbackSelfName: string,
): CorrectionRequest => {
  const item =
    raw?.correction ?? raw?.request ?? raw?.attendanceCorrection ?? raw;
  const date = formatDate(item?.date ?? raw?.date);
  const label = correctionLabel(item?.correctionType ?? raw?.correctionType);
  const statusKey = (item?.status ?? raw?.status)?.toLowerCase();
  const resolvedName =
    staffName(raw) !== UNKNOWN
      ? staffName(raw)
      : staffName(item) !== UNKNOWN
        ? staffName(item)
        : fallbackSelfName;

  return {
    id: String(item?.id ?? raw?.id ?? raw?.correctionId ?? ""),
    employeeName: resolvedName,
    date,
    type: label,
    detail: `${date} · ${label.toLowerCase()}`,
    status: (statusKey && CORRECTION_STATUS_MAP[statusKey]) || "Pending",
    correctIn: formatTime(item?.correctedClockInAt ?? raw?.correctedClockInAt),
    correctOut: formatTime(
      item?.correctedClockOutAt ?? raw?.correctedClockOutAt,
    ),
    reason: item?.reason ?? raw?.reason,
  };
};

function RouteComponent() {
  const [auth] = useAuth();
  const currentUserId = auth?.user?.id;
  const selfName = useMemo(() => {
    const full =
      `${auth?.user?.firstName ?? ""} ${auth?.user?.lastName ?? ""}`.trim();
    return full || auth?.user?.email || "Me";
  }, [auth?.user]);

  const recordsQuery = useAttendanceRecords(
    currentUserId ? { staffId: currentUserId } : undefined,
    { enabled: Boolean(currentUserId) },
  );
  const correctionsQuery = useMyCorrectionRequests({
    enabled: Boolean(currentUserId),
  });

  const clockInMutation = useClockIn();
  const clockOutMutation = useClockOut();
  const createCorrectionMutation = useCreateCorrection();

  const [isCorrectionOpen, setIsCorrectionOpen] = useState(false);

  const personalRecords = useMemo<AttendanceRecordApi[]>(() => {
    if (!currentUserId) return [];
    return (recordsQuery.data ?? []).filter(
      (r) => !r.staffId || r.staffId === currentUserId,
    );
  }, [recordsQuery.data, currentUserId]);

  const logs = useMemo<AttendanceRecord[]>(() => {
    return personalRecords.map((raw: AttendanceRecordApi) => {
      const statusKey = raw.status?.toLowerCase();
      const resolvedName =
        (staffName(raw) !== UNKNOWN ? staffName(raw) : undefined) || selfName;

      const derivedStatus: AttendanceStatus =
        (statusKey && STATUS_MAP[statusKey]) ||
        (raw.clockInAt && raw.clockOutAt
          ? "Clocked Out"
          : raw.clockInAt
            ? "Clocked In"
            : "Absent");

      return {
        id: raw.id,
        staffId: raw.staffId ?? currentUserId ?? "",
        name: resolvedName,
        date: formatDate(raw.date),
        rawDate: raw.date,
        clockInAt: formatTime(raw.clockInAt),
        clockOutAt: formatTime(raw.clockOutAt),
        status: derivedStatus,
      };
    });
  }, [personalRecords, selfName, currentUserId]);

  const todayDates = useMemo(() => {
    const now = new Date();
    const utcToday = now.toISOString().slice(0, 10);
    const localToday = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    return new Set([utcToday, localToday]);
  }, []);

  const hasOpenShiftToday = useMemo(
    () =>
      Boolean(
        currentUserId &&
        personalRecords.some(
          (r) =>
            (!r.date || todayDates.has(String(r.date).slice(0, 10))) &&
            Boolean(r.clockInAt) &&
            !r.clockOutAt,
        ),
      ),
    [personalRecords, currentUserId, todayDates],
  );

  const corrections = useMemo(
    () =>
      (correctionsQuery.data ?? []).map((raw) => toUiCorrection(raw, selfName)),
    [correctionsQuery.data, selfName],
  );

  const todayFormatted = `Today · ${new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date())}`;

  const handleClockIn = async () => {
    if (!currentUserId) {
      toast.error("Unable to identify the logged-in user.");
      return;
    }
    try {
      await clockInMutation.mutateAsync(currentUserId);
      toast.success("Clocked in successfully");
    } catch (error) {
      toast.error(extract_message(error as any));
    }
  };

  const handleClockOut = async () => {
    if (!currentUserId) {
      toast.error("Unable to identify the logged-in user.");
      return;
    }
    try {
      await clockOutMutation.mutateAsync(currentUserId);
      toast.success("Clocked out successfully");
    } catch (error) {
      toast.error(extract_message(error as any));
    }
  };

  const handleCreateCorrection = async (payload: CreateCorrectionPayload) => {
    try {
      await createCorrectionMutation.mutateAsync(payload);
      setIsCorrectionOpen(false);
      toast.success("Correction request submitted");
    } catch (error) {
      toast.error(extract_message(error as any));
    }
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
          {hasOpenShiftToday ? (
            <button
              type="button"
              onClick={handleClockOut}
              disabled={clockOutMutation.isPending}
              className="btn btn-sm btn-outline border-error/40 text-error hover:bg-error/10 rounded-xl px-4 font-medium gap-1.5"
            >
              <LogOut className="size-4" />
              <span>
                {clockOutMutation.isPending ? "Clocking out..." : "Clock out"}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleClockIn}
              disabled={clockInMutation.isPending || !currentUserId}
              className="btn btn-sm bg-primary text-white hover:bg-primary/90 border-0 rounded-xl px-4 font-medium gap-1.5 shadow-sm shadow-primary/20"
            >
              <LogIn className="size-4" />
              <span>
                {clockInMutation.isPending ? "Clocking in..." : "Clock in"}
              </span>
            </button>
          )}
        </div>
      </PageHeader>

      <PageLoader
        query={recordsQuery}
        loadingText="Loading your attendance overview..."
      >
        <AttendanceStats records={personalRecords} />
      </PageLoader>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8">
          <PageLoader
            query={recordsQuery}
            emptyState={{
              title: "No attendance records",
              description: "Clock in to start tracking your attendance.",
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
              description: "Your correction requests will appear here.",
            }}
          >
            <CorrectionRequests requests={corrections} />
          </PageLoader>
        </div>
      </div>

      <RequestCorrectionModal
        isOpen={isCorrectionOpen}
        onClose={() => setIsCorrectionOpen(false)}
        onSubmitCorrection={handleCreateCorrection}
      />
    </div>
  );
}
