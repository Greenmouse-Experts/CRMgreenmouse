import { Link, useNavigate } from "@tanstack/react-router";
import CustomTable, { type columnType } from "@/components/tables/CustomTable";
import ColleagueAvatar from "./ColleagueAvatar";
import ColleagueStatusBadge from "./ColleagueStatusBadge";
import type { Colleague } from "./types";
import { Eye } from "lucide-react";

interface ColleagueTableViewProps {
  colleagues: Colleague[];
}

export default function ColleagueTableView({
  colleagues,
}: ColleagueTableViewProps) {
  const navigate = useNavigate();

  if (colleagues.length === 0) {
    return null;
  }

  const hasType = colleagues.some((c) => c.type && c.type !== "—");
  const hasPhone = colleagues.some((c) => c.phone && c.phone !== "—");

  const columns: columnType<Colleague>[] = [
    {
      key: "name",
      label: "Colleague",
      render: (_value: string, emp: Colleague) => (
        <div className="flex items-center gap-3">
          <ColleagueAvatar
            name={emp.name}
            src={emp.profilePhotoUrl}
            size="sm"
          />
          <div className="min-w-0">
            <p className="font-semibold text-base-content truncate group-hover:text-primary">
              {emp.name}
            </p>
            <div className="flex items-center gap-1.5 text-base-content/80 truncate">
              {emp.title !== "—" && <span>{emp.title}</span>}
              {emp.title !== "—" && emp.email !== "—" && <span>·</span>}
              {emp.email !== "—" && (
                <span className="truncate">{emp.email}</span>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "employeeNumber",
      label: "Employee ID",
      render: (_value: string, emp: Colleague) => (
        <span className="bg-base-200/80 px-2 py-0.5 rounded-md font-mono text-base-content/80 font-medium">
          {emp.employeeNumber ||
            (emp.id && emp.id.length > 8 ? emp.id.slice(0, 8) : emp.id)}
        </span>
      ),
    },
    {
      key: "dept",
      label: "Department",
      render: (value: string) => (
        <span className="font-medium text-base-content/80">{value}</span>
      ),
    },
    ...(hasType
      ? [
          {
            key: "type",
            label: "Type",
            render: (value: string) => (
              <span className="text-base-content/80">{value}</span>
            ),
          } satisfies columnType<Colleague>,
        ]
      : []),
    {
      key: "location",
      label: "Location",
      render: (value: string) => (
        <span className="text-base-content/80">{value}</span>
      ),
    },
    ...(hasPhone
      ? [
          {
            key: "phone",
            label: "Phone",
            render: (value: string) => (
              <span className="font-mono text-base-content/80">
                {value || "—"}
              </span>
            ),
          } satisfies columnType<Colleague>,
        ]
      : []),
    {
      key: "status",
      label: "Status",
      render: (_value: string, emp: Colleague) => (
        <ColleagueStatusBadge status={emp.status} onLeave={emp.onLeave} />
      ),
    },
    {
      key: "action",
      label: "Action",
      render: (_value: unknown, emp: Colleague) => (
        <Link
          to="/staff/staffs/$id"
          params={{ id: emp.id }}
          onClick={(e) => e.stopPropagation()}
          className="btn btn-xs btn-ghost text-primary hover:bg-primary/10 rounded-lg gap-1.5 font-medium"
        >
          <Eye className="size-3.5" />
          <span>View</span>
        </Link>
      ),
    },
  ];

  return (
    <div className="card bg-base-100 border border-base-200/80 shadow-xs overflow-hidden rounded-2xl">
      <CustomTable
        data={colleagues}
        columns={columns}
        onRowClick={(emp: Colleague) =>
          navigate({ to: "/staff/staffs/$id", params: { id: emp.id } })
        }
      />
    </div>
  );
}
