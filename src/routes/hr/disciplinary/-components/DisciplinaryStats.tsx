import StatCard from "@/components/StatCard";
import { AlertTriangle, CheckCircle2, Clock, Scale } from "lucide-react";
import type { DisciplinaryCase } from "./types";

interface DisciplinaryStatsProps {
  cases: DisciplinaryCase[];
}

export default function DisciplinaryStats({ cases }: DisciplinaryStatsProps) {
  const underReview = cases.filter(
    (c) => c.status === "Under Review" || c.status === "Investigation",
  ).length;

  const hearingsOrResponses = cases.filter(
    (c) =>
      c.status === "Hearing Scheduled" ||
      c.currentStep === "Employee response" ||
      c.currentStep === "Hearing",
  ).length;

  const closed = cases.filter((c) => c.status === "Closed").length;

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <StatCard
        title="Total Cases"
        value={cases.length}
        desc="Recorded historical cases"
        icon={<Scale className="size-5" />}
        variant="primary"
      />

      <StatCard
        title="Under Review"
        value={underReview}
        desc="Active inquiries & reviews"
        icon={<Clock className="size-5" />}
        variant="warning"
      />

      <StatCard
        title="Due Process"
        value={hearingsOrResponses}
        desc="Response or hearings stage"
        icon={<AlertTriangle className="size-5" />}
        variant="info"
      />

      <StatCard
        title="Resolved"
        value={closed}
        desc="Concluded with final action"
        icon={<CheckCircle2 className="size-5" />}
        variant="success"
      />
    </div>
  );
}
