import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/Headers/PageHeader";
import { useTasks, useUpdateTaskStatus, type Task } from "@/api/tasksApi";
import { useAuth } from "@/store/authStore";
import { extract_message } from "@/helpers/errors";
import { UserCheck } from "lucide-react";
import { toast } from "sonner";
import { useCurrentStaffIdentity } from "../-components/useCurrentStaffIdentity";
import { filterPersonalTasks } from "../-components/staffScoping";
import StaffTasksStats from "./-components/StaffTasksStats";
import StaffTasksTable from "./-components/StaffTasksTable";
import StaffTaskDetailModal from "./-components/StaffTaskDetailModal";

export const Route = createFileRoute("/staff/tasks/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [auth] = useAuth();
  const { identity, isLoading: identityLoading } = useCurrentStaffIdentity();
  const tasksQuery = useTasks();
  const updateTaskStatus = useUpdateTaskStatus();

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  const myTasks = useMemo(
    () => filterPersonalTasks(tasksQuery.data ?? [], identity),
    [tasksQuery.data, identity],
  );

  const canUpdateStatus = useMemo(() => {
    const userType = String(auth?.user?.userType ?? "").toLowerCase();
    const permissions = Array.isArray(auth?.user?.permissions)
      ? auth.user.permissions
      : [];
    return userType === "tenant" || permissions.includes("tasks:update");
  }, [auth?.user]);

  const handleUpdateStatus = async (
    task: Task,
    status: "in_progress" | "completed",
  ) => {
    // Ensure updates are strictly limited to tasks belonging to the current employee
    if (!myTasks.some((t) => t.id === task.id)) return;
    setUpdatingTaskId(task.id);
    try {
      await updateTaskStatus.mutateAsync({ id: task.id, status });
      setSelectedTask((current) =>
        current && current.id === task.id ? { ...current, status } : current,
      );
      toast.success(
        status === "completed"
          ? "Task marked completed"
          : "Task marked in progress",
      );
    } catch (error) {
      toast.error(extract_message(error));
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const isLoading = identityLoading || tasksQuery.isLoading;

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="My Tasks"
        description="View tasks assigned specifically to you and track their priority, due dates, and completion status."
      />

      <div className="flex items-center gap-3 rounded-xl bg-primary/10 border border-primary/20 p-4 sm:text-sm font-medium text-base-content shadow-2xs">
        <UserCheck className="size-5 shrink-0 text-primary" />
        <span>
          Personal task view — Showing only tasks assigned to{" "}
          <strong>{identity.fullName}</strong>.
        </span>
      </div>

      {isLoading ? (
        <div className="card bg-base-100 border border-base-200 p-12 text-center max-w-lg mx-auto">
          <span className="loading loading-spinner loading-lg mx-auto mb-4" />
          <p className="text-base-content/80">Loading your tasks...</p>
        </div>
      ) : tasksQuery.isError ? (
        <div className="card bg-base-100 border border-error/30 p-8 text-center max-w-lg mx-auto space-y-3">
          <p className="font-semibold text-error">Unable to load tasks</p>
          <p className="text-sm text-base-content/80">
            {extract_message(tasksQuery.error)}
          </p>
          <button
            type="button"
            onClick={() => tasksQuery.refetch()}
            className="btn btn-sm btn-primary mx-auto rounded-xl"
          >
            Try again
          </button>
        </div>
      ) : (
        <>
          <StaffTasksStats tasks={myTasks} />

          <StaffTasksTable
            tasks={myTasks}
            onSelectTask={(task) => setSelectedTask(task)}
            canUpdateStatus={canUpdateStatus}
            onUpdateStatus={handleUpdateStatus}
            updatingTaskId={updatingTaskId}
          />
        </>
      )}

      <StaffTaskDetailModal
        isOpen={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        task={selectedTask}
        assigneeName={identity.fullName}
        canUpdateStatus={canUpdateStatus}
        onUpdateStatus={handleUpdateStatus}
        isUpdatingStatus={
          Boolean(selectedTask) && updatingTaskId === selectedTask?.id
        }
      />
    </div>
  );
}
