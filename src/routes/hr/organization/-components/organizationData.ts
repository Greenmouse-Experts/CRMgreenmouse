import type { Department, OrgLeader, Position } from "./types";

export const INITIAL_LEADER: OrgLeader = {
  name: "Ifeoma Chukwu",
  title: "Chief Executive Officer",
  email: "ifeoma.chukwu@kinovia.com",
};

export const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: "DEP-01",
    code: "SAL",
    name: "Sales",
    head: "Tunde Adeyemi",
    count: 48,
    status: "Active",
    location: "Lagos",
    costCentre: "CC-101",
    description: "Enterprise sales, client acquisition, and pipeline conversion across regional markets.",
  },
  {
    id: "DEP-02",
    code: "ENG",
    name: "Engineering",
    head: "David Mensah",
    count: 72,
    status: "Active",
    location: "Lagos",
    costCentre: "CC-102",
    description: "Core software platform engineering, cloud infrastructure, QA, and security.",
  },
  {
    id: "DEP-03",
    code: "FIN",
    name: "Finance",
    head: "Samuel Johnson",
    count: 21,
    status: "Active",
    location: "Abuja",
    costCentre: "CC-103",
    description: "Financial planning, accounting, payroll reconciliation, audits, and compliance.",
  },
  {
    id: "DEP-04",
    code: "OPE",
    name: "Operations",
    head: "Kwame Asante",
    count: 34,
    status: "Active",
    location: "Accra",
    costCentre: "CC-104",
    description: "Internal business operations, office facilities, logistics, and process automation.",
  },
  {
    id: "DEP-05",
    code: "MAR",
    name: "Marketing",
    head: "Ngozi Obi",
    count: 26,
    status: "Active",
    location: "Lagos",
    costCentre: "CC-105",
    description: "Brand identity, demand generation, content strategy, and public relations.",
  },
  {
    id: "DEP-06",
    code: "CUS",
    name: "Customer Success",
    head: "Zainab Musa",
    count: 39,
    status: "Active",
    location: "Remote",
    costCentre: "CC-106",
    description: "Client onboarding, customer retention, account management, and user delight.",
  },
  {
    id: "DEP-07",
    code: "HR",
    name: "HR",
    head: "Grace Danjuma",
    count: 12,
    status: "Active",
    location: "Lagos",
    costCentre: "CC-107",
    description: "People operations, talent acquisition, culture, learning, and employee relations.",
  },
];

export const INITIAL_POSITIONS: Position[] = [
  {
    id: "POS-01",
    title: "Software Engineer",
    dept: "Engineering",
    grade: "G4",
    approved: 30,
    filled: 27,
  },
  {
    id: "POS-02",
    title: "Account Executive",
    dept: "Sales",
    grade: "G3",
    approved: 25,
    filled: 22,
  },
  {
    id: "POS-03",
    title: "Payroll Officer",
    dept: "Finance",
    grade: "G4",
    approved: 4,
    filled: 3,
  },
  {
    id: "POS-04",
    title: "CS Specialist",
    dept: "Customer Success",
    grade: "G2",
    approved: 30,
    filled: 30,
  },
  {
    id: "POS-05",
    title: "HR Officer",
    dept: "HR",
    grade: "G3",
    approved: 6,
    filled: 5,
  },
];

export const AVAILABLE_HEADS = [
  "Tunde Adeyemi",
  "David Mensah",
  "Samuel Johnson",
  "Kwame Asante",
  "Ngozi Obi",
  "Zainab Musa",
  "Grace Danjuma",
  "Amara Okafor",
  "Chiamaka Eze",
  "Fatima Bello",
  "Halima Sani",
];

export const LOCATION_OPTIONS = ["Lagos", "Abuja", "Accra", "Remote"];

export const GRADE_OPTIONS = ["G1", "G2", "G3", "G4", "G5", "G6", "G7"];
