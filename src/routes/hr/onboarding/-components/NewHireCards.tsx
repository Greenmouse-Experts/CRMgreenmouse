import type { OnboardingHire } from "./types";
import { CheckCircle2, ChevronRight } from "lucide-react";

interface NewHireCardsProps {
  hires: OnboardingHire[];
  selectedHireId: string;
  onSelectHire: (hireId: string) => void;
}

export default function NewHireCards({
  hires,
  selectedHireId,
  onSelectHire,
}: NewHireCardsProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const avatarStyles = [
    "bg-indigo-100 text-indigo-700",
    "bg-emerald-100 text-emerald-700",
    "bg-purple-100 text-purple-700",
    "bg-amber-100 text-amber-700",
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {hires.map((hire, idx) => {
        const isSelected = hire.id === selectedHireId;
        const avatarColor = avatarStyles[idx % avatarStyles.length];
        const isFinished = hire.progress === 100;

        return (
          <div
            key={hire.id}
            onClick={() => onSelectHire(hire.id)}
            className={`card bg-base-100 border p-5 shadow-xs transition-all duration-200 cursor-pointer hover:shadow-md ${
              isSelected
                ? "border-primary ring-2 ring-primary/20 shadow-sm"
                : "border-base-200 hover:border-base-300"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`size-11 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${avatarColor}`}
                >
                  {getInitials(hire.name)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-sm text-base-content truncate">
                      {hire.name}
                    </p>
                    {isFinished && (
                      <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-base-content/60 truncate">
                    {hire.role} · starts {hire.start}
                  </p>
                </div>
              </div>

              <ChevronRight
                className={`size-4 transition-transform ${
                  isSelected ? "text-primary translate-x-0.5" : "text-base-content/30"
                }`}
              />
            </div>

            {/* Progress Bar */}
            <div className="mt-5 flex items-center gap-3">
              <div className="flex-1 h-2 bg-base-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isFinished
                      ? "bg-emerald-500"
                      : hire.progress >= 50
                        ? "bg-primary"
                        : "bg-amber-500"
                  }`}
                  style={{ width: `${hire.progress}%` }}
                />
              </div>
              <span
                className={`text-xs font-bold font-mono ${
                  isFinished ? "text-emerald-600" : "text-base-content/80"
                }`}
              >
                {hire.progress}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
