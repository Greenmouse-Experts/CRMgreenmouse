import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import PageLoader from "@/components/layout/PageLoader";
import ColleagueAvatar from "./-components/ColleagueAvatar";
import ColleagueStatusBadge from "./-components/ColleagueStatusBadge";
import {
  formatDeptLabel,
  toUiColleague,
  UNKNOWN,
} from "./-components/colleagueUtils";
import {
  useEmployeeColleague,
  useEmployeeColleagues,
} from "@/api/employeesApi";
import { usePortalOrganization } from "@/api/organizationApi";
import {
  ArrowLeft,
  BadgeInfo,
  Briefcase,
  Building2,
  Hash,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  UserCheck,
  Users,
} from "lucide-react";

export const Route = createFileRoute("/staff/staffs/$id")({
  component: ColleagueDetailPage,
});

function ColleagueDetailPage() {
  const { id } = Route.useParams();

  const colleagueQuery = useEmployeeColleague(id);
  const portalOrgQuery = usePortalOrganization();

  const colleague = useMemo(
    () => (colleagueQuery.data ? toUiColleague(colleagueQuery.data) : null),
    [colleagueQuery.data],
  );

  const sameDeptQuery = useEmployeeColleagues(
    {
      department: colleague?.rawDept,
      limit: 7,
    },
    { enabled: Boolean(colleague?.rawDept) },
  );

  const departmentInfo = useMemo(() => {
    if (!colleague?.dept || colleague.dept === UNKNOWN) return null;
    const rawKey = colleague.rawDept?.trim().toLowerCase();
    const labelKey = colleague.dept.trim().toLowerCase();
    return (
      (portalOrgQuery.data?.departments ?? []).find((dept) => {
        const name = String(dept.name ?? "")
          .trim()
          .toLowerCase();
        return (
          (rawKey && name === rawKey) ||
          name === labelKey ||
          formatDeptLabel(dept.name).toLowerCase() === labelKey
        );
      }) ?? null
    );
  }, [portalOrgQuery.data?.departments, colleague]);

  const teammates = useMemo(() => {
    if (!colleague) return [];
    return (sameDeptQuery.data?.data ?? [])
      .map(toUiColleague)
      .filter((member) => member.id !== colleague.id)
      .slice(0, 6);
  }, [sameDeptQuery.data?.data, colleague]);

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/staff/staffs"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-base-content/75 hover:text-primary transition-colors"
        >
          <ArrowLeft className="size-4" />
          <span>Back to Colleagues</span>
        </Link>
      </div>

      <PageLoader
        query={colleagueQuery}
        loadingText="Loading colleague details..."
      >
        {() => {
          if (!colleague) {
            return (
              <div className="card bg-base-100 border border-base-200/80 p-12 text-center space-y-3 rounded-2xl shadow-xs max-w-xl mx-auto">
                <div className="size-12 rounded-full bg-base-200 text-base-content/75 flex items-center justify-center mx-auto">
                  <Users className="size-5" />
                </div>
                <h2 className="text-lg font-bold text-base-content">
                  Colleague Not Found
                </h2>
                <p className="text-sm text-base-content/75">
                  This colleague record could not be found in your organization
                  directory or is no longer active.
                </p>
                <div className="pt-2">
                  <Link
                    to="/staff/staffs"
                    className="btn btn-sm bg-primary text-white border-0 rounded-xl"
                  >
                    Return to Colleagues
                  </Link>
                </div>
              </div>
            );
          }

          const infoItems = [
            {
              label: "First Name",
              value: colleague.firstName || UNKNOWN,
              icon: <User className="size-4 text-primary" />,
            },
            ...(colleague.middleName
              ? [
                  {
                    label: "Middle Name",
                    value: colleague.middleName,
                    icon: <User className="size-4 text-primary" />,
                  },
                ]
              : []),
            {
              label: "Last Name",
              value: colleague.lastName || UNKNOWN,
              icon: <User className="size-4 text-primary" />,
            },
            {
              label: "Employee ID",
              value: colleague.employeeNumber || UNKNOWN,
              icon: <Hash className="size-4 text-primary" />,
              mono: true,
            },
            {
              label: "Work Email",
              value: colleague.email || UNKNOWN,
              icon: <Mail className="size-4 text-primary" />,
              href:
                colleague.email && colleague.email !== UNKNOWN
                  ? `mailto:${colleague.email}`
                  : undefined,
            },
            {
              label: "Job Title",
              value: colleague.title || UNKNOWN,
              icon: <Briefcase className="size-4 text-primary" />,
            },
            {
              label: "Department",
              value: colleague.dept || UNKNOWN,
              icon: <Building2 className="size-4 text-primary" />,
            },
            {
              label: "Work Location",
              value: colleague.location || UNKNOWN,
              icon: <MapPin className="size-4 text-primary" />,
            },
            ...(colleague.type && colleague.type !== UNKNOWN
              ? [
                  {
                    label: "Employment Type",
                    value: colleague.type,
                    icon: <BadgeInfo className="size-4 text-primary" />,
                  },
                ]
              : []),
            ...(colleague.phone && colleague.phone !== UNKNOWN
              ? [
                  {
                    label: "Phone",
                    value: colleague.phone,
                    icon: <Phone className="size-4 text-primary" />,
                    mono: true,
                  },
                ]
              : []),
          ];

          return (
            <div className="space-y-6">
              {/* Hero Header Card */}
              <div className="card bg-base-100 border border-base-200/80 shadow-xs rounded-2xl p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 min-w-0">
                    <ColleagueAvatar
                      name={colleague.name}
                      src={colleague.profilePhotoUrl}
                      size="lg"
                    />
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h1 className="text-xl sm:text-2xl font-bold text-base-content truncate">
                          {colleague.name}
                        </h1>
                        {(colleague.hasStatus || colleague.onLeave) && (
                          <ColleagueStatusBadge
                            status={colleague.status}
                            onLeave={colleague.onLeave}
                          />
                        )}
                      </div>

                      <p className="text-sm text-base-content/80 flex flex-wrap items-center gap-x-2 gap-y-1">
                        {colleague.title !== UNKNOWN && (
                          <span className="font-medium text-base-content">
                            {colleague.title}
                          </span>
                        )}
                        {colleague.title !== UNKNOWN &&
                          colleague.dept !== UNKNOWN && <span>·</span>}
                        {colleague.dept !== UNKNOWN && (
                          <span>{colleague.dept}</span>
                        )}
                        {colleague.location !== UNKNOWN && (
                          <>
                            <span>·</span>
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="size-3.5 text-base-content/60" />
                              {colleague.location}
                            </span>
                          </>
                        )}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs">
                        <span className="rounded-md bg-base-200/80 px-2 py-0.5 font-mono font-medium text-base-content/80">
                          ID: {colleague.employeeNumber}
                        </span>
                        {colleague.email !== UNKNOWN && (
                          <span className="text-base-content/75 truncate">
                            {colleague.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {colleague.email !== UNKNOWN && (
                    <a
                      href={`mailto:${colleague.email}`}
                      className="btn btn-sm bg-primary text-white hover:bg-primary/90 border-0 rounded-xl gap-1.5 shrink-0 self-start sm:self-center"
                    >
                      <Mail className="size-4" />
                      <span>Send Email</span>
                    </a>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Basic Directory Information */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="card bg-base-100 border border-base-200/80 shadow-xs rounded-2xl p-6 space-y-5">
                    <div className="flex items-center justify-between gap-2 pb-3 border-b border-base-200">
                      <div className="flex items-center gap-2">
                        <User className="size-5 text-primary" />
                        <h2 className="text-base font-bold text-base-content">
                          Basic Directory Details
                        </h2>
                      </div>
                      <span className="text-xs text-base-content/60">
                        Colleague profile
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {infoItems.map((item) => (
                        <div
                          key={item.label}
                          className="rounded-xl border border-base-200/80 bg-base-200/25 px-4 py-3 space-y-1"
                        >
                          <div className="flex items-center gap-1.5 text-xs font-medium text-base-content/65">
                            {item.icon}
                            <span>{item.label}</span>
                          </div>
                          {item.href ? (
                            <a
                              href={item.href}
                              className="block text-sm font-semibold text-primary hover:underline truncate"
                            >
                              {item.value}
                            </a>
                          ) : (
                            <p
                              className={`text-sm font-semibold text-base-content truncate ${
                                item.mono ? "font-mono" : ""
                              }`}
                            >
                              {item.value}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex items-start gap-2.5 rounded-xl bg-base-200/40 border border-base-200 p-3.5 text-xs text-base-content/75">
                      <ShieldCheck className="size-4 text-primary shrink-0 mt-0.5" />
                      <span>
                        Only basic colleague directory fields (name, work
                        email, department, role, and location) are displayed
                        here. Private HR, contact, and compensation records are
                        not shared in the employee directory.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Department & Teammates Sidebar */}
                <div className="space-y-6">
                  <div className="card bg-base-100 border border-base-200/80 shadow-xs rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between gap-2 pb-3 border-b border-base-200">
                      <div className="flex items-center gap-2">
                        <Building2 className="size-5 text-primary" />
                        <h2 className="text-base font-bold text-base-content">
                          Department Overview
                        </h2>
                      </div>
                      <Link
                        to="/staff/organization"
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Organization
                      </Link>
                    </div>

                    {colleague.dept === UNKNOWN ? (
                      <p className="text-sm text-base-content/70">
                        No department assigned to this colleague.
                      </p>
                    ) : (
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-base-content/70">
                            Department
                          </span>
                          <span className="font-semibold text-base-content">
                            {colleague.dept}
                          </span>
                        </div>
                        {departmentInfo?.code && (
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-base-content/70">Code</span>
                            <span className="rounded-md bg-base-200 px-2 py-0.5 font-mono text-xs font-semibold">
                              {departmentInfo.code}
                            </span>
                          </div>
                        )}
                        {departmentInfo?.head &&
                          departmentInfo.head !== "Unassigned" && (
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-base-content/70 inline-flex items-center gap-1">
                                <UserCheck className="size-3.5" />
                                Dept Lead
                              </span>
                              <span className="font-medium text-base-content">
                                {departmentInfo.head}
                              </span>
                            </div>
                          )}
                        {departmentInfo?.location && (
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-base-content/70">
                              Primary Hub
                            </span>
                            <span className="font-medium text-base-content">
                              {departmentInfo.location}
                            </span>
                          </div>
                        )}
                        {departmentInfo?.description && (
                          <p className="pt-2 border-t border-base-200 text-xs text-base-content/75">
                            {departmentInfo.description}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {colleague.dept !== UNKNOWN && (
                    <div className="card bg-base-100 border border-base-200/80 shadow-xs rounded-2xl p-5 space-y-4">
                      <div className="flex items-center justify-between gap-2 pb-3 border-b border-base-200">
                        <div className="flex items-center gap-2">
                          <Users className="size-5 text-primary" />
                          <h2 className="text-base font-bold text-base-content">
                            Same Department
                          </h2>
                        </div>
                        <span className="text-xs text-base-content/60">
                          {colleague.dept}
                        </span>
                      </div>

                      {sameDeptQuery.isLoading ? (
                        <p className="text-xs text-base-content/70">
                          Loading teammates...
                        </p>
                      ) : teammates.length === 0 ? (
                        <p className="text-xs text-base-content/70">
                          No other colleagues listed in {colleague.dept}.
                        </p>
                      ) : (
                        <ul className="space-y-2">
                          {teammates.map((member) => (
                            <li key={member.id}>
                              <Link
                                to="/staff/staffs/$id"
                                params={{ id: member.id }}
                                className="flex items-center gap-3 rounded-xl border border-base-200/80 bg-base-200/20 px-3 py-2.5 hover:bg-base-200/60 transition-colors"
                              >
                                <ColleagueAvatar
                                  name={member.name}
                                  src={member.profilePhotoUrl}
                                  size="sm"
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-semibold text-base-content truncate">
                                    {member.name}
                                  </p>
                                  <p className="text-xs text-base-content/70 truncate">
                                    {member.title !== UNKNOWN
                                      ? member.title
                                      : member.email}
                                  </p>
                                </div>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        }}
      </PageLoader>
    </div>
  );
}
