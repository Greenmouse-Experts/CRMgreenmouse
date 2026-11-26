import { useEmployeeOrganization, useEmployees } from "@/api/employeesApi";
import { useRoles } from "@/api/tenantApi";
import type { BackendTargetType } from "@/api/trainingApi";
import LocalSelect from "@/components/inputs/LocalSelect";
import { Users } from "lucide-react";

interface TargetAudiencePickerProps {
  targetType: BackendTargetType;
  targetIds: string[];
  onChangeTargetType: (nextType: BackendTargetType) => void;
  onChangeTargetIds: (nextIds: string[]) => void;
}

export default function TargetAudiencePicker({
  targetType,
  targetIds,
  onChangeTargetType,
  onChangeTargetIds,
}: TargetAudiencePickerProps) {
  const orgQuery = useEmployeeOrganization();
  const rolesQuery = useRoles();
  const employeesQuery = useEmployees();

  const departments = orgQuery.data?.departments ?? [];
  const roles = rolesQuery.data ?? [];
  const employees = employeesQuery.data ?? [];

  const toggleId = (id: string) => {
    if (targetIds.includes(id)) {
      onChangeTargetIds(targetIds.filter((x) => x !== id));
    } else {
      onChangeTargetIds([...targetIds, id]);
    }
  };

  return (
    <div className="space-y-2.5">
      <div>
        <label className="font-semibold text-base-content/80 mb-1 block text-xs">
          Target audience
        </label>
        <LocalSelect
          value={targetType}
          onChange={(e) => {
            onChangeTargetType(e.target.value as BackendTargetType);
            onChangeTargetIds([]);
          }}
        >
          <option value="all">All active staff</option>
          <option value="department">Specific departments</option>
          <option value="role">Specific roles</option>
          <option value="selected">Selected employees</option>
        </LocalSelect>
      </div>

      {targetType === "department" && (
        <div className="rounded-xl border border-base-200 bg-base-200/40 p-3 space-y-2">
          <p className="text-xs font-semibold text-base-content/70 flex items-center gap-1.5">
            <Users className="size-3.5 text-primary" />
            <span>Select departments ({targetIds.length} selected)</span>
          </p>
          {orgQuery.isLoading ? (
            <p className="text-xs text-base-content/60">Loading departments...</p>
          ) : departments.length === 0 ? (
            <p className="text-xs text-base-content/60">
              No departments found in Organization.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-32 overflow-y-auto pr-1">
              {departments.map((dept) => (
                <label
                  key={dept.id}
                  className="flex items-center gap-2 text-xs cursor-pointer rounded-lg px-2 py-1 hover:bg-base-100"
                >
                  <input
                    type="checkbox"
                    checked={targetIds.includes(dept.id)}
                    onChange={() => toggleId(dept.id)}
                    className="checkbox checkbox-xs checkbox-primary rounded"
                  />
                  <span className="truncate">{dept.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {targetType === "role" && (
        <div className="rounded-xl border border-base-200 bg-base-200/40 p-3 space-y-2">
          <p className="text-xs font-semibold text-base-content/70 flex items-center gap-1.5">
            <Users className="size-3.5 text-primary" />
            <span>Select roles ({targetIds.length} selected)</span>
          </p>
          {rolesQuery.isLoading ? (
            <p className="text-xs text-base-content/60">Loading roles...</p>
          ) : roles.length === 0 ? (
            <p className="text-xs text-base-content/60">No roles found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-32 overflow-y-auto pr-1">
              {roles.map((role) => (
                <label
                  key={role.id}
                  className="flex items-center gap-2 text-xs cursor-pointer rounded-lg px-2 py-1 hover:bg-base-100"
                >
                  <input
                    type="checkbox"
                    checked={targetIds.includes(role.id)}
                    onChange={() => toggleId(role.id)}
                    className="checkbox checkbox-xs checkbox-primary rounded"
                  />
                  <span className="truncate capitalize">{role.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {targetType === "selected" && (
        <div className="rounded-xl border border-base-200 bg-base-200/40 p-3 space-y-2">
          <p className="text-xs font-semibold text-base-content/70 flex items-center gap-1.5">
            <Users className="size-3.5 text-primary" />
            <span>Select employees ({targetIds.length} selected)</span>
          </p>
          {employeesQuery.isLoading ? (
            <p className="text-xs text-base-content/60">Loading employees...</p>
          ) : employees.length === 0 ? (
            <p className="text-xs text-base-content/60">No employees found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
              {employees.map((emp) => {
                const name =
                  `${emp.firstName ?? ""} ${emp.lastName ?? ""}`.trim() ||
                  emp.email ||
                  emp.employeeNumber ||
                  emp.id;
                return (
                  <label
                    key={emp.id}
                    className="flex items-center gap-2 text-xs cursor-pointer rounded-lg px-2 py-1 hover:bg-base-100"
                  >
                    <input
                      type="checkbox"
                      checked={targetIds.includes(emp.id)}
                      onChange={() => toggleId(emp.id)}
                      className="checkbox checkbox-xs checkbox-primary rounded"
                    />
                    <span className="truncate">{name}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
