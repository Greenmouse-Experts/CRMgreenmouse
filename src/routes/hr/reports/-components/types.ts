export interface ReportKpi {
  label: string;
  value: string;
  delta?: string;
}

export type ChartType = "line" | "bar" | "pie" | "area";

export interface ReportChart {
  type: ChartType;
  title: string;
  data: any[];
  x: string;
  keys: string[];
}

export interface ReportItem {
  slug: string;
  title: string;
  desc: string;
  category?: string;
  kpis: ReportKpi[];
  chart: ReportChart;
  cols: string[];
  rows: (string | number)[][];
  insights: string[];
}
