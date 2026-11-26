import { describe, expect, it } from "vitest";
import {
  formatCourseCost,
  formatSessionDate,
  mapBackendCategoryToUi,
  mapBackendDeliveryModeToUi,
  mapBackendSessionStatusToUi,
  toBackendCategory,
  toBackendDeliveryMode,
  toBackendTargetType,
  mapBackendCourseToUi,
  mapBackendSessionRecordToUi,
  mapBackendUpcomingSessionToUi,
  normalizeTrainingParticipant,
} from "./mappers";

describe("Training mappers", () => {
  it("formats dates and currency safely", () => {
    expect(formatSessionDate("")).toBe("—");
    expect(formatSessionDate(undefined)).toBe("—");
    expect(formatSessionDate("2026-12-10T09:00:00.000Z")).toContain("2026");

    expect(formatCourseCost(0)).toBe("Free");
    expect(formatCourseCost(undefined)).toBe("Free");
    expect(formatCourseCost(9000000)).toBe("₦90,000");
  });

  it("maps categories bidirectionally", () => {
    expect(mapBackendCategoryToUi("compliance")).toBe("Compliance");
    expect(mapBackendCategoryToUi("management")).toBe("Management");
    expect(mapBackendCategoryToUi("sales")).toBe("Sales");
    expect(mapBackendCategoryToUi("technical")).toBe("Technical");
    expect(mapBackendCategoryToUi("onboarding")).toBe("Onboarding");
    expect(mapBackendCategoryToUi("other")).toBe("Other");

    expect(toBackendCategory("Compliance")).toBe("compliance");
    expect(toBackendCategory("Management")).toBe("management");
    expect(toBackendCategory("Sales")).toBe("sales");
    expect(toBackendCategory("Technical")).toBe("technical");
    expect(toBackendCategory("Soft skills")).toBe("other");
  });

  it("maps delivery modes bidirectionally", () => {
    expect(mapBackendDeliveryModeToUi("in_person")).toBe("In-person");
    expect(mapBackendDeliveryModeToUi("virtual")).toBe("Virtual");
    expect(mapBackendDeliveryModeToUi("hybrid")).toBe("Blended");

    expect(toBackendDeliveryMode("In-person")).toBe("in_person");
    expect(toBackendDeliveryMode("Virtual")).toBe("virtual");
    expect(toBackendDeliveryMode("Blended")).toBe("hybrid");
  });

  it("maps session statuses", () => {
    expect(mapBackendSessionStatusToUi("scheduled")).toBe("Scheduled");
    expect(mapBackendSessionStatusToUi("in_progress")).toBe("In Progress");
    expect(mapBackendSessionStatusToUi("completed")).toBe("Completed");
    expect(mapBackendSessionStatusToUi("cancelled")).toBe("Cancelled");
  });

  it("maps target audiences", () => {
    expect(toBackendTargetType("All staff")).toBe("all");
    expect(toBackendTargetType("Managers only")).toBe("role");
    expect(toBackendTargetType("Engineering")).toBe("department");
    expect(toBackendTargetType("selected")).toBe("selected");
  });

  it("maps backend course item to UI shape including cost and targets", () => {
    const uiCourse = mapBackendCourseToUi({
      course: {
        id: "c-1",
        tenantId: "t-1",
        title: "Test Course",
        category: "compliance",
        defaultDeliveryMode: "virtual",
        learningObjectives: "Learn security",
        mandatory: true,
        certificateOnCompletion: true,
        targetType: "department",
        targetIds: ["dept-1"],
        costPerPersonKobo: 500000,
        status: "published",
      },
      enrolled: 15,
      completed: 10,
      completionPercent: 66.6,
    });

    expect(uiCourse.id).toBe("c-1");
    expect(uiCourse.title).toBe("Test Course");
    expect(uiCourse.category).toBe("Compliance");
    expect(uiCourse.mode).toBe("Virtual");
    expect(uiCourse.enrolled).toBe(15);
    expect(uiCourse.completionRate).toBe(67);
    expect(uiCourse.mandatory).toBe(true);
    expect(uiCourse.status).toBe("published");
    expect(uiCourse.costPerPersonKobo).toBe(500000);
    expect(uiCourse.targetType).toBe("department");
    expect(uiCourse.targetIds).toEqual(["dept-1"]);
  });

  it("maps backend upcoming session and session records with internal trainer lookup", () => {
    const uiSession = mapBackendUpcomingSessionToUi({
      session: {
        id: "s-1",
        tenantId: "t-1",
        courseId: "c-1",
        startsAt: "2026-12-15T10:00:00.000Z",
        endsAt: "2026-12-15T12:00:00.000Z",
        deliveryMode: "in_person",
        location: "Hall B",
        capacity: 20,
        trainerType: "external",
        externalProvider: "PwC",
        status: "scheduled",
      },
      courseTitle: "Leadership",
      enrolled: 5,
    });

    expect(uiSession.id).toBe("s-1");
    expect(uiSession.course).toBe("Leadership");
    expect(uiSession.trainer).toBe("PwC");
    expect(uiSession.status).toBe("Scheduled");
    expect(uiSession.location).toBe("Hall B");

    const internalSession = mapBackendSessionRecordToUi(
      {
        id: "s-2",
        tenantId: "t-1",
        courseId: "c-1",
        startsAt: "2026-12-16T10:00:00.000Z",
        endsAt: "2026-12-16T12:00:00.000Z",
        deliveryMode: "virtual",
        capacity: 15,
        trainerType: "internal",
        internalTrainerId: "staff-1",
        status: "in_progress",
      },
      "Leadership",
      3,
      { "staff-1": "Ada Lovelace" },
    );

    expect(internalSession.trainer).toBe("Ada Lovelace");
    expect(internalSession.status).toBe("In Progress");
    expect(internalSession.enrolled).toBe(3);
  });

  it("normalizes both nested { enrollment, employee } and flat participant payloads", () => {
    const nested = normalizeTrainingParticipant({
      enrollment: {
        id: "enr-1",
        courseId: "c-1",
        sessionId: "s-1",
        employeeId: "emp-1",
        status: "enrolled",
        attendanceStatus: "not_recorded",
        certificateEligible: false,
        certificateUrl: null,
      },
      employee: {
        id: "emp-1",
        employeeNumber: "UGW-9873",
        firstName: "GRACE",
        lastName: "UGWU",
        department: "DevOP Department",
      },
    });

    expect(nested.enrollmentId).toBe("enr-1");
    expect(nested.employeeId).toBe("emp-1");
    expect(nested.sessionId).toBe("s-1");
    expect(nested.name).toBe("GRACE UGWU");
    expect(nested.employeeNumber).toBe("UGW-9873");
    expect(nested.department).toBe("DevOP Department");
    expect(nested.attendanceStatus).toBe("not_recorded");

    const flat = normalizeTrainingParticipant({
      enrollmentId: "enr-2",
      employeeName: "John Doe",
      status: "completed",
      attendanceStatus: "attended",
      certificateUrl: "https://example.com/cert.pdf",
    });

    expect(flat.enrollmentId).toBe("enr-2");
    expect(flat.name).toBe("John Doe");
    expect(flat.status).toBe("completed");
    expect(flat.attendanceStatus).toBe("attended");
    expect(flat.certificateUrl).toBe("https://example.com/cert.pdf");
  });
});
