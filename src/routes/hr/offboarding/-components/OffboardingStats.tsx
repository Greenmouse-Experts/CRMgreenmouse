import StatCard from "@/components/StatCard";
import { CheckCircle2, ClipboardCheck, Laptop, UserMinus } from "lucide-react";
import type { ClearanceItem, OffboardingCase } from "./types";

interface OffboardingStatsProps {
  cases: OffboardingCase[];
  clearanceItems: ClearanceItem[];
}

export default function OffboardingStats({
  cases,
  clearanceItems,
}: OffboardingStatsProps) {
  const activeCases = cases.filter((c) => c.status !== "Completed").length;

  const pendingClearance = clearanceItems.filter(
    (item) => item.status === "Pending" || item.status === "In Progress",
  ).length;

  const pendingAssets = clearanceItems.filter(
    (item) =>
      item.department === "IT" &&
      item.item.toLowerCase().includes("return") &&
      item.status !== "Completed",
  ).length;

  const completedExits = cases.filter((c) => c.status === "Completed").length;

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <StatCard
        title="Active Offboardings"
        value={activeCases}
        desc="Employees in notice period"
        icon={<UserMinus className="size-5" />}
        variant="primary"
      />

      <StatCard
        title="Pending Clearance"
        value={pendingClearance}
        desc="Tasks requiring sign-off"
        icon={<ClipboardCheck className="size-5" />}
        variant="warning"
      />

      <StatCard
        title="Assets to Retrieve"
        value={pendingAssets}
        desc="Laptops, phones & equipment"
        icon={<Laptop className="size-5" />}
        variant="info"
      />

      <StatCard
        title="Completed Exits"
        value={completedExits}
        desc="Cleared & archive records retained"
        icon={<CheckCircle2 className="size-5" />}
        variant="success"
      />
    </div>
  );
}
