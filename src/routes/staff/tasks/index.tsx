import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/Headers/PageHeader";
import {
  useMyTask,
  useMyTasks,
  useMyTasksSummary,
  useUpdateMyTaskStatus,
  type MyTaskStatus,
  type Task,
} from "@/api/tasksApi";
import { extract_message } from "@/helpers/errors";
import { UserCheck } from "lucide-react";
import { toast } from "sonner";
import { useCurrentStaffIdentity } from "../-components/useCurrentStaffIdentity";
import StaffTasksStats from "./-components/StaffTasksStats";
import StaffTasksTable from "./-components/StaffTasksTable";
import StaffTaskDetailModal from "./-components/StaffTaskDetailModal";

export const Route = createFileRoute("/staff/tasks/")({
  component: RouteComponent,
});

const PAGE_LIMIT = 20;

const STATUS_SUCCESS_LABEL: Record<MyTaskStatus, string> = {
  open: "Task reopened",
  in_progress: "Task marked in progress",
  completed: "Task marked completed",
  cancelled: "Task cancelled",
};

function RouteComponent() {
  const { identity } = useCurrentStaffIdentity();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 250);
    return () => clearTimeout(handle);
  }, [searchTerm]);

  const tasksQuery = useMyTasks({
    search: debouncedSearch || undefined,
    status: selectedStatus !== "all" ? selectedStatus : undefined,
    priority: selectedPriority !== "all" ? selectedPriority : undefined,
    overdue: overdueOnly ? true : undefined,
    page,
    limit: PAGE_LIMIT,
  });
  const summaryQuery = useMyTasksSummary();
  const updateTaskStatus = useUpdateMyTaskStatus();

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const selectedTaskDetailQuery = useMyTask(selectedTask?.id);

  const myTasks = tasksQuery.data?.data ?? [];
  const totalCount = tasksQuery.data?.total ?? myTasks.length;
  const activeTask = selectedTaskDetailQuery.data ?? selectedTask;

  const hasActiveFilters =
    Boolean(debouncedSearch) ||
    selectedStatus !== "all" ||
    selectedPriority !== "all" ||
    overdueOnly;

  const resetFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setSelectedStatus("all");
    setSelectedPriority("all");
    setOverdueOnly(false);
    setPage(1);
  };

  const handleUpdateStatus = async (task: Task, status: MyTaskStatus) => {
    setUpdatingTaskId(task.id);
    try {
      await updateTaskStatus.mutateAsync({ id: task.id, status });
      setSelectedTask((current) =>
        current && current.id === task.id ? { ...current, status } : current,
      );
      toast.success(STATUS_SUCCESS_LABEL[status] ?? "Task status updated");
    } catch (error) {
      toast.error(extract_message(error));
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const isLoading = tasksQuery.isLoading && !tasksQuery.data;

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
          <StaffTasksStats tasks={myTasks} summary={summaryQuery.data} />

          <StaffTasksTable
            tasks={myTasks}
            totalCount={totalCount}
            searchTerm={searchTerm}
            onSearchChange={(val) => {
              setSearchTerm(val);
              setPage(1);
            }}
            selectedStatus={selectedStatus}
            onStatusChange={(val) => {
              setSelectedStatus(val);
              setPage(1);
            }}
            selectedPriority={selectedPriority}
            onPriorityChange={(val) => {
              setSelectedPriority(val);
              setPage(1);
            }}
            overdueOnly={overdueOnly}
            onOverdueChange={(val) => {
              setOverdueOnly(val);
              setPage(1);
            }}
            page={tasksQuery.data?.page ?? page}
            limit={tasksQuery.data?.limit ?? PAGE_LIMIT}
            onPageChange={setPage}
            onSelectTask={(task) => setSelectedTask(task)}
            canUpdateStatus
            onUpdateStatus={handleUpdateStatus}
            updatingTaskId={updatingTaskId}
            hasActiveFilters={hasActiveFilters}
            onResetFilters={resetFilters}
          />
        </>
      )}

      <StaffTaskDetailModal
        isOpen={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        task={activeTask}
        assigneeName={identity.fullName}
        canUpdateStatus
        onUpdateStatus={handleUpdateStatus}
        isUpdatingStatus={
          Boolean(selectedTask) && updatingTaskId === selectedTask?.id
        }
        isLoadingDetail={selectedTaskDetailQuery.isLoading}
      />
    </div>
  );
}
