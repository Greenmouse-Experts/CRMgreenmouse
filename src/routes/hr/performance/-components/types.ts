export type AppraisalStatus = "Completed" | "In Progress" | "Pending";

export interface AppraisalRecord {
  id: string;
  employee: string;
  reviewer: string;
  rating: string;
  status: AppraisalStatus;
  cycle: string;
  selfScore?: string;
  managerScore?: string;
}

export interface TeamGoal {
  id: string;
  title: string;
  progress: number;
  assignedTo?: string;
  cycle?: string;
  category?: "Business" | "Customer" | "Process" | "Learning & growth";
  kpi?: string;
  target?: string;
  weight?: number;
  due?: string;
}

export interface AssignGoalPayload {
  emp: string;
  cycle: string;
  title: string;
  category: "Business" | "Customer" | "Process" | "Learning & growth";
  kpi?: string;
  target: string;
  weight: number;
  start?: string;
  due: string;
  desc?: string;
}
