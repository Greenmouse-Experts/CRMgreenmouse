import type { ComponentProps, ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CalendarCheck2,
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  CircleUserRound,
  ClipboardCheck,
  Clock,
  GraduationCap,
  Scale,
  Settings,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import PageHeader from "@/components/Headers/PageHeader";
import StatCard from "@/components/StatCard";
import {
  useEmployeeColleagues,
  useMyEmployeeProfile,
} from "@/api/employeesApi";
import { usePortalOrganization } from "@/api/organizationApi";
import { useMyTasks, useMyTasksSummary } from "@/api/tasksApi";
import { useLeaveBalances, useMyLeaveRequests } from "@/api/leaveApi";
import { useMyCorrectionRequests } from "@/api/attendanceApi";
import { useMyTrainingLearning } from "@/api/trainingApi";
import { useAuth } from "@/store/authStore";
import {
  formatTaskDate,
  formatTaskStatusLabel,
  PRIORITY_STYLES,
  STATUS_STYLES,
} from "../tasks/-components/taskHelpers";

const staffPaths = {
  colleagues: "/staff/staffs",
  tasks: "/staff/tasks",
  organization: "/staff/organization",
  attendance: "/staff/attendance",
  leave: "/staff/leave",
  performance: "/staff/performance",
  training: "/staff/training",
  disciplinary: "/staff/disciplinary",
  profile: "/staff/settings/profile",
  settings: "/staff/settings",
} as const;

const quickActions = [
  {
    label: "Clock in / Out",
    path: staffPaths.attendance,
    icon: <Clock className="size-4" />,
  },
  {
    label: "Request leave",
    path: staffPaths.leave,
    icon: <BriefcaseBusiness className="size-4" />,
  },
  {
    label: "My tasks",
    path: staffPaths.tasks,
    icon: <ClipboardCheck className="size-4" />,
  },
  {
    label: "My performance",
    path: staffPaths.performance,
    icon: <BarChart3 className="size-4" />,
  },
  {
    label: "Department trainings",
    path: staffPaths.training,
    icon: <GraduationCap className="size-4" />,
  },
  {
    label: "Disciplinary status",
    path: staffPaths.disciplinary,
    icon: <Scale className="size-4" />,
  },
  {
    label: "View colleagues",
    path: staffPaths.colleagues,
    icon: <Users className="size-4" />,
  },
  {
    label: "View organization",
    path: staffPaths.organization,
    icon: <Building2 className="size-4" />,
  },
  {
    label: "My profile",
    path: staffPaths.profile,
    icon: <CircleUserRound className="size-4" />,
  },
  {
    label: "Settings",
    path: staffPaths.settings,
    icon: <Settings className="size-4" />,
  },
];

function DashboardPanel({
  title,
  description,
  action,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`min-w-0 rounded-2xl bg-base-100 p-4 shadow-sm sm:p-5 ${className}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-base-content">{title}</h2>
          {description && (
            <p className="mt-1  text-base-content/80">{description}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value?: number; name?: string; color?: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-base-300 bg-base-100 px-3 py-2 shadow-lg">
      <p className="mb-1 font-medium text-base-content">{label}</p>
      {payload.map((item) => (
        <p key={item.name} style={{ color: item.color }}>
          {item.value} {item.name === "available" ? "days" : "employees"}
        </p>
      ))}
    </div>
  );
}

export default function StaffDashboard() {
  const [auth] = useAuth();
  const hasToken = Boolean(auth?.accessToken);

  const myProfileQuery = useMyEmployeeProfile(hasToken);
  const colleaguesQuery = useEmployeeColleagues(
    { limit: 100 },
    { enabled: hasToken },
  );
  const portalOrgQuery = usePortalOrganization(hasToken);
  const tasksSummaryQuery = useMyTasksSummary({ enabled: hasToken });
  const myTasksQuery = useMyTasks({ limit: 5 }, { enabled: hasToken });
  const myLeaveRequestsQuery = useMyLeaveRequests();
  const leaveBalancesQuery = useLeaveBalances();
  const myCorrectionsQuery = useMyCorrectionRequests({ enabled: hasToken });
  const myLearningQuery = useMyTrainingLearning();

  const displayName =
    myProfileQuery.data?.firstName?.trim() || auth?.user?.firstName?.trim();
  const today = new Date();
  const greeting =
    today.getHours() < 12
      ? "Good morning"
      : today.getHours() < 17
        ? "Good afternoon"
        : "Good evening";
  const headerTitle = displayName ? `${greeting}, ${displayName}` : greeting;
  const dateLabel = today.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const colleaguesTotal = colleaguesQuery.data?.total ?? 0;
  const orgSummary = portalOrgQuery.data?.summary;
  const departments = portalOrgQuery.data?.departments ?? [];
  const tasksSummary = tasksSummaryQuery.data ?? {
    total: 0,
    active: 0,
    overdue: 0,
    completed: 0,
  };
  const myTasks = myTasksQuery.data?.data ?? [];
  const leaveRequests = myLeaveRequestsQuery.data ?? [];
  const leaveBalances = leaveBalancesQuery.data ?? [];
  const corrections = myCorrectionsQuery.data ?? [];
  const myLearning = myLearningQuery.data ?? [];

  const pendingLeaveCount = leaveRequests.filter((l) => {
    const status = String(l.status ?? "").toLowerCase();
    return status.includes("pending") || status === "submitted";
  }).length;
  const approvedLeaveCount = leaveRequests.filter(
    (l) => String(l.status ?? "").toLowerCase() === "approved",
  ).length;

  const annualBalance =
    leaveBalances.find(
      (b) => String(b.type ?? "").toLowerCase() === "annual",
    ) ?? leaveBalances[0];
  const totalAvailableLeaveDays = leaveBalances.reduce(
    (acc, b) => acc + (Number(b.available) || 0),
    0,
  );
  const displayLeaveAvailable =
    annualBalance?.available ?? totalAvailableLeaveDays;

  const completedTrainingCount = myLearning.filter(
    (item: any) => String(item?.status ?? "").toLowerCase() === "completed",
  ).length;

  const departmentData = departments.map((dept) => ({
    name: dept.name,
    employees: Number(dept.staffCount ?? dept.count ?? 0),
  }));

  const leaveBalanceChartData = leaveBalances.slice(0, 6).map((b) => ({
    name: String(b.type ?? "Leave"),
    available: Number(b.available ?? 0),
  }));

  const metrics = [
    {
      title: "My Active Tasks",
      value: String(tasksSummary.active),
      desc: `${tasksSummary.overdue} overdue · ${tasksSummary.completed} completed`,
      icon: <ClipboardCheck className="size-5" />,
      variant: tasksSummary.overdue > 0 ? "warning" : "primary",
    },
    {
      title: "Leave Available",
      value: `${displayLeaveAvailable}d`,
      desc: `${pendingLeaveCount} pending · ${approvedLeaveCount} approved`,
      icon: <CalendarCheck2 className="size-5" />,
      variant: "success",
    },
    {
      title: "My Trainings",
      value: String(myLearning.length),
      desc: `${completedTrainingCount} completed`,
      icon: <GraduationCap className="size-5" />,
      variant: "info",
    },
    {
      title: "Colleagues",
      value: String(colleaguesTotal),
      desc: "Directory teammates",
      icon: <Users className="size-5" />,
      variant: "primary",
    },
    {
      title: "Departments",
      value: String(orgSummary?.departments ?? departments.length),
      desc: `${orgSummary?.totalWorkforce ?? colleaguesTotal} total workforce`,
      icon: <Building2 className="size-5" />,
      variant: "default",
    },
  ] satisfies ComponentProps<typeof StatCard>[];

  const isLoading =
    myProfileQuery.isLoading &&
    colleaguesQuery.isLoading &&
    portalOrgQuery.isLoading &&
    tasksSummaryQuery.isLoading;

  const renderHeaderActions = () => (
    <>
      <Link to={staffPaths.leave} className="btn btn-outline btn-sm sm:btn-md">
        <BriefcaseBusiness className="size-4" />
        Request leave
      </Link>
      <Link
        to={staffPaths.attendance}
        className="btn btn-primary btn-sm sm:btn-md"
      >
        <Clock className="size-4" />
        Attendance & Time
      </Link>
    </>
  );

  if (isLoading) {
    return (
      <div className="space-y-5 pb-8">
        <PageHeader
          title={headerTitle}
          description="Your personal workspace overview, tasks, leave, and organization directory."
        >
          {renderHeaderActions()}
        </PageHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-base-content/65">{dateLabel}</p>
          <span className="badge badge-ghost gap-1.5 ">
            <CircleAlert className="size-3.5" />
            Loading portal data…
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <StatCard
              key={i}
              title={`Metric ${i}`}
              value="—"
              desc="Loading"
              icon={<Users className="size-5" />}
              variant="default"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-8">
      <PageHeader
        title={headerTitle}
        description="Your personal workspace overview, tasks, leave, and organization directory."
      >
        {renderHeaderActions()}
      </PageHeader>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-base-content/65">{dateLabel}</p>
        <span className="badge badge-ghost gap-1.5 ">
          <CheckCircle2 className="size-3.5 text-success" />
          Employee portal active
        </span>
      </div>

      <section
        aria-label="Employee summary"
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4"
      >
        {metrics.map((metric) => (
          <StatCard key={metric.title} {...metric} />
        ))}
      </section>

      <div className="grid gap-4 xl:grid-cols-12">
        <DashboardPanel
          title="My recent tasks"
          description={`${tasksSummary.total} total assigned tasks`}
          action={
            <Link
              to={staffPaths.tasks}
              className="link link-primary text-sm focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              View all tasks
            </Link>
          }
          className="xl:col-span-7"
        >
          <div className="mt-3 divide-y divide-base-200">
            {myTasks.length > 0 ? (
              myTasks.map((task) => {
                const statusKey = String(task.status ?? "open").toLowerCase();
                const priorityKey = String(
                  task.priority ?? "medium",
                ).toLowerCase();
                return (
                  <Link
                    key={task.id}
                    to={staffPaths.tasks}
                    className="flex items-center justify-between gap-3 py-3 hover:bg-base-200/40 rounded-lg px-2 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm text-base-content truncate">
                        {task.title}
                      </p>
                      <p className="text-xs text-base-content/70 mt-0.5">
                        Due {formatTaskDate(task.dueAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`badge badge-xs capitalize font-semibold ${
                          PRIORITY_STYLES[priorityKey] ?? PRIORITY_STYLES.medium
                        }`}
                      >
                        {task.priority || "medium"}
                      </span>
                      <span
                        className={`badge badge-xs capitalize font-semibold ${
                          STATUS_STYLES[statusKey] ?? STATUS_STYLES.open
                        }`}
                      >
                        {formatTaskStatusLabel(task.status)}
                      </span>
                    </div>
                  </Link>
                );
              })
            ) : (
              <p className="text-base-content/75 text-sm py-8 text-center">
                No tasks currently assigned to you
              </p>
            )}
          </div>
        </DashboardPanel>

        <DashboardPanel
          title="By department"
          description="Organization headcount breakdown"
          action={
            <Link
              to={staffPaths.organization}
              className="link link-primary text-sm focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              View org
            </Link>
          }
          className="xl:col-span-5"
        >
          <div
            role="img"
            aria-label="Employee count by department"
            className="mt-4 h-56 w-full"
          >
            {departmentData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={departmentData}
                  layout="vertical"
                  margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    stroke="var(--color-base-300)"
                    strokeDasharray="3 3"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "var(--color-base-content)" }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={96}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "var(--color-base-content)" }}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar
                    dataKey="employees"
                    name="employees"
                    fill="var(--color-primary)"
                    radius={[0, 4, 4, 0]}
                    maxBarSize={18}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-base-content/75 text-sm py-12 text-center">
                No department breakdown available yet
              </p>
            )}
          </div>
        </DashboardPanel>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <DashboardPanel
          title="My leave & attendance requests"
          description="Personal leave submissions and attendance corrections"
          action={
            <Link
              to={staffPaths.leave}
              className="link link-primary text-sm focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Manage leave
            </Link>
          }
        >
          <div className="mt-3 divide-y divide-base-200">
            {leaveRequests.length === 0 && corrections.length === 0 ? (
              <p className="text-base-content/75 text-sm py-6 text-center">
                No recent leave or attendance correction requests
              </p>
            ) : (
              <>
                {leaveRequests.slice(0, 4).map((req) => (
                  <div
                    key={req.id}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <CalendarClock className="size-4 text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {req.type} Leave · {req.from} – {req.to}
                        </p>
                        <p className="text-xs text-base-content/70">
                          {req.days} {req.days === 1 ? "day" : "days"}
                        </p>
                      </div>
                    </div>
                    <span className="badge badge-sm badge-ghost shrink-0">
                      {req.status}
                    </span>
                  </div>
                ))}
                {corrections.slice(0, 2).map((corr) => (
                  <div
                    key={corr.id}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Clock className="size-4 text-info shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          Attendance correction · {corr.date ?? "—"}
                        </p>
                        <p className="text-xs text-base-content/70 truncate">
                          {corr.correctionType ?? "Time adjustment"}
                        </p>
                      </div>
                    </div>
                    <span className="badge badge-sm badge-ghost shrink-0 capitalize">
                      {corr.status ?? "Pending"}
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>
        </DashboardPanel>

        <DashboardPanel
          title="My leave balances"
          description="Available entitlement across leave categories"
          action={
            <Link
              to={staffPaths.leave}
              className="link link-primary text-sm focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Request leave
            </Link>
          }
        >
          {leaveBalanceChartData.length > 0 ? (
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {leaveBalanceChartData.map((b) => (
                <div
                  key={b.name}
                  className="rounded-xl border border-base-200 bg-base-200/30 p-3"
                >
                  <p className="text-xs text-base-content/70 truncate">
                    {b.name}
                  </p>
                  <p className="text-lg font-bold text-base-content mt-0.5">
                    {b.available}{" "}
                    <span className="text-xs font-normal text-base-content/65">
                      days
                    </span>
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-base-content/75 text-sm py-6 text-center">
              No leave balances configured yet
            </p>
          )}
        </DashboardPanel>
      </div>

      <DashboardPanel title="Quick actions">
        <div className="mt-4 flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              to={action.path}
              className="btn btn-sm btn-outline"
            >
              {action.icon}
              {action.label}
            </Link>
          ))}
        </div>
      </DashboardPanel>
    </div>
  );
}
