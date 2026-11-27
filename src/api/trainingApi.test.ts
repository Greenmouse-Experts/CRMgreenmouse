import { describe, expect, it } from "vitest";
import {
  extractMyLearningItems,
  normalizeMyLearningEntry,
} from "./trainingApi";

describe("trainingApi my-learning helpers", () => {
  it("extracts my-learning items from flat, nested, and keyed payload wrappers", () => {
    expect(extractMyLearningItems([{ id: "e-1", courseId: "c-1" }])).toHaveLength(
      1,
    );
    expect(
      extractMyLearningItems({ data: [{ id: "e-2", courseId: "c-2" }] }),
    ).toHaveLength(1);
    expect(
      extractMyLearningItems({
        data: { enrollments: [{ id: "e-3", courseId: "c-3" }] },
      }),
    ).toHaveLength(1);
    expect(
      extractMyLearningItems({
        data: { data: [{ id: "e-4", courseId: "c-4" }] },
      }),
    ).toHaveLength(1);
    expect(extractMyLearningItems({ items: [{ id: "e-5" }] })).toHaveLength(1);
    expect(extractMyLearningItems(null)).toEqual([]);
  });

  it("normalizes both nested { enrollment, course, session } and flat my-learning items", () => {
    const nested = normalizeMyLearningEntry({
      enrollment: {
        id: "enr-1",
        courseId: "course-1",
        sessionId: "sess-1",
        status: "completed",
        attendanceStatus: "attended",
        certificateEligible: true,
        certificateUrl: "https://example.com/cert.pdf",
      },
      course: {
        id: "course-1",
        tenantId: "tenant-1",
        title: "Security Essentials",
        category: "compliance",
        defaultDeliveryMode: "virtual",
        learningObjectives: "<p>Protect data</p>",
        mandatory: true,
        certificateOnCompletion: true,
        targetType: "department",
        targetIds: ["dept-1"],
        status: "published",
      },
      session: {
        id: "sess-1",
        tenantId: "tenant-1",
        courseId: "course-1",
        startsAt: "2026-12-01T09:00:00.000Z",
        endsAt: "2026-12-01T11:00:00.000Z",
        deliveryMode: "virtual",
        capacity: 30,
        trainerType: "internal",
        internalTrainerId: "staff-1",
        status: "scheduled",
      },
      materials: [{ id: "mat-1", title: "Handbook" }],
    });

    expect(nested).not.toBeNull();
    expect(nested?.enrollmentId).toBe("enr-1");
    expect(nested?.courseId).toBe("course-1");
    expect(nested?.courseTitle).toBe("Security Essentials");
    expect(nested?.status).toBe("completed");
    expect(nested?.certificateUrl).toBe("https://example.com/cert.pdf");
    expect(nested?.courseRecord.category).toBe("compliance");
    expect(nested?.courseRecord.targetIds).toEqual(["dept-1"]);
    expect(nested?.sessions).toHaveLength(1);
    expect(nested?.materials).toHaveLength(1);

    const flat = normalizeMyLearningEntry({
      id: "enr-2",
      courseId: "course-2",
      courseTitle: "Customer Empathy",
      category: "sales",
      defaultDeliveryMode: "in_person",
      status: "enrolled",
    });

    expect(flat?.courseId).toBe("course-2");
    expect(flat?.courseTitle).toBe("Customer Empathy");
    expect(flat?.courseRecord.category).toBe("sales");
    expect(flat?.courseRecord.defaultDeliveryMode).toBe("in_person");
    expect(flat?.status).toBe("enrolled");
  });
});
