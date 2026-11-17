import type { LeaveRequest, LeaveType } from "./types";

export const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: "LV-301",
    emp: "Chiamaka Eze",
    type: "Annual",
    from: "Nov 18",
    to: "Nov 22",
    days: 5,
    status: "Pending Manager Approval",
    reason: "Annual family retreat and end-of-quarter personal rest.",
    cover: "Tunde Adeyemi",
    phone: "+234 803 111 2233",
  },
  {
    id: "LV-302",
    emp: "Kwame Asante",
    type: "Sick",
    from: "Nov 12",
    to: "Nov 13",
    days: 2,
    status: "Approved",
    reason: "Severe flu and fever under doctor recommendation.",
    cover: "David Mensah",
  },
  {
    id: "LV-303",
    emp: "Halima Sani",
    type: "Maternity",
    from: "Dec 01",
    to: "Mar 01",
    days: 90,
    status: "Pending HR Approval",
    reason: "Standard 12-week statutory maternity leave.",
    cover: "Amara Okafor",
  },
  {
    id: "LV-304",
    emp: "Joseph Lawal",
    type: "Compassionate",
    from: "Nov 14",
    to: "Nov 15",
    days: 2,
    status: "Submitted",
    reason: "Bereavement ceremonies for close relative.",
    cover: "Peter Okon",
  },
  {
    id: "LV-305",
    emp: "Emeka Uche",
    type: "Annual",
    from: "Oct 28",
    to: "Nov 01",
    days: 5,
    status: "Rejected",
    reason: "Annual leave clash with product launch cycle.",
  },
  {
    id: "LV-306",
    emp: "Ruth Akande",
    type: "Study",
    from: "Nov 25",
    to: "Nov 26",
    days: 2,
    status: "Cancelled",
    reason: "Exam postponed by university administration.",
  },
];

export const LEAVE_TYPES: {
  type: LeaveType;
  entitlement: string;
  description: string;
  color: string;
}[] = [
  {
    type: "Annual",
    entitlement: "24 days / yr",
    description: "Paid annual recreation leave accrued each calendar year.",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    type: "Sick",
    entitlement: "12 days / yr",
    description: "Medical sick leave. Medical certificate required after 2 consecutive days.",
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    type: "Maternity",
    entitlement: "12 weeks (84 days)",
    description: "Statutory paid maternity leave for female employees prior to and following childbirth.",
    color: "bg-purple-50 text-purple-700 border-purple-200",
  },
  {
    type: "Paternity",
    entitlement: "14 days",
    description: "Paid parental leave granted to fathers upon birth or legal adoption.",
    color: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  {
    type: "Compassionate",
    entitlement: "5 days / yr",
    description: "Special leave for bereavement or serious illness of an immediate family member.",
    color: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    type: "Study",
    entitlement: "10 days / yr",
    description: "Professional development, certification exams, and academic training.",
    color: "bg-cyan-50 text-cyan-700 border-cyan-200",
  },
  {
    type: "Unpaid",
    entitlement: "Discretionary",
    description: "Extended personal absence with prior HR & management authorization.",
    color: "bg-slate-50 text-slate-700 border-slate-200",
  },
];

export const EMPLOYEES_LIST = [
  "Grace Danjuma",
  "Amara Okafor",
  "Tunde Adeyemi",
  "Chiamaka Eze",
  "David Mensah",
  "Kwame Asante",
  "Halima Sani",
  "Joseph Lawal",
  "Peter Okon",
  "Ruth Akande",
  "Emeka Uche",
  "Fatima Bello",
];
