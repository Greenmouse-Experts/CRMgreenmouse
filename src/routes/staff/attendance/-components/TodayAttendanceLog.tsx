import { useState } from "react";
import type { AttendanceRecord, AttendanceStatus } from "./types";
import { Search } from "lucide-react";
import CustomTable, { type columnType } from "@/components/tables/CustomTable";

interface TodayAttendanceLogProps {
  logs: AttendanceRecord[];
}

export default function TodayAttendanceLog({ logs }: TodayAttendanceLogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const filteredLogs = logs.filter((log) => {
    if (statusFilter !== "All" && log.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        log.name.toLowerCase().includes(q) ||
        log.date.toLowerCase().includes(q) ||
        log.status.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getInitials = (name: string) =>
    name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "ME";

  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case "Clocked In":
      case "Present":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-sm font-semibold text-emerald-700 border border-emerald-200">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {status}
          </span>
        );
      case "Clocked Out":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-sm font-semibold text-slate-700 border border-slate-200">
            <span className="size-1.5 rounded-full bg-slate-500" />
            Clocked Out
          </span>
        );
      case "Late":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-sm font-semibold text-amber-700 border border-amber-200">
            <span className="size-1.5 rounded-full bg-amber-500" />
            Late
          </span>
        );
      case "Absent":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-0.5 text-sm font-semibold text-rose-700 border border-rose-200">
            <span className="size-1.5 rounded-full bg-rose-500" />
            Absent
          </span>
        );
      default:
        return <span className="badge badge-sm badge-ghost">{status}</span>;
    }
  };

  const columns: columnType<AttendanceRecord>[] = [
    {
      key: "name",
      label: "Staff",
      render: (_value: string, log: AttendanceRecord) => (
        <div className="flex items-center gap-2.5">
          <div className="size-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 border border-primary/20">
            {getInitials(log.name)}
          </div>
          <span className="font-semibold">{log.name}</span>
        </div>
      ),
    },
    {
      key: "date",
      label: "Date",
      render: (value: string) => (
        <span className="font-mono text-base-content/80">{value}</span>
      ),
    },
    {
      key: "clockInAt",
      label: "Clock In",
      render: (value: string) => (
        <span className="font-mono font-semibold">{value}</span>
      ),
    },
    {
      key: "clockOutAt",
      label: "Clock Out",
      render: (value: string) => (
        <span className="font-mono text-base-content/80">{value}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value: AttendanceStatus) => getStatusBadge(value),
    },
  ];

  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-base-content">My Time Logs</h2>
          <p className="text-sm text-base-content/80">
            Your personal clock-in and clock-out attendance records
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-48">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-base-content/70" />
            <input
              type="text"
              placeholder="Search date or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input input-sm w-full pl-8 bg-base-200/80 border-base-300 rounded-lg"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select select-sm bg-base-200/80 border-base-300 rounded-lg"
          >
            <option value="All">All Statuses</option>
            <option value="Clocked In">Clocked In</option>
            <option value="Clocked Out">Clocked Out</option>
            <option value="Present">Present</option>
            <option value="Late">Late</option>
            <option value="Absent">Absent</option>
          </select>
        </div>
      </div>

      {filteredLogs.length > 0 ? (
        <CustomTable data={filteredLogs} columns={columns} />
      ) : (
        <div className="py-8 text-center text-sm text-base-content/70">
          No attendance records found matching filters.
        </div>
      )}
    </div>
  );
}
