import type {
  ChartType,
  ReportChart,
  ReportItem,
  ReportKpi,
} from "./types";

type Dict = Record<string, any>;

const isObj = (value: unknown): value is Dict =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isArrOfObj = (value: unknown): value is Dict[] =>
  Array.isArray(value) &&
  value.length > 0 &&
  value.every((item) => isObj(item));

/** "averageLateArrivalsPerDay" -> "Average Late Arrivals Per Day" */
export const humanizeKey = (key: string) =>
  key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const formatKpiValue = (key: string, value: any): string => {
  if (value === null || value === undefined || value === "") return "—";
  const lower = key.toLowerCase();
  if (typeof value === "number") {
    if (
      lower.includes("rate") ||
      lower.includes("percent") ||
      lower.includes("percentage")
    ) {
      return `${value}%`;
    }
    if (lower.includes("hour")) return `${value} hrs`;
    if (Number.isInteger(value)) return value.toLocaleString();
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return "—";
  return String(value);
};

const summaryToKpis = (summary: Dict): ReportKpi[] =>
  Object.entries(summary)
    .filter(([, value]) => value === null || typeof value !== "object")
    .map(([key, value]) => ({
      label: humanizeKey(key),
      value: formatKpiValue(key, value),
    }));

const buildChart = (
  title: string,
  data: Dict[],
  preferredX?: string,
): ReportChart | undefined => {
  if (!isArrOfObj(data)) return undefined;
  const sample = data[0];
  const keys = Object.keys(sample);
  const xKey =
    preferredX && keys.includes(preferredX)
      ? preferredX
      : (keys.find((key) => typeof sample[key] === "string") ?? keys[0]);
  const ordinalKeys = /^(dayOfWeek|index|order|id|staffId)$/i;
  const valueKeys = keys.filter(
    (key) =>
      key !== xKey &&
      typeof sample[key] === "number" &&
      !ordinalKeys.test(key),
  );
  if (!valueKeys.length) return undefined;
  const type: ChartType = "bar";
  return { type, title, data, x: xKey, keys: valueKeys };
};

const buildTable = (
  data: Dict[],
  options?: { drop?: string[]; rename?: Record<string, string> },
): { cols: string[]; rows: (string | number)[][] } | undefined => {
  if (!isArrOfObj(data)) return undefined;
  const drop = new Set(options?.drop ?? []);
  const cols = Object.keys(data[0]).filter((key) => !drop.has(key));
  if (!cols.length) return undefined;
  const rows = data.map((item) =>
    cols.map((key) => {
      const value = item[key];
      if (value === null || value === undefined) return "";
      if (typeof value === "object") return JSON.stringify(value);
      return value as string | number;
    }),
  );
  const labels = cols.map((key) => options?.rename?.[key] ?? humanizeKey(key));
  return { cols: labels, rows };
};

/** Find the first array of objects under one of the given keys. */
const pickArray = (source: Dict, keys: string[]): Dict[] | undefined => {
  for (const key of keys) {
    if (isArrOfObj(source[key])) return source[key] as Dict[];
  }
  return undefined;
};

/**
 * Normalize a raw reports API response into the flat `ReportItem` shape the
 * detail view renders. Falls back to the mock report for any section the API
 * does not provide, so the UI never crashes on `.map` of a missing array.
 */
export function normalizeReport(
  mock: ReportItem,
  api: unknown,
): ReportItem {
  if (!isObj(api)) return mock;

  // Already in the expected shape — trust it, but backfill missing sections.
  if (
    Array.isArray(api.kpis) &&
    isObj(api.chart) &&
    Array.isArray(api.cols) &&
    Array.isArray(api.rows)
  ) {
    return {
      ...mock,
      kpis: api.kpis as ReportKpi[],
      chart: api.chart as ReportChart,
      cols: api.cols as string[],
      rows: api.rows as (string | number)[][],
      insights: Array.isArray(api.insights)
        ? (api.insights as string[])
        : mock.insights,
    };
  }

  // KPIs from a summary object (or an explicit kpis array).
  const kpis: ReportKpi[] = Array.isArray(api.kpis)
    ? (api.kpis as ReportKpi[])
    : isObj(api.summary)
      ? summaryToKpis(api.summary)
      : [];

  // Chart from the first known series array.
  const chartSource = pickArray(api, [
    "dailyAttendance",
    "byMonth",
    "byDepartment",
    "byCategory",
    "trend",
    "series",
    "monthly",
    "daily",
    "data",
  ]);
  const chart =
    (isObj(api.chart) ? (api.chart as ReportChart) : undefined) ??
    (chartSource ? buildChart("Breakdown", chartSource) : undefined);

  // Table from the first known tabular array.
  const tableSource = pickArray(api, [
    "employees",
    "rows",
    "items",
    "records",
    "breakdown",
    "details",
    "topCustomers",
    "topVendors",
    "byDepartment",
  ]);
  const table =
    (Array.isArray(api.cols) &&
    Array.isArray(api.rows) &&
    (api.rows as any[]).every((row) => Array.isArray(row))
      ? {
          cols: api.cols as string[],
          rows: api.rows as (string | number)[][],
        }
      : undefined) ??
    (tableSource
      ? buildTable(tableSource, {
          // Drop identifiers that are not meaningful to end users.
          drop: ["staffId", "id", "employeeId", "tenantId"],
          rename: {
            employee: "Employee",
            department: "Department",
            expectedDays: "Expected days",
            presentDays: "Present days",
            attendedDays: "Attended days",
            lateDays: "Late days",
            absentDays: "Absent days",
            overtimeMinutes: "Overtime (min)",
            overtimeHours: "Overtime (h)",
            scheduleConfigured: "Schedule configured",
          },
        })
      : undefined);

  return {
    ...mock,
    kpis: kpis.length ? kpis : mock.kpis,
    chart: chart ?? mock.chart,
    cols: table?.cols ?? mock.cols,
    rows: table?.rows ?? mock.rows,
    insights: Array.isArray(api.insights)
      ? (api.insights as string[])
      : mock.insights,
  };
}
