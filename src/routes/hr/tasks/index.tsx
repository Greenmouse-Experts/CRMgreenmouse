import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import PageHeader from "@/components/Headers/PageHeader";
import PageLoader from "@/components/layout/PageLoader";
import TasksTable from "./-components/TasksTable";
import CreateTaskModal from "./-components/CreateTaskModal";
import { useTasks, type Task } from "@/api/tasksApi";

export const Route = createFileRoute("/hr/tasks/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const tasksQuery = useTasks();
  const tasks = tasksQuery.data ?? [];

  const handleOpenCreate = () => {
    setEditingTask(null);
    setIsCreateTaskOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setIsCreateTaskOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateTaskOpen(false);
    setEditingTask(null);
  };

  return (
    <div className="space-y-6 pb-16">
      <div>
        <PageHeader
          title="Tasks"
          description={`${tasks.length} tasks · track your work`}
        >
          <button
            type="button"
            onClick={handleOpenCreate}
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
          onAction: handleOpenCreate,
        }}
      >
        {(data) => <TasksTable tasks={data ?? []} onEdit={handleOpenEdit} />}
      </PageLoader>

      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={handleCloseModal}
        initialTask={editingTask}
      />
    </div>
  );
}
