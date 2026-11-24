import { describe, expect, it } from "vitest";
import {
  formatSessionDate,
  mapBackendCategoryToUi,
  mapBackendDeliveryModeToUi,
  mapBackendSessionStatusToUi,
  toBackendCategory,
  toBackendDeliveryMode,
  toBackendTargetType,
  mapBackendCourseToUi,
  mapBackendUpcomingSessionToUi,
} from "./mappers";

describe("Training mappers", () => {
  it("formats dates safely", () => {
    expect(formatSessionDate("")).toBe("—");
    expect(formatSessionDate(undefined)).toBe("—");
    expect(formatSessionDate("2026-12-10T09:00:00.000Z")).toContain("2026");
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
  });

  it("maps backend course item to UI shape", () => {
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
        targetType: "all",
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
  });

  it("maps backend upcoming session item to UI shape", () => {
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
  });
});
