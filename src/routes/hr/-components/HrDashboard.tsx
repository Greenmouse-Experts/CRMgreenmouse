import type { ComponentProps, ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Cake,
  CalendarCheck2,
  CalendarClock,
  Check,
  CircleAlert,
  ClipboardCheck,
  Clock3,
  FileText,
  UserPlus,
  Users,
  UserRoundCheck,
  UserRoundX,
  WalletCards,
  BriefcaseBusiness,
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

const hrPaths: Record<
  "employees" | "reports" | "attendance" | "recruitment" | "leave" | "payroll",
  string
> = {
  employees: "/hr/employees",
  reports: "/hr/reports",
  attendance: "/hr/attendance-time",
  recruitment: "/hr/recruitment",
  leave: "/hr/leave",
  payroll: "/hr/payroll",
};

const metrics = [
  {
    title: "Total Employees",
    value: "252",
    desc: "+4.2% vs last month",
    icon: <Users className="size-5" />,
    variant: "primary",
  },
  {
    title: "New Employees",
    value: "14",
    desc: "This month",
    icon: <UserPlus className="size-5" />,
    variant: "info",
  },
  {
    title: "Present Today",
    value: "226",
    desc: "89.7% attendance",
    icon: <UserRoundCheck className="size-5" />,
    variant: "success",
  },
  {
    title: "Absent Today",
    value: "8",
    desc: "No leave record",
    icon: <UserRoundX className="size-5" />,
    variant: "error",
  },
  {
    title: "On Leave",
    value: "18",
    desc: "Approved leave",
    icon: <CalendarCheck2 className="size-5" />,
    variant: "warning",
  },
  {
    title: "Pending Leave",
    value: "7",
    desc: "Awaiting decision",
    icon: <CalendarClock className="size-5" />,
    variant: "warning",
  },
  {
    title: "Open Vacancies",
    value: "4",
    desc: "150 applicants",
    icon: <BriefcaseBusiness className="size-5" />,
    variant: "info",
  },
  {
    title: "Upcoming Birthdays",
    value: "5",
    desc: "Next 14 days",
    icon: <Cake className="size-5" />,
    variant: "primary",
  },
  {
    title: "Upcoming Reviews",
    value: "23",
    desc: "Q4 cycle",
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

const headcountData = [
  { month: "Jun", employees: 226 },
  { month: "Jul", employees: 231 },
  { month: "Aug", employees: 237 },
  { month: "Sep", employees: 242 },
  { month: "Oct", employees: 248 },
  { month: "Nov", employees: 252 },
];

const departmentData = [
  { name: "Sales", employees: 48 },
  { name: "Engineering", employees: 72 },
  { name: "Finance", employees: 21 },
  { name: "Operations", employees: 34 },
  { name: "Marketing", employees: 26 },
  { name: "Customer Success", employees: 39 },
  { name: "HR", employees: 12 },
];

const attendanceData = [
  { day: "Mon", attendance: 94 },
  { day: "Tue", attendance: 91 },
  { day: "Wed", attendance: 88 },
  { day: "Thu", attendance: 90 },
  { day: "Fri", attendance: 90 },
];

const approvals = [
  {
    type: "Leave",
    person: "Chiamaka Eze",
    detail: "Annual leave · 5 days",
    age: "2h",
    path: hrPaths.leave,
    icon: <CalendarCheck2 className="size-4" />,
  },
  {
    type: "Attendance",
    person: "Peter Okon",
    detail: "Clock-in correction · Nov 10",
    age: "5h",
    path: hrPaths.attendance,
    icon: <Clock3 className="size-4" />,
  },
  {
    type: "Vacancy",
    person: "Finance",
    detail: "Payroll Specialist requisition",
    age: "1d",
    path: hrPaths.recruitment,
    icon: <BriefcaseBusiness className="size-4" />,
  },
  {
    type: "Payroll",
    person: "November run",
    detail: "Awaiting HR review",
    age: "1d",
    path: hrPaths.payroll,
    icon: <WalletCards className="size-4" />,
  },
  {
    type: "Offer",
    person: "Tolu Bakare",
    detail: "Senior Backend Engineer offer",
    age: "2d",
    path: hrPaths.recruitment,
    icon: <UserPlus className="size-4" />,
  },
];

const recruitmentStages = [
  { name: "Applied", count: 17 },
  { name: "Screening", count: 17 },
  { name: "Shortlisted", count: 10 },
  { name: "Interview", count: 17 },
  { name: "Assessment", count: 10 },
  { name: "Offer", count: 10 },
  { name: "Hired", count: 10 },
];

const milestones = [
  { initials: "AO", name: "Amara Okafor", detail: "Birthday · Nov 14", icon: "cake" },
  { initials: "TA", name: "Tunde Adeyemi", detail: "Birthday · Nov 15", icon: "cake" },
  { initials: "CE", name: "Chiamaka Eze", detail: "Birthday · Nov 16", icon: "cake" },
  {
    initials: "ZM",
    name: "Zainab Musa",
    detail: "Contract ends · Dec 04",
    icon: "contract",
  },
  {
    initials: "FB",
    name: "Fatima Bello",
    detail: "Probation ends · Nov 20",
    icon: "contract",
  },
];

const recentActivity = [
  {
    text: "Grace Danjuma approved leave for Kwame Asante",
    time: "10 min ago",
  },
  {
    text: "System generated employee ID KNV-1021 for Nkechi Ani",
    time: "1h ago",
  },
  {
    text: "Adaeze Ike updated salary record for Zainab Musa (promotion)",
    time: "3h ago",
  },
  {
    text: "Samuel Johnson scheduled interview with Kofi Boateng",
    time: "Yesterday",
  },
  {
    text: "System flagged 3 contracts expiring within 30 days",
    time: "Yesterday",
  },
];

const quickActions = [
  { label: "Add employee", path: hrPaths.employees, icon: <UserPlus /> },
  {
    label: "Create vacancy",
    path: hrPaths.recruitment,
    icon: <BriefcaseBusiness />,
  },
  { label: "Review leave", path: hrPaths.leave, icon: <CalendarCheck2 /> },
  { label: "Open payroll", path: hrPaths.payroll, icon: <WalletCards /> },
  { label: "Generate reports", path: hrPaths.reports, icon: <FileText /> },
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
            <p className="mt-1 text-xs text-base-content/60">{description}</p>
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
    <div className="rounded-lg border border-base-300 bg-base-100 px-3 py-2 text-xs shadow-lg">
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

export default function HrDashboard() {
  const today = new Date();
  const greeting =
    today.getHours() < 12
      ? "Good morning"
      : today.getHours() < 17
        ? "Good afternoon"
        : "Good evening";
  const dateLabel = today.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-5 pb-8">
      <PageHeader
        title={`${greeting}, Grace`}
        description="Here's what's happening across your workforce today."
      >
        <Link to={hrPaths.reports} className="btn btn-outline btn-sm sm:btn-md">
          <FileText className="size-4" />
          Generate report
        </Link>
        <Link
          to={hrPaths.employees}
          className="btn btn-primary btn-sm sm:btn-md"
        >
          <UserPlus className="size-4" />
          Add employee
        </Link>
      </PageHeader>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-base-content/65">{dateLabel}</p>
        <span className="badge badge-ghost gap-1.5 text-xs">
          <CircleAlert className="size-3.5" />
          Sample workforce data
        </span>
      </div>

      <section
        aria-label="Workforce summary"
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5"
      >
        {metrics.map((metric) => (
          <StatCard key={metric.title} {...metric} />
        ))}
      </section>

      <div className="grid gap-4 xl:grid-cols-12">
        <DashboardPanel
          title="Headcount trend"
          description="Last 6 months · illustrative figures"
          className="xl:col-span-8"
        >
          <div
            role="img"
            aria-label="Illustrative headcount trend from June to November"
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
                  domain={[200, 280]}
                  ticks={[200, 220, 240, 260, 280]}
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
          description="Items waiting for your review"
          action={<span className="badge badge-warning badge-sm">5</span>}
          className="xl:col-span-7"
        >
          <div className="mt-3 divide-y divide-base-200">
            {approvals.map((item) => (
              <Link
                key={`${item.type}-${item.person}`}
                to={item.path}
                className="group flex items-center gap-3 py-3 transition-colors hover:bg-base-200/50 focus-visible:rounded-box focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-base-200 text-base-content/70">
                  {item.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="text-xs font-medium text-base-content/60">
                      {item.type}
                    </span>
                    <span className="text-sm font-semibold text-base-content">
                      {item.person}
                    </span>
                  </span>
                  <span className="block truncate text-xs text-base-content/60">
                    {item.detail}
                  </span>
                </span>
                <span className="shrink-0 text-xs text-base-content/50">
                  {item.age}
                </span>
              </Link>
            ))}
          </div>
        </DashboardPanel>

        <div className="space-y-4 xl:col-span-5">
          <DashboardPanel
            title="Attendance this week"
            description="Illustrative daily attendance"
            action={
              <Link
                to={hrPaths.attendance}
                className="link link-primary text-xs focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Open attendance
              </Link>
            }
          >
            <div
              role="img"
              aria-label="Illustrative attendance percentages for this week"
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
            description="3 published vacancies"
            action={
              <Link
                to={hrPaths.recruitment}
                className="link link-primary text-xs focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                View pipeline
              </Link>
            }
          >
            <div className="mt-4 space-y-3">
              {recruitmentStages.map((stage) => (
                <div
                  key={stage.name}
                  className="grid grid-cols-[7rem_1fr_2rem] items-center gap-3 text-xs"
                >
                  <span className="truncate text-base-content/70">
                    {stage.name}
                  </span>
                  <span className="h-2 overflow-hidden rounded-full bg-base-200">
                    <span
                      className="block h-full rounded-full bg-primary"
                      style={{
                        width: `${(stage.count / 17) * 100}%`,
                      }}
                    />
                  </span>
                  <span className="text-right font-medium tabular-nums">
                    {stage.count}
                  </span>
                </div>
              ))}
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
              to={hrPaths.employees}
              className="link link-primary text-xs focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              View employees
            </Link>
          }
        >
          <div className="mt-3 divide-y divide-base-200">
            {milestones.map((milestone) => (
              <div
                key={milestone.name}
                className="flex items-center gap-3 py-3"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {milestone.initials}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {milestone.name}
                  </span>
                  <span className="block text-xs text-base-content/60">
                    {milestone.detail}
                  </span>
                </span>
                {milestone.icon === "cake" ? (
                  <Cake className="size-4 text-secondary" />
                ) : (
                  <FileText className="size-4 text-base-content/50" />
                )}
              </div>
            ))}
          </div>
        </DashboardPanel>

        <DashboardPanel
          title="Recent HR activity"
          description="Latest updates from your team"
          action={<Activity className="size-4 text-base-content/50" />}
        >
          <ol className="mt-3 divide-y divide-base-200">
            {recentActivity.map((item, index) => (
              <li
                key={item.text}
                className="flex items-start gap-3 py-3"
              >
                <span
                  className={`mt-1 flex size-6 shrink-0 items-center justify-center rounded-full ${
                    index === 0
                      ? "bg-success/10 text-success"
                      : "bg-base-200 text-base-content/50"
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
                  {item.text}
                </span>
                <span className="shrink-0 pt-0.5 text-xs text-base-content/50">
                  {item.time}
                </span>
              </li>
            ))}
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
              <span className="size-4">{action.icon}</span>
              {action.label}
            </Link>
          ))}
        </div>
      </DashboardPanel>
    </div>
  );
}
