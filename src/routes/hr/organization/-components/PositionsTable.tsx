import { useMemo, useState } from "react";
import CustomTable, { type columnType } from "@/components/tables/CustomTable";
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

  const filteredPositions = useMemo(() => {
    if (!searchTerm.trim()) return positions;
    const q = searchTerm.toLowerCase();
    return positions.filter(
      (pos) =>
        pos.title.toLowerCase().includes(q) ||
        pos.dept.toLowerCase().includes(q) ||
        pos.grade.toLowerCase().includes(q),
    );
  }, [positions, searchTerm]);

  const isFullyFilled = (pos: Position) => pos.filled >= pos.approved;
  const percentage = (pos: Position) =>
    Math.round((pos.filled / (pos.approved || 1)) * 100);

  const columns: columnType[] = [
    {
      key: "title",
      label: "Title",
      render: (_value, pos) => (
        <div className="flex flex-col">
          <span className="font-semibold text-base-content">{pos.title}</span>
          <span className="text-[11px] text-base-content/50 font-normal">
            {pos.dept}
          </span>
        </div>
      ),
    },
    {
      key: "grade",
      label: "Grade",
      render: (value) => (
        <span className="rounded-md bg-base-200 px-2 py-0.5 text-xs font-mono font-semibold text-base-content/80">
          {value}
        </span>
      ),
    },
    {
      key: "approved",
      label: "Approved",
      render: (value) => (
        <span className="text-center font-bold text-base-content">
          {value}
        </span>
      ),
    },
    {
      key: "filled",
      label: "Filled",
      render: (value, pos) => (
        <span
          className={
            isFullyFilled(pos) ? "text-emerald-600" : "text-amber-600"
          }
        >
          {value}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (_value, pos) => {
        const full = isFullyFilled(pos);
        const pct = percentage(pos);
        return (
          <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 bg-base-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${full ? "bg-emerald-500" : "bg-amber-500"}`}
                style={{ width: `${Math.min(100, pct)}%` }}
              />
            </div>
            <span
              className={`text-[11px] font-semibold ${full ? "text-emerald-700" : "text-amber-700"}`}
            >
              {pct}%
            </span>
          </div>
        );
      },
    },
    {
      key: "recruit",
      label: "Recruit",
      render: (_value, pos) =>
        isFullyFilled(pos) ? (
          <span className="text-[11px] text-base-content/40 italic">
            Optimal
          </span>
        ) : (
          <Link
            to="/hr/recruitment"
            className="btn btn-ghost btn-xs text-primary hover:bg-primary/10 rounded-lg px-2 gap-1 text-[11px]"
          >
            <span>Hire</span>
            <ArrowRight className="size-3" />
          </Link>
        ),
    },
  ];

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
      <CustomTable ring={false} data={filteredPositions} columns={columns} />
    </div>
  );
}
