import { useState } from "react";
import type { Position } from "./types";
import { Link } from "@tanstack/react-router";
import { Search, UserPlus, ArrowRight } from "lucide-react";

interface PositionsTableProps {
  positions: Position[];
  onAddPositionClick?: () => void;
}

export default function PositionsTable({
  positions,
  onAddPositionClick,
}: PositionsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPositions = positions.filter((pos) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      pos.title.toLowerCase().includes(q) ||
      pos.dept.toLowerCase().includes(q) ||
      pos.grade.toLowerCase().includes(q)
    );
  });

  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm p-4 sm:p-6 space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-base-content">Positions</h2>
          <p className="text-xs text-base-content/60">
            Standard job roles, pay grades, and approved headcounts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-44">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-base-content/40" />
            <input
              type="text"
              placeholder="Search positions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input input-xs w-full pl-8 bg-base-200/60 border-base-300 rounded-lg text-xs"
            />
          </div>

          {onAddPositionClick && (
            <button
              type="button"
              onClick={onAddPositionClick}
              className="btn btn-xs bg-primary text-white hover:bg-primary/90 border-0 rounded-lg px-2.5 font-medium gap-1"
            >
              <UserPlus className="size-3" />
              <span>Add</span>
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-base-200">
        <table className="table table-sm w-full">
          <thead>
            <tr className="bg-base-200/60 text-xs font-semibold text-base-content/70">
              <th>Title</th>
              <th>Grade</th>
              <th className="text-center">Approved</th>
              <th className="text-center">Filled</th>
              <th>Status</th>
              <th className="text-right">Recruit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-base-200 text-xs">
            {filteredPositions.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-base-content/40">
                  No positions match your search.
                </td>
              </tr>
            ) : (
              filteredPositions.map((pos) => {
                const isFullyFilled = pos.filled >= pos.approved;
                const percentage = Math.round(
                  (pos.filled / (pos.approved || 1)) * 100,
                );

                return (
                  <tr
                    key={pos.id}
                    className="hover:bg-base-200/40 transition-colors"
                  >
                    <td className="font-semibold text-base-content">
                      <div className="flex flex-col">
                        <span>{pos.title}</span>
                        <span className="text-[11px] text-base-content/50 font-normal">
                          {pos.dept}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="rounded-md bg-base-200 px-2 py-0.5 text-xs font-mono font-semibold text-base-content/80">
                        {pos.grade}
                      </span>
                    </td>
                    <td className="text-center font-bold text-base-content">
                      {pos.approved}
                    </td>
                    <td className="text-center font-bold">
                      <span
                        className={
                          isFullyFilled
                            ? "text-emerald-600"
                            : "text-amber-600"
                        }
                      >
                        {pos.filled}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-base-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isFullyFilled ? "bg-emerald-500" : "bg-amber-500"
                            }`}
                            style={{ width: `${Math.min(100, percentage)}%` }}
                          />
                        </div>
                        <span
                          className={`text-[11px] font-semibold ${
                            isFullyFilled
                              ? "text-emerald-700"
                              : "text-amber-700"
                          }`}
                        >
                          {percentage}%
                        </span>
                      </div>
                    </td>
                    <td className="text-right">
                      {!isFullyFilled ? (
                        <Link
                          to="/hr/recruitment"
                          className="btn btn-ghost btn-xs text-primary hover:bg-primary/10 rounded-lg px-2 gap-1 text-[11px]"
                        >
                          <span>Hire</span>
                          <ArrowRight className="size-3" />
                        </Link>
                      ) : (
                        <span className="text-[11px] text-base-content/40 italic">
                          Optimal
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
