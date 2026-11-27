import { describe, expect, it } from "vitest";
import {
  formatVacancySalaryRange,
  mapBackendVacancyStatus,
  toUiVacancy,
} from "./mappers";

describe("recruitment mappers", () => {
  it("maps all backend vacancy statuses accurately without collapsing approved into published", () => {
    expect(mapBackendVacancyStatus("draft")).toBe("Draft");
    expect(mapBackendVacancyStatus("pending_approval")).toBe("Pending Approval");
    expect(mapBackendVacancyStatus("approved")).toBe("Approved");
    expect(mapBackendVacancyStatus("published")).toBe("Published");
    expect(mapBackendVacancyStatus("unpublished")).toBe("Unpublished");
    expect(mapBackendVacancyStatus("rejected")).toBe("Rejected");
    expect(mapBackendVacancyStatus("closed")).toBe("Closed");
    expect(mapBackendVacancyStatus("archived")).toBe("Archived");
  });

  it("maps RecruitmentVacancy applicantCount, vacancyNumber, workLocation, and lookup names", () => {
    const ui = toUiVacancy(
      {
        id: "vac-uuid-1",
        vacancyNumber: "VAC-FD403910",
        jobTitle: "QA Engineer",
        departmentName: "qa",
        openings: 2,
        applicantCount: 7,
        closingDate: "2026-12-24",
        status: "pending_approval",
        workLocation: "Lagos",
        salaryMinimum: 400000,
        salaryMaximum: 500000,
        salaryCurrency: "NGN",
        salaryPeriod: "monthly",
        hiringManagerId: "mgr-1",
        approverId: "app-1",
      },
      { "mgr-1": "Ada Okafor", "app-1": "Daniel HR" },
    );

    expect(ui.vacancyNumber).toBe("VAC-FD403910");
    expect(ui.applicants).toBe(7);
    expect(ui.location).toBe("Lagos");
    expect(ui.status).toBe("Pending Approval");
    expect(ui.manager).toBe("Ada Okafor");
    expect(ui.approver).toBe("Daniel HR");
    expect(ui.budget).toBe("NGN 400,000 – NGN 500,000 / monthly");
  });

  it("formats salary ranges gracefully for missing values", () => {
    expect(formatVacancySalaryRange({})).toBe("Not specified");
    expect(
      formatVacancySalaryRange({
        salaryMinimum: 100000,
        salaryCurrency: "NGN",
        salaryPeriod: "monthly",
      }),
    ).toBe("From NGN 100,000 / monthly");
  });
});
