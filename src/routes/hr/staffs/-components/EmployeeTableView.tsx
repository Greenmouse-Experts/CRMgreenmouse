import type { Employee } from "./types";
import EmployeeAvatar from "./EmployeeAvatar";
import EmployeeStatusBadge from "./EmployeeStatusBadge";

interface EmployeeTableViewProps {
  employees: Employee[];
  onSelectEmployee: (employee: Employee) => void;
}

export default function EmployeeTableView({
  employees,
  onSelectEmployee,
}: EmployeeTableViewProps) {
  if (employees.length === 0) {
    return null;
  }

  return (
    <div className="card bg-base-100 border border-base-200/80 shadow-xs overflow-hidden rounded-2xl">
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr className="bg-base-200/40 text-base-content/70 text-xs uppercase tracking-wider border-b border-base-200">
              <th className="py-3.5 pl-6 font-semibold">Employee</th>
              <th className="py-3.5 font-semibold">ID</th>
              <th className="py-3.5 font-semibold">Department</th>
              <th className="py-3.5 font-semibold">Type</th>
              <th className="py-3.5 font-semibold">Location</th>
              <th className="py-3.5 font-semibold">Status</th>
              <th className="py-3.5 text-right pr-6 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-base-200/60 text-sm">
            {employees.map((emp) => (
              <tr
                key={emp.id}
                onClick={() => onSelectEmployee(emp)}
                className="hover:bg-base-200/30 transition-colors cursor-pointer group"
              >
                {/* Employee Name & Title */}
                <td className="py-3.5 pl-6">
                  <div className="flex items-center gap-3">
                    <EmployeeAvatar name={emp.name} size="sm" />
                    <div>
                      <p className="font-semibold text-base-content group-hover:text-primary transition-colors">
                        {emp.name}
                      </p>
                      <p className="text-xs text-base-content/60">
                        {emp.title}
                      </p>
                    </div>
                  </div>
                </td>

                {/* ID */}
                <td className="py-3.5 font-mono text-xs text-base-content/70">
                  <span className="bg-base-200/60 px-2 py-0.5 rounded-md">
                    {emp.id}
                  </span>
                </td>

                {/* Department */}
                <td className="py-3.5 text-base-content/80 font-medium text-xs">
                  {emp.dept}
                </td>

                {/* Type */}
                <td className="py-3.5 text-base-content/70 text-xs">
                  {emp.type}
                </td>

                {/* Location */}
                <td className="py-3.5 text-base-content/70 text-xs">
                  {emp.location}
                </td>

                {/* Status */}
                <td className="py-3.5">
                  <EmployeeStatusBadge
                    status={emp.status}
                    onLeave={emp.onLeave}
                  />
                </td>

                {/* Action */}
                <td className="py-3.5 text-right pr-6">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectEmployee(emp);
                    }}
                    className="btn btn-xs btn-ghost text-primary font-semibold hover:bg-primary/10"
                  >
                    View →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
