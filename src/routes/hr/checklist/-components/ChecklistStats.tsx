import type { ChecklistItemRecord } from "@/api/checklistApi";
import StatCard from "@/components/StatCard";

interface ChecklistStatsProps {
  items: ChecklistItemRecord[];
}

export default function ChecklistStats({ items }: ChecklistStatsProps) {
  const totalCount = items.length;
  const activeCount = items.filter((item) => item.active).length;
  const inactiveCount = items.length - activeCount;
  const ownerCount = new Set(
    items.map((item) => item.owner).filter(Boolean),
  ).size;

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <StatCard
        title="Checklist Items"
        value={String(totalCount)}
        variant="primary"
      />
      <StatCard
        title="Active"
        value={String(activeCount)}
        variant="success"
      />
      <StatCard
        title="Inactive"
        value={String(inactiveCount)}
        variant={inactiveCount > 0 ? "warning" : "default"}
      />
      <StatCard
        title="Assigned Owners"
        value={String(ownerCount)}
        variant="info"
      />
    </div>
  );
}
