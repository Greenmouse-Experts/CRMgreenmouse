import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import PageHeader from "@/components/Headers/PageHeader";
import PageLoader from "@/components/layout/PageLoader";
import TasksTable from "./-components/TasksTable";
import CreateTaskModal from "./-components/CreateTaskModal";
import { useTasks } from "@/api/tasksApi";

export const Route = createFileRoute("/hr/tasks/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const tasksQuery = useTasks();
  const tasks = tasksQuery.data ?? [];

  return (
    <div className="space-y-6 pb-16">
      <div>
        <p className="mb-1 font-semibold uppercase tracking-[0.18em] text-primary">
          Tasks
        </p>
        <PageHeader
          title="Tasks"
          description={`${tasks.length} tasks · track your work`}
        >
          <button
            type="button"
            onClick={() => setIsCreateTaskOpen(true)}
            className="btn btn-sm btn-primary gap-1.5 rounded-lg font-medium shadow-xs"
          >
            <Plus className="size-4" /> Add Task
          </button>
        </PageHeader>
      </div>

      <PageLoader
        query={tasksQuery}
        emptyState={{
          title: "No tasks yet",
          description:
            "Create your first task to start tracking and following up.",
          actionText: "Add Task",
          onAction: () => setIsCreateTaskOpen(true),
        }}
      >
        {(data) => <TasksTable tasks={data ?? []} />}
      </PageLoader>

      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
      />
    </div>
  );
}
