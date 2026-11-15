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

const rawNames = [
  "Amara Okafor",
  "Tunde Adeyemi",
  "Chiamaka Eze",
  "David Mensah",
  "Fatima Bello",
  "Kwame Asante",
  "Ngozi Obi",
  "Samuel Johnson",
  "Zainab Musa",
  "Ifeanyi Nwosu",
  "Grace Danjuma",
  "Emeka Uche",
  "Halima Sani",
  "Joseph Lawal",
  "Adaeze Ike",
  "Peter Okon",
  "Ruth Akande",
  "Bola Tinubu",
  "Kemi Adebayo",
  "Musa Ibrahim",
];

const deptTitles: Record<string, string[]> = {
  Sales: ["Account Executive", "Sales Manager"],
  Engineering: ["Software Engineer", "QA Lead", "DevOps Engineer"],
  Finance: ["Payroll Officer", "Accountant"],
  Operations: ["Ops Analyst", "Logistics Lead"],
  Marketing: ["Brand Manager", "Content Strategist"],
  "Customer Success": ["CS Specialist", "CS Lead"],
  HR: ["HR Officer", "Recruiter"],
};

const statuses = [
  "Active",
  "Active",
  "Active",
  "Probation",
  "Active",
  "Notice Period",
  "Active",
  "Active",
  "Suspended",
  "Active",
];

export const INITIAL_EMPLOYEES: Employee[] = rawNames.map((name, index) => {
  const dept = HR_DEPARTMENTS[index % HR_DEPARTMENTS.length];
  const titles = deptTitles[dept] || ["Officer"];
  const title = titles[index % titles.length];
  const location = HR_LOCATIONS[index % HR_LOCATIONS.length];
  const type = HR_EMPLOYMENT_TYPES[index % HR_EMPLOYMENT_TYPES.length];
  const status = statuses[index % statuses.length];
  const onLeave = index % 7 === 2;
  const manager = rawNames[(index + 3) % rawNames.length];
  const start = `202${index % 6}-0${(index % 9) + 1}-1${index % 9}`;
  const salary = 350000 + ((index * 73000) % 900000);
  const grade = `G${(index % 6) + 2}`;
  const phone = `+234 80${index}${index} 555 01${index % 10}`;
  const birthday = `11-${String(14 + (index % 15)).padStart(2, "0")}`;

  return {
    id: `KNV-${(1001 + index).toString()}`,
    name,
    email: `${name.toLowerCase().replace(/\s+/g, ".")}@kinovia.com`,
    title,
    dept,
    location,
    type,
    status,
    onLeave,
    manager,
    start,
    salary,
    grade,
    phone,
    birthday,
  };
});

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
  link.setAttribute("download", `Kinovia_Employees_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
