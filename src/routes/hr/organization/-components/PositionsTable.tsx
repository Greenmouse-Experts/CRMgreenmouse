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
        Boolean(pos.title && pos.title.toLowerCase().includes(q)) ||
        Boolean(pos.dept && pos.dept.toLowerCase().includes(q)) ||
        Boolean(pos.grade && pos.grade.toLowerCase().includes(q)),
    );
  }, [positions, searchTerm]);

  const isFullyFilled = (pos: Position) =>
    (Number(pos.filled) || 0) >= (Number(pos.approved) || 1);

  const percentage = (pos: Position) =>
    Math.round(((Number(pos.filled) || 0) / (Number(pos.approved) || 1)) * 100);

  const columns: columnType[] = [
    {
      key: "title",
      label: "Title",
      render: (_value, pos) => (
        <div className="flex flex-col">
          <span className="font-semibold text-base-content">
            {pos.title || "Untitled Position"}
          </span>
          <span className="text-[11px] text-base-content/80 font-normal">
            {pos.dept || "General"}
          </span>
        </div>
      ),
    },
    {
      key: "grade",
      label: "Grade",
      render: (value) => (
        <span className="rounded-md bg-base-200 px-2 py-0.5  font-mono font-semibold text-base-content/80">
          {value || "—"}
        </span>
      ),
    },
    {
      key: "approved",
      label: "Approved",
      render: (value) => (
        <span className="text-center font-bold text-base-content">
          {Number(value) || 0}
        </span>
      ),
    },
    {
      key: "filled",
      label: "Filled",
      render: (value, pos) => (
        <span
          className={isFullyFilled(pos) ? "text-emerald-600" : "text-amber-600"}
        >
          {Number(value) || 0}
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
          <span className="text-[11px] text-base-content/80 italic">
            Optimal
          </span>
        ) : (
          <Link
            to="/hr/recruitment"
            className="btn btn-ghost btn-sm text-primary hover:bg-primary/10 rounded-lg px-2 gap-1 text-[11px]"
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
          <h3 className="text-base font-bold text-base-content">Positions</h3>
          <p className=" text-base-content/80">
            {filteredPositions.length} defined job role
            {filteredPositions.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/80" />
            <input
              type="text"
              placeholder="Search positions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input input-sm input-bordered pl-8  rounded-xl w-44 sm:w-52"
            />
          </div>

          <button
            type="button"
            onClick={onAddPositionClick}
            className="btn btn-sm btn-primary rounded-xl px-3 gap-1 shadow-xs"
          >
            <UserPlus className="size-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* CustomTable */}
      <CustomTable columns={columns} data={filteredPositions} />
    </div>
  );
}
