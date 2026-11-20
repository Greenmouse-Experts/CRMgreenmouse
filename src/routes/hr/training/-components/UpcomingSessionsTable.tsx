import { useState } from "react";
import type { SessionStatus, TrainingSession } from "./types";
import { Calendar, Search, MapPin, Video, Monitor } from "lucide-react";

interface UpcomingSessionsTableProps {
  sessions: TrainingSession[];
  onSelectSession?: (session: TrainingSession) => void;
}

export default function UpcomingSessionsTable({
  sessions,
  onSelectSession,
}: UpcomingSessionsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");

  const filteredSessions = sessions.filter((s) => {
    if (filterStatus !== "All" && s.status !== filterStatus) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        s.course.toLowerCase().includes(q) ||
        s.trainer.toLowerCase().includes(q) ||
        (s.location && s.location.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getStatusBadge = (status: SessionStatus) => {
    switch (status) {
      case "Scheduled":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5  font-semibold text-blue-700 border border-blue-200">
            <span className="size-1.5 rounded-full bg-blue-500 animate-pulse" />
            Scheduled
          </span>
        );
      case "In Progress":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5  font-semibold text-amber-700 border border-amber-200">
            <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
            In Progress
          </span>
        );
      case "Completed":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5  font-semibold text-emerald-700 border border-emerald-200">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Completed
          </span>
        );
      case "Cancelled":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5  font-semibold text-slate-600 border border-slate-200">
            Cancelled
          </span>
        );
    }
  };

  const getModeIcon = (mode?: string) => {
    switch (mode) {
      case "Virtual":
        return <Video className="size-3.5 text-info" />;
      case "Self-paced online":
        return <Monitor className="size-3.5 text-purple-600" />;
      case "In-person":
      default:
        return <MapPin className="size-3.5 text-emerald-600" />;
    }
  };

  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm p-4 sm:p-6 space-y-4">
      {/* Table Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-base-content">
              Upcoming sessions
            </h2>
            <span className="badge badge-sm badge-ghost  font-semibold">
              {filteredSessions.length}
            </span>
          </div>
          <p className=" text-base-content/80 mt-0.5">
            Classroom, live virtual training, and cohort schedules.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/80" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search session, trainer..."
            className="input input-sm input-bordered w-full pl-9  rounded-xl bg-base-200/80"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-base-200 pb-2">
        {["All", "Scheduled", "Completed"].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilterStatus(tab)}
            className={`px-3 py-1  font-semibold rounded-lg transition-all ${
              filterStatus === tab
                ? "bg-primary text-white shadow-2xs"
                : "text-base-content/80 hover:bg-base-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="table table-sm w-full">
          <thead>
            <tr className="border-b border-base-200  font-semibold text-base-content/80">
              <th>Course</th>
              <th>Date</th>
              <th>Delivery & Location</th>
              <th>Trainer</th>
              <th className="text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-base-200 ">
            {filteredSessions.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-8 text-center text-base-content/80 italic"
                >
                  No training sessions found.
                </td>
              </tr>
            ) : (
              filteredSessions.map((session) => (
                <tr
                  key={session.id}
                  onClick={() => onSelectSession?.(session)}
                  className="hover:bg-base-200/80 cursor-pointer transition-colors"
                >
                  <td className="font-bold text-base-content">
                    {session.course}
                  </td>

                  <td>
                    <div className="flex items-center gap-1.5 text-base-content/80">
                      <Calendar className="size-3.5 text-primary" />
                      <span>{session.date}</span>
                    </div>
                  </td>

                  <td>
                    <div className="flex items-center gap-1.5 text-base-content/80">
                      {getModeIcon(session.mode)}
                      <span className="truncate max-w-xs">
                        {session.location || session.mode || "HQ"}
                      </span>
                    </div>
                  </td>

                  <td className="font-medium text-base-content/80">
                    {session.trainer}
                  </td>

                  <td className="text-right">
                    {getStatusBadge(session.status)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
