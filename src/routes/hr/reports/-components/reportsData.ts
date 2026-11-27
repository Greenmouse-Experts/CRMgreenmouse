import type { ReportItem } from "./types";

export const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const formatNaira = (val: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(val);

export const HR_REPORTS: ReportItem[] = [
  {
    slug: "headcount-and-turnover",
    title: "Headcount & turnover",
    desc: "Workforce size, hires and exits over the last 6 months.",
    category: "People",
    kpis: [
      { label: "Headcount", value: "261", delta: "+4.2% vs Oct" },
      { label: "New hires (6 mo)", value: "51" },
      { label: "Exits (6 mo)", value: "17" },
      { label: "Turnover rate", value: "6.5%", delta: "Target ≤ 8%" },
    ],
    chart: {
      type: "line",
      title: "Headcount, hires and exits",
      data: [
        { month: "Jun", headcount: 228, hires: 9, exits: 2 },
        { month: "Jul", headcount: 235, hires: 8, exits: 1 },
        { month: "Aug", headcount: 242, hires: 10, exits: 3 },
        { month: "Sep", headcount: 249, hires: 9, exits: 2 },
        { month: "Oct", headcount: 253, hires: 7, exits: 3 },
        { month: "Nov", headcount: 261, hires: 8, exits: 0 },
      ],
      x: "month",
      keys: ["headcount", "hires", "exits"],
    },
    cols: ["Department", "Headcount", "Hires", "Exits", "Turnover"],
    rows: [
      ["Engineering", 84, 9, 2, "2.4%"],
      ["Sales", 52, 6, 4, "7.7%"],
      ["Customer Success", 38, 5, 2, "5.3%"],
      ["Operations", 32, 4, 1, "3.1%"],
      ["Marketing", 24, 3, 1, "4.2%"],
      ["Finance", 18, 2, 0, "0.0%"],
      ["HR", 13, 1, 0, "0.0%"],
    ],
    insights: [
      "Engineering grew fastest with 9 new hires over the observation window.",
      "Most exits were voluntary resignations in Sales.",
      "Overall turnover rate (6.5%) remains well within the company's 8.0% annual ceiling target.",
    ],
  },
  {
    slug: "attendance-summary",
    title: "Attendance summary",
    desc: "Present, late and absent counts for this week.",
    category: "Operations",
    kpis: [
      { label: "Attendance rate", value: "94.1%" },
      { label: "Avg. late arrivals/day", value: "11" },
      { label: "Absences (week)", value: "31" },
      { label: "Overtime hours", value: "46 hrs" },
    ],
    chart: {
      type: "bar",
      title: "Daily attendance",
      data: [
        { day: "Mon", present: 248, late: 12, absent: 5 },
        { day: "Tue", present: 251, late: 9, absent: 4 },
        { day: "Wed", present: 253, late: 8, absent: 3 },
        { day: "Thu", present: 247, late: 14, absent: 6 },
        { day: "Fri", present: 244, late: 16, absent: 7 },
      ],
      x: "day",
      keys: ["present", "late", "absent"],
    },
    cols: ["Employee", "Days present", "Late", "Absent", "Overtime (h)"],
    rows: [
      ["Samuel Adekunle", 5, 1, 0, 4],
      ["Folake Adeleke", 5, 0, 0, 2],
      ["Babajide Sanwo", 4, 2, 1, 6],
      ["Chioma Okonkwo", 5, 0, 0, 8],
      ["Tunde Adeyemi", 5, 1, 0, 5],
      ["Amara Okafor", 4, 0, 1, 0],
      ["David Adeleke", 5, 2, 0, 3],
      ["Zainab Musa", 4, 1, 1, 0],
      ["Ibrahim Bello", 5, 0, 0, 6],
      ["Ngozi Obi", 4, 1, 1, 2],
    ],
    insights: [
      "Late arrivals peak towards Friday mornings across field and commuter teams.",
      "Customer Success registered the highest cumulative overtime hours (18 hrs).",
      "3 employees recorded more than one unexplained check-in delay.",
    ],
  },
  {
    slug: "leave-utilization",
    title: "Leave utilization",
    desc: "Leave taken by type and remaining balances.",
    category: "Operations",
    kpis: [
      { label: "Days taken (YTD)", value: "1,842" },
      { label: "Avg. per employee", value: "7.1 days" },
      { label: "Pending requests", value: "3" },
      { label: "Unused balance", value: "3,420 days" },
    ],
    chart: {
      type: "pie",
      title: "Days taken by leave type",
      data: [
        { type: "Annual", days: 1120 },
        { type: "Sick", days: 310 },
        { type: "Maternity", days: 270 },
        { type: "Compassionate", days: 62 },
        { type: "Study", days: 48 },
        { type: "Unpaid", days: 32 },
      ],
      x: "type",
      keys: ["days"],
    },
    cols: ["Employee", "Entitlement", "Taken", "Pending", "Balance"],
    rows: [
      ["Samuel Adekunle", 24, 12, 0, 12],
      ["Folake Adeleke", 24, 8, 3, 13],
      ["Babajide Sanwo", 24, 15, 0, 9],
      ["Chioma Okonkwo", 24, 6, 0, 18],
      ["Tunde Adeyemi", 24, 14, 0, 10],
      ["Amara Okafor", 24, 4, 0, 20],
      ["David Adeleke", 24, 18, 0, 6],
      ["Zainab Musa", 24, 5, 5, 14],
      ["Ibrahim Bello", 24, 7, 0, 17],
      ["Ngozi Obi", 24, 16, 0, 8],
    ],
    insights: [
      "Annual leave accounts for 61% of all leave taken year-to-date.",
      "42 employees have over 15 days of unused leave remaining — automated policy reminders recommended.",
    ],
  },
  {
    slug: "payroll-summary",
    title: "Payroll summary",
    desc: "Gross pay, deductions and net pay by month.",
    category: "Finance",
    kpis: [
      { label: "Gross (Nov)", value: "₦16,720,000" },
      { label: "Deductions", value: "₦3,009,600" },
      { label: "Net pay", value: "₦13,710,400" },
      { label: "vs Oct", value: "+2.3%" },
    ],
    chart: {
      type: "area",
      title: "Payroll cost (₦m)",
      data: [
        { month: "Jun", gross: 15.1, net: 12.4 },
        { month: "Jul", gross: 15.5, net: 12.7 },
        { month: "Aug", gross: 15.9, net: 13.0 },
        { month: "Sep", gross: 16.3, net: 13.3 },
        { month: "Oct", gross: 16.7, net: 13.6 },
        { month: "Nov", gross: 17.1, net: 13.9 },
      ],
      x: "month",
      keys: ["gross", "net"],
    },
    cols: ["Department", "Employees", "Gross", "Deductions", "Net"],
    rows: [
      ["Engineering", 84, "₦6,450,000", "₦1,161,000", "₦5,289,000"],
      ["Sales", 52, "₦3,980,000", "₦716,400", "₦3,263,600"],
      ["Customer Success", 38, "₦2,450,000", "₦441,000", "₦2,009,000"],
      ["Operations", 32, "₦1,890,000", "₦340,200", "₦1,549,800"],
      ["Marketing", 24, "₦1,720,000", "₦309,600", "₦1,410,400"],
      ["Finance", 18, "₦1,450,000", "₦261,000", "₦1,189,000"],
      ["HR", 13, "₦980,000", "₦176,400", "₦803,600"],
    ],
    insights: [
      "Month-on-month variance is driven by 4 promotions and 3 Q4 engineering hires.",
      "Amounts represent total calculated payroll before statutory remittances.",
    ],
  },
  {
    slug: "recruitment-funnel",
    title: "Recruitment funnel",
    desc: "Candidates at each hiring stage and conversion.",
    category: "People",
    kpis: [
      { label: "Applicants", value: "150" },
      { label: "Interviewed", value: "38" },
      { label: "Offers", value: "6" },
      { label: "Avg. time to hire", value: "27 days" },
    ],
    chart: {
      type: "bar",
      title: "Candidates per stage",
      data: [
        { stage: "Applied", candidates: 150 },
        { stage: "Screening", candidates: 92 },
        { stage: "Shortlisted", candidates: 54 },
        { stage: "Interview", candidates: 38 },
        { stage: "Assessment", candidates: 19 },
        { stage: "Offer", candidates: 6 },
        { stage: "Hired", candidates: 4 },
      ],
      x: "stage",
      keys: ["candidates"],
    },
    cols: ["Vacancy", "Applicants", "Interviewed", "Offers", "Days open"],
    rows: [
      ["Senior Backend Engineer", 64, 14, 2, 31],
      ["Account Executive", 41, 12, 2, 24],
      ["Payroll Specialist", 18, 5, 1, 12],
      ["Content Strategist", 27, 7, 1, 19],
    ],
    insights: [
      "Largest drop-off is between Applied and Screening stages (39% transition rate).",
      "Offer acceptance rate currently stands strong at 67%.",
    ],
  },
  {
    slug: "performance-distribution",
    title: "Performance distribution",
    desc: "Appraisal ratings for the current review cycle.",
    category: "Growth",
    kpis: [
      { label: "Reviews completed", value: "64%" },
      { label: "Average rating", value: "3.7 / 5" },
      { label: "Top performers", value: "18%" },
      { label: "On PIP", value: "5 staff" },
    ],
    chart: {
      type: "bar",
      title: "Employees by rating",
      data: [
        { rating: "1 – Poor", employees: 4 },
        { rating: "2 – Fair", employees: 21 },
        { rating: "3 – Good", employees: 98 },
        { rating: "4 – Very good", employees: 91 },
        { rating: "5 – Excellent", employees: 47 },
      ],
      x: "rating",
      keys: ["employees"],
    },
    cols: ["Department", "Reviewed", "Avg. rating", "Goals met"],
    rows: [
      ["Engineering", "68%", "3.8", "72%"],
      ["Sales", "62%", "3.6", "68%"],
      ["Customer Success", "74%", "3.9", "78%"],
      ["Operations", "58%", "3.5", "64%"],
      ["Marketing", "65%", "3.7", "70%"],
      ["Finance", "80%", "4.0", "85%"],
      ["HR", "77%", "3.8", "75%"],
    ],
    insights: [
      "Most employees cluster in 'Good' (37.5%) and 'Very Good' (34.8%) bands.",
      "Finance team recorded the highest percentage of quarterly OKR milestones achieved (85%).",
    ],
  },
  {
    slug: "training-completion",
    title: "Training completion",
    desc: "Enrollment and completion for active courses.",
    category: "Growth",
    kpis: [
      { label: "Enrolled", value: "234" },
      { label: "Completion rate", value: "82%" },
      { label: "Training hours", value: "1,960 hrs" },
      { label: "Certificates issued", value: "171" },
    ],
    chart: {
      type: "bar",
      title: "Enrolled vs completed",
      data: [
        { course: "Data Privacy", enrolled: 64, completed: 59 },
        { course: "Leadership 101", enrolled: 18, completed: 8 },
        { course: "CRM Selling", enrolled: 32, completed: 22 },
        { course: "Safety", enrolled: 120, completed: 120 },
      ],
      x: "course",
      keys: ["enrolled", "completed"],
    },
    cols: ["Course", "Category", "Enrolled", "Completed", "Rate"],
    rows: [
      ["Data Privacy Essentials", "Compliance", 64, 59, "92%"],
      ["Leadership 101", "Management", 18, 8, "45%"],
      ["Advanced CRM Selling", "Sales", 32, 22, "70%"],
      ["Workplace Safety", "Compliance", 120, 120, "100%"],
    ],
    insights: [
      "All mandatory workplace safety certifications are 100% fulfilled.",
      "Leadership 101 program requires managerial follow-up with 10 pending modules.",
    ],
  },
  {
    slug: "diversity-overview",
    title: "Diversity overview",
    desc: "Workforce mix by gender, age group and location.",
    category: "People",
    kpis: [
      { label: "Women in workforce", value: "46%" },
      { label: "Women in leadership", value: "38%" },
      { label: "Avg. age", value: "31 yrs" },
      { label: "Hub locations", value: "4 cities" },
    ],
    chart: {
      type: "pie",
      title: "Employees by location",
      data: [
        { location: "Lagos", employees: 132 },
        { location: "Abuja", employees: 61 },
        { location: "Accra", employees: 38 },
        { location: "Remote", employees: 30 },
      ],
      x: "location",
      keys: ["employees"],
    },
    cols: ["Department", "Women", "Men", "Under 30", "30 & over"],
    rows: [
      ["Engineering", 28, 56, 38, 46],
      ["Sales", 26, 26, 22, 30],
      ["Customer Success", 22, 16, 20, 18],
      ["Operations", 14, 18, 12, 20],
      ["Marketing", 16, 8, 14, 10],
      ["Finance", 9, 9, 6, 12],
      ["HR", 8, 5, 4, 9],
    ],
    insights: [
      "HR and Marketing departments lead in gender parity representation.",
      "Engineering division targeted for proactive gender-inclusive recruitment in Q1.",
    ],
  },
  {
    slug: "contract-expirations",
    title: "Contract expirations",
    desc: "Contracts and probation periods ending in the next 90 days.",
    category: "Compliance",
    kpis: [
      { label: "Expiring in 30 days", value: "3" },
      { label: "In 31–60 days", value: "5" },
      { label: "In 61–90 days", value: "4" },
      { label: "Probations ending", value: "6 staff" },
    ],
    chart: {
      type: "bar",
      title: "Expirations by month",
      data: [
        { month: "Dec", contracts: 3 },
        { month: "Jan", contracts: 5 },
        { month: "Feb", contracts: 4 },
      ],
      x: "month",
      keys: ["contracts"],
    },
    cols: ["Employee", "Department", "Contract type", "Ends", "Action"],
    rows: [
      ["Zainab Musa", "Sales", "Contract", "Dec 04", "Renewal review"],
      ["Chidi Eze", "Sales", "Contract", "Dec 18", "Notify manager"],
      ["David Adeleke", "Marketing", "Probation", "Jan 09", "Renewal review"],
      ["Folake Adeleke", "Design", "Contract", "Jan 22", "Notify manager"],
      ["Samuel Adekunle", "Engineering", "Contract", "Feb 03", "Renewal review"],
      ["Chioma Okonkwo", "Finance", "Probation", "Feb 15", "Notify manager"],
      ["Amara Okafor", "Operations", "Contract", "Feb 27", "Renewal review"],
      ["Babajide Sanwo", "Customer Success", "Contract", "Dec 29", "Notify manager"],
    ],
    insights: [
      "3 contracts require renewal determination before mid-December.",
      "Automated supervisor reminder alerts dispatch 30 days prior to contract termination dates.",
    ],
  },
];

export const getReportBySlug = (slug: string): ReportItem | undefined => {
  return HR_REPORTS.find((r) => r.slug === slug);
};

export const exportReportToCsv = (report: ReportItem) => {
  const cols = report.cols ?? [];
  const rows = report.rows ?? [];
  if (cols.length === 0 && rows.length === 0) {
    return;
  }
  const csvRows = [cols, ...rows];
  const csvContent = csvRows
    .map((row) =>
      row
        .map((field) => `"${String(field).replace(/"/g, '""')}"`)
        .join(","),
    )
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${report.slug}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
