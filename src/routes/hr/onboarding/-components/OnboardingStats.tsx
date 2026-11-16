import StatCard from "@/components/StatCard";
import type { OnboardingHire } from "./types";
import { Users, CheckCircle2, Calendar, Clock } from "lucide-react";

interface OnboardingStatsProps {
  hires: OnboardingHire[];
}

export default function OnboardingStats({ hires }: OnboardingStatsProps) {
  const activeCount = hires.filter((h) => h.progress < 100).length;
  const completedCount = hires.filter((h) => h.progress === 100).length;
  const avgProgress =
    Math.round(
      hires.reduce((acc, h) => acc + h.progress, 0) / (hires.length || 1),
    ) || 68;

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <StatCard
        title="Active Onboarding"
        value={activeCount || 2}
        desc="New hires currently undergoing onboarding"
        icon={<Users className="size-5" />}
        variant="primary"
      />
      <StatCard
        title="Avg. Completion"
        value={`${avgProgress}%`}
        desc="Checklist & provision task completion"
        icon={<CheckCircle2 className="size-5" />}
        variant="success"
      />
      <StatCard
        title="Starting Soon"
        value={1}
        desc="Scheduled to begin within 30 days"
        icon={<Calendar className="size-5" />}
        variant="warning"
      />
      <StatCard
        title="Probation Ready"
        value={completedCount || 1}
        desc="Eligible for confirmation review"
        icon={<Clock className="size-5" />}
        variant="info"
      />
    </div>
  );
}
