import { useState } from "react";
import type { Candidate, PipelineStage } from "./types";
import { PIPELINE_STAGES } from "./recruitmentData";
import { ChevronRight, Search } from "lucide-react";

interface CandidatePipelineProps {
  candidates: Candidate[];
  onSelectCandidate: (candidate: Candidate) => void;
  onAdvanceStage: (candidateId: string, nextStage: PipelineStage) => void;
}

export default function CandidatePipeline({
  candidates,
  onSelectCandidate,
  onAdvanceStage,
}: CandidatePipelineProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCandidates = candidates.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.role.toLowerCase().includes(q) ||
      c.stage.toLowerCase().includes(q)
    );
  });

  const getNextStage = (currentStage: PipelineStage): PipelineStage | null => {
    const idx = PIPELINE_STAGES.indexOf(currentStage);
    if (idx >= 0 && idx < PIPELINE_STAGES.length - 1) {
      return PIPELINE_STAGES[idx + 1];
    }
    return null;
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (score >= 75) return "text-blue-600 bg-blue-50 border-blue-200";
    return "text-amber-600 bg-amber-50 border-amber-200";
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const avatarColors = [
    "bg-indigo-100 text-indigo-700",
    "bg-emerald-100 text-emerald-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
    "bg-cyan-100 text-cyan-700",
    "bg-violet-100 text-violet-700",
  ];

  return (
    <div className="card bg-base-100 border border-base-200 shadow-sm p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-base-content">
            Candidate pipeline
          </h2>
          <p className=" text-base-content/80">
            Track candidates across each stage of hiring and review evaluations
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/80" />
          <input
            type="text"
            placeholder="Search candidates or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input input-sm w-full pl-9 bg-base-200/80 border-base-300 rounded-lg "
          />
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-3 pt-1 scrollbar-thin">
        {PIPELINE_STAGES.map((stage) => {
          const stageCandidates = filteredCandidates.filter(
            (c) => c.stage === stage,
          );
          const nextStage = getNextStage(stage);

          return (
            <div
              key={stage}
              className="w-64 shrink-0 rounded-2xl bg-base-200/80 border border-base-200/80 p-3.5 flex flex-col"
            >
              {/* Column Header */}
              <div className="mb-3 flex items-center justify-between  font-semibold px-1">
                <span className="text-base-content font-bold">{stage}</span>
                <span className="rounded-full bg-base-100 border border-base-300/80 px-2 py-0.5 text-[11px] text-base-content/80 font-semibold shadow-2xs">
                  {stageCandidates.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[460px] pr-0.5">
                {stageCandidates.length === 0 ? (
                  <div className="py-8 text-center  text-base-content/80 italic">
                    No candidates
                  </div>
                ) : (
                  stageCandidates.map((candidate, idx) => {
                    const avatarBg =
                      avatarColors[
                        (candidate.name.charCodeAt(0) + idx) %
                          avatarColors.length
                      ];

                    return (
                      <div
                        key={candidate.id}
                        onClick={() => onSelectCandidate(candidate)}
                        className="group relative rounded-xl border border-base-200 bg-base-100 p-3 shadow-xs hover:border-primary/80 hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`size-7 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${avatarBg}`}
                          >
                            {getInitials(candidate.name)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-base-content truncate group-hover:text-primary transition-colors">
                              {candidate.name}
                            </p>
                            <p className=" text-base-content/80 truncate">
                              {candidate.role}
                            </p>
                          </div>
                        </div>

                        {/* Bottom Score & Action */}
                        <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-base-200/80">
                          <div className="flex items-center gap-1.5 flex-1 min-w-0">
                            <div className="w-16 h-1.5 bg-base-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  candidate.score >= 85
                                    ? "bg-emerald-500"
                                    : candidate.score >= 75
                                      ? "bg-blue-500"
                                      : "bg-amber-500"
                                }`}
                                style={{ width: `${candidate.score}%` }}
                              />
                            </div>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getScoreColor(
                                candidate.score,
                              )}`}
                            >
                              {candidate.score}
                            </span>
                          </div>

                          {nextStage && (
                            <button
                              type="button"
                              title={`Advance to ${nextStage}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onAdvanceStage(candidate.id, nextStage);
                              }}
                              className="btn btn-ghost btn-xs text-base-content/80 hover:text-primary hover:bg-primary/10 rounded-lg px-1.5 py-0.5 h-6 min-h-6 flex items-center gap-0.5 text-[10px]"
                            >
                              <span>Next</span>
                              <ChevronRight className="size-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
