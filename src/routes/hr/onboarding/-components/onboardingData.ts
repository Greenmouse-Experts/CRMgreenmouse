import type { ChecklistItem, OnboardingHire } from "./types";

export const INITIAL_HIRES: OnboardingHire[] = [
  {
    id: "HIRE-01",
    name: "Nkechi Ani",
    role: "Content Strategist",
    start: "Nov 03",
    progress: 85,
    email: "nkechi.ani@kinovia.com",
    dept: "Marketing",
    probationStep: 2, // 60-day review
  },
  {
    id: "HIRE-02",
    name: "Tolu Bakare",
    role: "Senior Backend Engineer",
    start: "Dec 01",
    progress: 20,
    email: "tolu.bakare@kinovia.com",
    dept: "Engineering",
    probationStep: 0, // Day 1
  },
  {
    id: "HIRE-03",
    name: "Fatima Bello",
    role: "Ops Analyst",
    start: "Aug 20",
    progress: 100,
    email: "fatima.bello@kinovia.com",
    dept: "Operations",
    probationStep: 4, // Confirm / extend
  },
];

export const INITIAL_CHECKLISTS: Record<string, ChecklistItem[]> = {
  "HIRE-01": [
    {
      id: "CHK-01",
      dept: "HR",
      text: "Collect signed contract & ID",
      completed: true,
    },
    {
      id: "CHK-02",
      dept: "HR",
      text: "Issue policy acknowledgements",
      completed: true,
    },
    {
      id: "CHK-03",
      dept: "IT",
      text: "Create email & CRM account",
      completed: true,
    },
    {
      id: "CHK-04",
      dept: "IT",
      text: "Assign laptop",
      completed: false,
    },
    {
      id: "CHK-05",
      dept: "Manager",
      text: "Orientation session",
      completed: false,
    },
    {
      id: "CHK-06",
      dept: "Manager",
      text: "Set 30/60/90-day goals",
      completed: false,
    },
    {
      id: "CHK-07",
      dept: "Payroll",
      text: "Add bank & tax details",
      completed: false,
    },
  ],
  "HIRE-02": [
    {
      id: "CHK-11",
      dept: "HR",
      text: "Collect signed contract & ID",
      completed: true,
    },
    {
      id: "CHK-12",
      dept: "HR",
      text: "Issue policy acknowledgements",
      completed: false,
    },
    {
      id: "CHK-13",
      dept: "IT",
      text: "Create email & CRM account",
      completed: false,
    },
    {
      id: "CHK-14",
      dept: "IT",
      text: "Assign laptop",
      completed: false,
    },
    {
      id: "CHK-15",
      dept: "Manager",
      text: "Orientation session",
      completed: false,
    },
    {
      id: "CHK-16",
      dept: "Manager",
      text: "Set 30/60/90-day goals",
      completed: false,
    },
    {
      id: "CHK-17",
      dept: "Payroll",
      text: "Add bank & tax details",
      completed: false,
    },
  ],
  "HIRE-03": [
    {
      id: "CHK-21",
      dept: "HR",
      text: "Collect signed contract & ID",
      completed: true,
    },
    {
      id: "CHK-22",
      dept: "HR",
      text: "Issue policy acknowledgements",
      completed: true,
    },
    {
      id: "CHK-23",
      dept: "IT",
      text: "Create email & CRM account",
      completed: true,
    },
    {
      id: "CHK-24",
      dept: "IT",
      text: "Assign laptop",
      completed: true,
    },
    {
      id: "CHK-25",
      dept: "Manager",
      text: "Orientation session",
      completed: true,
    },
    {
      id: "CHK-26",
      dept: "Manager",
      text: "Set 30/60/90-day goals",
      completed: true,
    },
    {
      id: "CHK-27",
      dept: "Payroll",
      text: "Add bank & tax details",
      completed: true,
    },
  ],
};

export const PROBATION_STEPS = [
  "Day 1",
  "30-day check-in",
  "60-day review",
  "90-day review",
  "Confirm / extend",
];
