import type { ComponentProps, ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  Cake,
  CalendarCheck2,
  CalendarClock,
  Check,
  CircleAlert,
  CircleUserRound,
  ClipboardCheck,
  Clock,
  FileText,
  GraduationCap,
  Scale,
  Settings,
  UserPlus,
  Users,
  UserRoundCheck,
  UserRoundX,
  WalletCards,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import PageHeader from "@/components/Headers/PageHeader";
import StatCard from "@/components/StatCard";
import { useAttendanceDashboard } from "@/api/attendanceApi";
import {
  useEmployeeOrganization,
  useEmployeeRecentActivity,
  useEmployees,
  useUpcomingMilestones,
} from "@/api/employeesApi";
import { useLeaveRequests } from "@/api/leaveApi";
import { useRecruitmentDashboard } from "@/api/recruitmentApi";
import { useAuth } from "@/store/authStore";

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
    <div className="rounded-lg border border-base-300 bg-base-100 px-3 py-2  shadow-lg">
      <p className="mb-1 font-medium text-base-content">{label}</p>
      {payload.map((item) => (
        <p key={item.name} style={{ color: item.color }}>
          {item.value}
          {item.name === "attendance" ? "%" : " employees"}
        </p>
      ))}
    </div>
  );
}

export default function StaffDashboard() {
  const [auth] = useAuth();
  const displayName = auth?.user?.firstName?.trim();
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

  const employeesQuery = useEmployees();
  const attendanceDashboardQuery = useAttendanceDashboard();
  const recruitmentDashboardQuery = useRecruitmentDashboard();
  const leaveRequestsQuery = useLeaveRequests();
  const milestonesQuery = useUpcomingMilestones();
  const recentActivityQuery = useEmployeeRecentActivity();
  const organizationQuery = useEmployeeOrganization();

  const employees = employeesQuery.data ?? [];
  const totalEmployees = employees.length;

  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const newEmployees = employees.filter((e) => {
    const start = e.startDate || e.createdAt;
    if (!start) return false;
    const d = new Date(start);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  const attendanceRaw: Record<string, any> = (attendanceDashboardQuery.data ??
    {}) as Record<string, any>;
  const recruitmentRaw: Record<string, any> = (recruitmentDashboardQuery.data ??
    {}) as Record<string, any>;

  const presentToday = Number(
    attendanceRaw.presentToday ??
      attendanceRaw.present ??
      attendanceRaw.presentCount ??
      0,
  );
  const absentToday = Number(
    attendanceRaw.absentToday ??
      attendanceRaw.absent ??
      attendanceRaw.absentCount ??
      0,
  );
  const onLeaveCount = Number(
    attendanceRaw.onLeave ?? attendanceRaw.onLeaveCount ?? 0,
  );
  const pendingLeaveCount = Number(
    attendanceRaw.pendingLeave ?? attendanceRaw.pendingLeaveCount ?? 0,
  );

  const leaveRequests = leaveRequestsQuery.data ?? [];
  const pendingLeaveFromRequests = leaveRequests.filter(
    (l) =>
      String(l.status) === "Pending Manager Approval" ||
      String(l.status) === "Pending HR Approval",
  ).length;
  const approvedLeaveFromRequests = leaveRequests.filter(
    (l) => String(l.status) === "Approved",
  ).length;

  const openVacancies = Number(
    recruitmentRaw.openVacancies ?? recruitmentRaw.openVacancyCount ?? 0,
  );
  const applicants = Number(
    recruitmentRaw.applicants ?? recruitmentRaw.applicantCount ?? 0,
  );
  const pipeline = recruitmentRaw.pipeline ?? [];

  const milestones = milestonesQuery.data ?? [];
  const upcomingBirthdays = milestones.filter((m) => {
    const detail = String(m.detail ?? "");
    return detail.toLowerCase().includes("birthday");
  }).length;

  const recentActivity = recentActivityQuery.data ?? [];

  const departments = organizationQuery.data?.departments ?? [];
  const departmentData = departments.map((dept) => {
    const deptName = String(dept.name ?? "");
    const count = employees.filter((e) => {
      const deptVal = e.department;
      const deptStr =
        typeof deptVal === "string" ? deptVal : (deptVal?.name ?? "");
      return deptStr === deptName;
    }).length;
    return { name: deptName, employees: count };
  });

  const pendingApprovals = leaveRequests
    .filter(
      (l) =>
        String(l.status) === "Pending Manager Approval" ||
        String(l.status) === "Pending HR Approval",
    )
    .slice(0, 5)
    .map((l) => ({
      type: "Leave",
      person: l.emp ?? "Employee",
      detail: `${String(l.type)} · ${l.from ?? ""}–${l.to ?? ""}`,
      age: l.startDate ?? "",
      path: staffPaths.leave,
      icon: <CalendarCheck2 className="size-4" />,
    }));

  const headcountData: Array<{ month: string; employees: number }> = [];
  const monthLabels = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today);
    d.setMonth(d.getMonth() - i);
    const mIdx = d.getMonth();
    const mLabel = monthLabels[mIdx];
    const count = employees.filter((e) => {
      const start = e.startDate || e.createdAt;
      if (!start) return false;
      const sd = new Date(start);
      return sd.getMonth() === mIdx && sd.getFullYear() === d.getFullYear();
    }).length;
    headcountData.push({ month: mLabel, employees: count });
  }

  const recruitmentStages: Array<{ name: string; count: number }> =
    pipeline.map((stage: any) => ({
      name: String(stage.stage ?? "Unknown"),
      count: Number(stage.count ?? 0),
    }));

  const attendanceDays = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const attendanceData = attendanceDays.map((day, idx) => {
    const key = `day${idx}`;
    const val = attendanceRaw[key] ?? attendanceRaw[day];
    return {
      day,
      attendance: typeof val === "number" ? val : 90 - idx * 2,
    };
  });

  const metrics = [
    {
      title: "Total Employees",
      value: String(totalEmployees),
      desc: "Workforce headcount",
      icon: <Users className="size-5" />,
      variant: "primary",
    },
    {
      title: "New Employees",
      value: String(newEmployees),
      desc: "This month",
      icon: <UserPlus className="size-5" />,
      variant: "info",
    },
    {
      title: "Present Today",
      value: String(presentToday),
      desc: "Attendance",
      icon: <UserRoundCheck className="size-5" />,
      variant: "success",
    },
    {
      title: "Absent Today",
      value: String(absentToday),
      desc: "No record",
      icon: <UserRoundX className="size-5" />,
      variant: "error",
    },
    {
      title: "On Leave",
      value: String(approvedLeaveFromRequests || onLeaveCount),
      desc: "Approved leave",
      icon: <CalendarCheck2 className="size-5" />,
      variant: "warning",
    },
    {
      title: "Pending Leave",
      value: String(pendingLeaveFromRequests || pendingLeaveCount),
      desc: "Awaiting decision",
      icon: <CalendarClock className="size-5" />,
      variant: "warning",
    },
    {
      title: "Open Vacancies",
      value: String(openVacancies),
      desc: `${applicants} applicants`,
      icon: <BriefcaseBusiness className="size-5" />,
      variant: "info",
    },
    {
      title: "Upcoming Birthdays",
      value: String(upcomingBirthdays),
      desc: "Next 14 days",
      icon: <Cake className="size-5" />,
      variant: "primary",
    },
    {
      title: "Upcoming Reviews",
      value: String(
        milestones.filter(
          (m) =>
            String(m.detail ?? "")
              .toLowerCase()
              .includes("review") ||
            String(m.detail ?? "")
              .toLowerCase()
              .includes("probation"),
        ).length,
      ),
      desc: "This cycle",
      icon: <ClipboardCheck className="size-5" />,
      variant: "default",
    },
    {
      title: "Payroll Status",
      value: "Review",
      desc: "Nov 2026 · HR stage",
      icon: <WalletCards className="size-5" />,
      variant: "warning",
    },
  ] satisfies ComponentProps<typeof StatCard>[];

  const isLoading =
    employeesQuery.isLoading ||
    attendanceDashboardQuery.isLoading ||
    recruitmentDashboardQuery.isLoading ||
    leaveRequestsQuery.isLoading ||
    milestonesQuery.isLoading ||
    recentActivityQuery.isLoading ||
    organizationQuery.isLoading;

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
          description="Here's what's happening across your workforce today."
        >
          {renderHeaderActions()}
        </PageHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-base-content/65">{dateLabel}</p>
          <span className="badge badge-ghost gap-1.5 ">
            <CircleAlert className="size-3.5" />
            Loading workforce data…
          </span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 2xl:grid-cols-5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <StatCard
              key={i}
              title={`Stat ${i}`}
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
        description="Here's what's happening across your workforce today."
      >
        {renderHeaderActions()}
      </PageHeader>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-base-content/65">{dateLabel}</p>
        <span className="badge badge-ghost gap-1.5 ">
          <CircleAlert className="size-3.5" />
          Live workforce data
        </span>
      </div>

      <section
        aria-label="Workforce summary"
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4"
      >
        {metrics.map((metric) => (
          <StatCard key={metric.title} {...metric} />
        ))}
      </section>

      <div className="grid gap-4 xl:grid-cols-12">
        <DashboardPanel
          title="Headcount trend"
          description="Last 6 months · employee starts"
          className="xl:col-span-8"
        >
          <div
            role="img"
            aria-label="Headcount trend from employee start dates"
            className="mt-5 h-64 w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={headcountData}
                margin={{ top: 8, right: 12, left: -12, bottom: 0 }}
              >
                <CartesianGrid
                  stroke="var(--color-base-300)"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "var(--color-base-content)" }}
                />
                <YAxis
                  domain={[
                    0,
                    Math.max(...headcountData.map((d) => d.employees), 10) + 10,
                  ]}
                  ticks={
                    headcountData.length > 0
                      ? [0, Math.max(...headcountData.map((d) => d.employees))]
                      : [0, 10]
                  }
                  axisLine={false}
                  tickLine={false}
                  width={42}
                  tick={{ fontSize: 11, fill: "var(--color-base-content)" }}
                />
                <Tooltip content={<ChartTooltip />} />
                <Line
                  type="monotone"
                  dataKey="employees"
                  name="headcount"
                  stroke="var(--color-primary)"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "var(--color-primary)" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </DashboardPanel>

        <DashboardPanel
          title="By department"
          description="Current workforce"
          className="xl:col-span-4"
        >
          <div
            role="img"
            aria-label="Employee count by department"
            className="mt-5 h-64 w-full"
          >
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
                  width={108}
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
          </div>
        </DashboardPanel>
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <DashboardPanel
          title="Pending approvals"
          description="Items waiting for review"
          action={
            <span className="badge badge-warning badge-sm">
              {pendingApprovals.length}
            </span>
          }
          className="xl:col-span-7"
        >
          <div className="mt-3 divide-y space-y-2 divide-base-200">
            {pendingApprovals.length > 0 ? (
              pendingApprovals.map((item) => (
                <Link
                  key={`${item.type}-${item.person}`}
                  to={item.path}
                  className="group flex items-center gap-3 py-3 transition-colors  focus-visible:rounded-box focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ring px-4 fade rounded-md hover:bg-primary/20"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-base-200 text-base-content/80">
                    {item.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span className=" font-medium text-base-content/80">
                        {item.type}:
                      </span>
                      <span className=" font-semibold text-base-content">
                        {item.person}
                      </span>
                    </span>
                    <span className="block truncate text-sm  text-base-content/80">
                      {item.detail}
                    </span>
                  </span>
                  <span className="shrink-0  text-base-content/80">
                    {item.age}
                  </span>
                </Link>
              ))
            ) : (
              <p className="text-base-content/80 text-sm py-4 text-center">
                No pending approvals
              </p>
            )}
          </div>
        </DashboardPanel>

        <div className="space-y-4 xl:col-span-5">
          <DashboardPanel
            title="Attendance this week"
            description="Daily attendance"
            action={
              <Link
                to={staffPaths.attendance}
                className="link link-primary  focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Open attendance
              </Link>
            }
          >
            <div
              role="img"
              aria-label="Attendance percentages for this week"
              className="mt-4 h-40 w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={attendanceData}
                  margin={{ top: 4, right: 4, left: -26, bottom: 0 }}
                >
                  <CartesianGrid
                    stroke="var(--color-base-300)"
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "var(--color-base-content)" }}
                  />
                  <YAxis
                    domain={[70, 100]}
                    ticks={[70, 80, 90, 100]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "var(--color-base-content)" }}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar
                    dataKey="attendance"
                    name="attendance"
                    fill="var(--color-primary)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={28}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </DashboardPanel>

          <DashboardPanel
            title="Recruitment pipeline"
            description={`${openVacancies} published vacancies`}
            action={
              <Link
                to={staffPaths.organization}
                className="link link-primary  focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                View organization
              </Link>
            }
          >
            <div className="mt-4 space-y-3">
              {recruitmentStages.length > 0 ? (
                recruitmentStages.map((stage) => {
                  const maxCount = Math.max(
                    ...recruitmentStages.map((s) => s.count),
                    1,
                  );
                  return (
                    <div
                      key={stage.name}
                      className="grid grid-cols-[7rem_1fr_2rem] items-center gap-3 "
                    >
                      <span className="truncate text-base-content/80">
                        {stage.name}
                      </span>
                      <span className="h-2 overflow-hidden rounded-full bg-base-200">
                        <span
                          className="block h-full rounded-full bg-primary"
                          style={{
                            width: `${(stage.count / maxCount) * 100}%`,
                          }}
                        />
                      </span>
                      <span className="text-right font-medium tabular-nums">
                        {stage.count}
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="text-base-content/80 text-sm py-4 text-center">
                  No recruitment data
                </p>
              )}
            </div>
          </DashboardPanel>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <DashboardPanel
          title="Upcoming milestones"
          description="Birthdays and important dates"
          action={
            <Link
              to={staffPaths.colleagues}
              className="link link-primary  focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              View colleagues
            </Link>
          }
        >
          <div className="mt-3 divide-y divide-base-200">
            {milestones.length > 0 ? (
              milestones.map((milestone) => (
                <div
                  key={String(milestone.name ?? milestone.id ?? Math.random())}
                  className="flex items-center gap-3 py-3"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10  font-semibold text-primary">
                    {String(
                      milestone.initials ?? milestone.name?.charAt(0) ?? "?",
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {milestone.name}
                    </span>
                    <span className="block  text-base-content/80">
                      {milestone.detail}
                    </span>
                  </span>
                  {String(milestone.icon).toLowerCase() === "cake" ? (
                    <Cake className="size-4 text-secondary" />
                  ) : (
                    <FileText className="size-4 text-base-content/80" />
                  )}
                </div>
              ))
            ) : (
              <p className="text-base-content/80 text-sm py-4 text-center">
                No upcoming milestones
              </p>
            )}
          </div>
        </DashboardPanel>

        <DashboardPanel
          title="Recent HR activity"
          description="Latest updates from your team"
          action={<Activity className="size-4 text-base-content/80" />}
        >
          <ol className="mt-3 divide-y divide-base-200">
            {recentActivity.length > 0 ? (
              recentActivity.map((item, index) => (
                <li
                  key={String(item.text ?? item.id ?? index)}
                  className="flex items-start gap-3 py-3"
                >
                  <span
                    className={`mt-1 flex size-6 shrink-0 items-center justify-center rounded-full ${
                      index === 0
                        ? "bg-success/10 text-success"
                        : "bg-base-200 text-base-content/80"
                    }`}
                  >
                    {index === 0 ? (
                      <Check className="size-3.5" />
                    ) : index === 2 ? (
                      <ArrowUpRight className="size-3.5" />
                    ) : (
                      <ArrowDownRight className="size-3.5" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1 text-sm leading-5 text-base-content/80">
                    {item.text ?? item.description ?? String(item)}
                  </span>
                  <span className="shrink-0 pt-0.5  text-base-content/80">
                    {item.time ?? item.createdAt ?? ""}
                  </span>
                </li>
              ))
            ) : (
              <li className="py-3">
                <p className="text-base-content/80 text-sm text-center">
                  No recent activity
                </p>
              </li>
            )}
          </ol>
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
