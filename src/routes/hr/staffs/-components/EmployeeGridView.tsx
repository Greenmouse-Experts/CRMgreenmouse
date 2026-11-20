import type { Employee } from "./types";
import EmployeeAvatar from "./EmployeeAvatar";
import EmployeeStatusBadge from "./EmployeeStatusBadge";
import { MapPin, Briefcase, Eye } from "lucide-react";

interface EmployeeGridViewProps {
  employees: Employee[];
  onSelectEmployee: (employee: Employee) => void;
}

export default function EmployeeGridView({
  employees,
  onSelectEmployee,
}: EmployeeGridViewProps) {
  if (employees.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {employees.map((emp) => (
        <div
          key={emp.id}
          onClick={() => onSelectEmployee(emp)}
          className="group card bg-base-100 border border-base-200/80 hover:border-primary/80 shadow-xs hover:shadow-md transition-all duration-200 p-5 rounded-2xl cursor-pointer flex flex-col justify-between text-center relative overflow-hidden"
        >
          {/* Top corner ID badge */}
          <div className="flex items-center justify-between w-full mb-2">
            <span className="font-mono text-[11px] text-base-content/80 bg-base-200/80 px-2 py-0.5 rounded-md">
              {emp.id}
            </span>
            <span className="text-[11px] font-medium text-base-content/80">
              {emp.dept}
            </span>
          </div>

          {/* Centered Avatar */}
          <div className="my-2 flex justify-center">
            <div className="group-hover:scale-105 transition-transform duration-200">
              <EmployeeAvatar name={emp.name} size="lg" />
            </div>
          </div>

          {/* Employee Name & Title */}
          <div className="space-y-1">
            <h3 className="font-semibold text-base text-base-content group-hover:text-primary transition-colors line-clamp-1">
              {emp.name}
            </h3>
            <p className=" text-base-content/80 line-clamp-1">{emp.title}</p>
          </div>

          {/* Status & Availability Badges */}
          <div className="my-3 flex justify-center">
            <EmployeeStatusBadge status={emp.status} onLeave={emp.onLeave} />
          </div>

          {/* Bottom metadata */}
          <div className="pt-3 border-t border-base-200/80 flex items-center justify-between text-[11px] text-base-content/80">
            <span className="flex items-center gap-1 truncate">
              <MapPin className="size-3 shrink-0 text-base-content/80" />
              {emp.location}
            </span>
            <span className="flex items-center gap-1 shrink-0 font-medium text-base-content/80">
              <Briefcase className="size-3 shrink-0 text-base-content/80" />
              {emp.type}
            </span>
          </div>

          {/* Hover Action overlay hint */}
          <div className="absolute inset-x-0 bottom-0 py-1.5 bg-primary/10 text-primary  font-medium flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs">
            <Eye className="size-3.5" /> View Profile
          </div>
        </div>
      ))}
    </div>
  );
}
