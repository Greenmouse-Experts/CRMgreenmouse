import type { EmployeeRecord } from "@/api/employeesApi";
import type { StaffProfile } from "@/api/tenantApi";

function resolveLabel(
  value?: { name?: string; title?: string } | string | null,
): string | undefined {
  if (!value) return undefined;
  if (typeof value === "string") return value.trim() || undefined;
  return value.name?.trim() || value.title?.trim() || undefined;
}

function formatDate(value?: string): string | undefined {
  if (!value) return undefined;
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return value;
  return new Date(parsed).toLocaleDateString();
}

export default function EmploymentInfo({
  employee,
  staff,
}: {
  employee?: EmployeeRecord | null;
  staff?: StaffProfile | null;
}) {
  const fields = [
    { label: "Employee ID", value: employee?.employeeNumber },
    {
      label: "Department",
      value: employee?.departmentName || resolveLabel(employee?.department),
    },
    {
      label: "Job title",
      value:
        employee?.jobTitle ||
        employee?.positionName ||
        resolveLabel(employee?.position),
    },
    {
      label: "System role",
      value: staff?.role?.name || employee?.role?.name,
      capitalize: true,
    },
    {
      label: "Employment type",
      value: (employee?.employeeType || employee?.employmentType)?.replace(
        /_/g,
        " ",
      ),
      capitalize: true,
    },
    {
      label: "Work location",
      value: employee?.workLocation || employee?.location,
    },
    { label: "Work schedule", value: employee?.workSchedule },
    { label: "Start date", value: formatDate(employee?.startDate) },
    { label: "Manager", value: resolveLabel(employee?.manager) },
  ].filter((item) => Boolean(item.value));

  if (!fields.length) return null;

  return (
    <section
      className="space-y-5 rounded-box bg-base-100 p-5 shadow-sm"
      aria-labelledby="profile-employment-title"
    >
      <div>
        <h2 id="profile-employment-title" className="text-lg font-semibold">
          Employment details
        </h2>
        <p className="text-sm text-base-content/80">
          Work assignment details maintained by your organization.
        </p>
      </div>
      <dl className="grid gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <div
            key={field.label}
            className="rounded-lg border border-base-200 px-3.5 py-2.5"
          >
            <dt className="text-xs font-medium text-base-content/65">
              {field.label}
            </dt>
            <dd
              className={`mt-1 text-sm font-medium ${field.capitalize ? "capitalize" : ""}`}
            >
              {field.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
