import StatCard from "@/components/StatCard";
import type { Task } from "@/api/tasksApi";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Clock,
} from "lucide-react";
import { isTaskOverdue } from "./taskHelpers";

interface StaffTasksStatsProps {
  tasks: Task[];
}

export default function StaffTasksStats({ tasks }: StaffTasksStatsProps) {
  const totalCount = tasks.length;
  const activeCount = tasks.filter((t) => {
    const status = String(t.status ?? "").toLowerCase();
    return status === "open" || status === "in_progress";
  }).length;
  const overdueCount = tasks.filter((t) => isTaskOverdue(t)).length;
  const completedCount = tasks.filter(
    (t) => String(t.status ?? "").toLowerCase() === "completed",
  ).length;

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <StatCard
        title="My tasks"
        value={String(totalCount)}
        desc="Assigned to you"
        icon={<ClipboardList className="size-5" />}
        variant="primary"
      />
      <StatCard
        title="Active"
        value={String(activeCount)}
        desc="Open or in progress"
        icon={<Clock className="size-5" />}
        variant="info"
      />
      <StatCard
        title="Overdue"
        value={String(overdueCount)}
        desc={overdueCount > 0 ? "Needs attention" : "All on schedule"}
        icon={<AlertTriangle className="size-5" />}
        variant={overdueCount > 0 ? "error" : "default"}
      />
      <StatCard
        title="Completed"
        value={String(completedCount)}
        desc="Finished tasks"
        icon={<CheckCircle2 className="size-5" />}
        variant="success"
      />
    </div>
  );
}
