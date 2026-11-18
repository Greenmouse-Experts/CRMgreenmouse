import type { Course, CourseCategory, DeliveryMode, TrainingSession } from "./types";

export const INITIAL_COURSES: Course[] = [
  {
    id: "CRS-01",
    title: "Data Privacy Essentials",
    category: "Compliance",
    enrolled: 64,
    completionRate: 92,
    mode: "Self-paced online",
    trainer: "Internal Compliance Team",
    duration: 3,
    mandatory: true,
  },
  {
    id: "CRS-02",
    title: "Leadership 101",
    category: "Management",
    enrolled: 18,
    completionRate: 45,
    mode: "In-person",
    trainer: "External — PwC",
    duration: 16,
    mandatory: false,
  },
  {
    id: "CRS-03",
    title: "Advanced CRM Selling",
    category: "Sales",
    enrolled: 32,
    completionRate: 70,
    mode: "Blended",
    trainer: "Tunde Adeyemi",
    duration: 8,
    mandatory: false,
  },
  {
    id: "CRS-04",
    title: "Workplace Safety",
    category: "Compliance",
    enrolled: 120,
    completionRate: 100,
    mode: "Virtual",
    trainer: "Safety First Consulting",
    duration: 2,
    mandatory: true,
  },
];

export const INITIAL_SESSIONS: TrainingSession[] = [
  {
    id: "SES-01",
    course: "Leadership 101",
    date: "Nov 19",
    trainer: "External — PwC",
    status: "Scheduled",
    mode: "In-person",
    location: "Main Training Hall, Lagos HQ",
  },
  {
    id: "SES-02",
    course: "Advanced CRM Selling",
    date: "Nov 26",
    trainer: "Tunde Adeyemi",
    status: "Scheduled",
    mode: "Virtual",
    location: "Zoom Virtual Room A",
  },
  {
    id: "SES-03",
    course: "Data Privacy Essentials",
    date: "Nov 05",
    trainer: "Internal Compliance Team",
    status: "Completed",
    mode: "Self-paced online",
    location: "LMS Portal",
  },
  {
    id: "SES-04",
    course: "Workplace Safety",
    date: "Oct 22",
    trainer: "Safety First Consulting",
    status: "Completed",
    mode: "Virtual",
    location: "Zoom Virtual Room B",
  },
];

export const COURSE_CATEGORIES: CourseCategory[] = [
  "Compliance",
  "Management",
  "Sales",
  "Technical",
  "Soft skills",
];

export const DELIVERY_MODES: DeliveryMode[] = [
  "In-person",
  "Virtual",
  "Self-paced online",
  "Blended",
];

export const TARGET_AUDIENCE_OPTIONS = [
  "All staff",
  "Sales",
  "Engineering",
  "Finance",
  "Operations",
  "Marketing",
  "Customer Success",
  "HR",
  "Managers only",
  "New hires",
];
