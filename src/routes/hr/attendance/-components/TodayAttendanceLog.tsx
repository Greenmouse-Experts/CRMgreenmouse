import { useState } from "react";
import type { AttendanceRecord, AttendanceStatus } from "./types";
import { Search } from "lucide-react";

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
        log.shift.toLowerCase().includes(q) ||
        (log.location && log.location.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case "Present":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Present
          </span>
        );
      case "Late":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
            <span className="size-1.5 rounded-full bg-amber-500" />
            Late
          </span>
        );
      case "Absent":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 border border-rose-200">
            <span className="size-1.5 rounded-full bg-rose-500" />
            Absent
          </span>
        );
      default:
        return <span className="badge badge-sm badge-ghost">{status}</span>;
    }
  };

  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm p-4 sm:p-6 space-y-4">
      {/* Header with Search and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-base-content">Today&apos;s log</h2>
          <p className="text-xs text-base-content/60">
            Real-time clock-in logs and shift status for active staff members
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-44">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-base-content/40" />
            <input
              type="text"
              placeholder="Search employee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input input-xs w-full pl-8 bg-base-200/60 border-base-300 rounded-lg text-xs"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select select-xs bg-base-200/60 border-base-300 rounded-lg text-xs"
          >
            <option value="All">All Statuses</option>
            <option value="Present">Present</option>
            <option value="Late">Late</option>
            <option value="Absent">Absent</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-base-200">
        <table className="table table-sm w-full">
          <thead>
            <tr className="bg-base-200/60 text-xs font-semibold text-base-content/70">
              <th>Employee</th>
              <th>Shift</th>
              <th className="text-center">In</th>
              <th className="text-center">Out</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-base-200 text-xs">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-base-content/40">
                  No attendance records found matching filters.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-base-200/40 transition-colors"
                >
                  <td className="font-semibold text-base-content">
                    <div className="flex items-center gap-2.5">
                      <div className="size-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[11px] shrink-0 border border-primary/20">
                        {getInitials(log.name)}
                      </div>
                      <div className="flex flex-col">
                        <span>{log.name}</span>
                        {log.workMode && (
                          <span className="text-[10px] text-base-content/50 font-normal">
                            {log.workMode} {log.location ? `· ${log.location}` : ""}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="font-mono text-xs text-base-content/80">
                    {log.shift}
                  </td>
                  <td className="text-center font-mono font-semibold text-base-content">
                    {log.timeIn}
                  </td>
                  <td className="text-center font-mono text-base-content/60">
                    {log.timeOut}
                  </td>
                  <td>{getStatusBadge(log.status)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
