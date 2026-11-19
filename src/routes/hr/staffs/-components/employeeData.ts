import type { Employee } from "./types";

export const HR_DEPARTMENTS = [
  "Sales",
  "Engineering",
  "Finance",
  "Operations",
  "Marketing",
  "Customer Success",
  "HR",
] as const;

export const HR_LOCATIONS = ["Lagos", "Abuja", "Accra", "Remote"] as const;

export const HR_EMPLOYMENT_TYPES = [
  "Full-time",
  "Contract",
  "Part-time",
  "Intern",
] as const;

export const HR_STATUS_OPTIONS = [
  "Active",
  "Probation",
  "Notice Period",
  "Suspended",
] as const;

export function getInitials(name: string): string {
  if (!name) return "";
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function getAvatarColor(name: string): string {
  const palettes = [
    "bg-primary/15 text-primary border-primary/20",
    "bg-info/15 text-info border-info/20",
    "bg-success/15 text-success border-success/20",
    "bg-warning/20 text-warning-foreground border-warning/30",
    "bg-secondary/15 text-secondary border-secondary/20",
    "bg-accent/15 text-accent-foreground border-accent/20",
  ];
  const sum = [...name].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return palettes[sum % palettes.length];
}

export function formatSalary(amount?: number): string {
  if (!amount && amount !== 0) return "—";
  return `₦${Number(amount).toLocaleString("en-NG")}`;
}

export function exportEmployeesToCSV(employees: Employee[]) {
  const headers = [
    "Employee ID",
    "Full Name",
    "Email",
    "Phone",
    "Department",
    "Job Title",
    "Employment Type",
    "Location",
    "Status",
    "On Leave",
    "Manager",
    "Start Date",
    "Salary",
    "Grade",
  ];

  const rows = employees.map((emp) => [
    emp.id,
    `"${emp.name.replace(/"/g, '""')}"`,
    emp.email,
    emp.phone || "",
    emp.dept,
    `"${emp.title.replace(/"/g, '""')}"`,
    emp.type,
    emp.location,
    emp.status,
    emp.onLeave ? "Yes" : "No",
    `"${emp.manager || ""}"`,
    emp.start || "",
    emp.salary ?? "",
    emp.grade || "",
  ]);

  const csvContent =
    "data:text/csv;charset=utf-8," +
    [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute(
    "download",
    `Kinovia_Employees_${new Date().toISOString().slice(0, 10)}.csv`,
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
