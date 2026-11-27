import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import PageHeader from "@/components/Headers/PageHeader";
import MyLearningSection from "@/routes/hr/training/-components/MyLearningSection";
import StaffCourseCardsGrid from "./-components/StaffCourseCardsGrid";
import StaffUpcomingSessionsTable from "./-components/StaffUpcomingSessionsTable";
import { useCurrentStaffIdentity } from "../-components/useCurrentStaffIdentity";
import {
  filterStaffCourses,
  type StaffTrainingScopeTab,
} from "../-components/staffScoping";
import {
  mapBackendCourseToUi,
  mapBackendUpcomingSessionToUi,
} from "@/routes/hr/training/-components/mappers";
import type { Course } from "@/routes/hr/training/-components/types";
import {
  useMyTrainingLearning,
  useTrainingCourses,
  useTrainingDashboard,
} from "@/api/trainingApi";
import { useStaffs } from "@/api/tenantApi";

export const Route = createFileRoute("/staff/training/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const [scopeTab, setScopeTab] =
    useState<StaffTrainingScopeTab>("all-relevant");

  const { identity, isLoading: identityLoading } = useCurrentStaffIdentity();
  const dashboardQuery = useTrainingDashboard();
  const catalogQuery = useTrainingCourses();
  const myLearningQuery = useMyTrainingLearning();
  const staffsQuery = useStaffs();

  const staffNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const staff of staffsQuery.data ?? []) {
      const fullName =
        `${staff.firstName ?? ""} ${staff.lastName ?? ""}`.trim();
      map[staff.id] = fullName || staff.email || staff.id;
    }
    return map;
  }, [staffsQuery.data]);

  const enrolledCourseIds = useMemo(() => {
    const ids = new Set<string>();
    for (const item of myLearningQuery.data ?? []) {
      const cid = item?.courseId || item?.course?.id;
      if (cid) ids.add(String(cid));
    }
    return ids;
  }, [myLearningQuery.data]);

  const allCourses: Course[] = useMemo(() => {
    const rawCourses =
      catalogQuery.data && catalogQuery.data.length > 0
        ? catalogQuery.data
        : (dashboardQuery.data?.courses ?? []);

    if (rawCourses.length > 0) {
      return rawCourses.map(mapBackendCourseToUi);
    }

    // Fallback when minimal staff role only has /training/my-learning access
    const fallback: Course[] = [];
    const seen = new Set<string>();
    for (const item of myLearningQuery.data ?? []) {
      const cid = String(item?.courseId || item?.course?.id || "");
      if (!cid || seen.has(cid)) continue;
      seen.add(cid);
      fallback.push({
        id: cid,
        title: item?.courseTitle || item?.course?.title || "Assigned Training",
        category: item?.course?.category || "Other",
        enrolled: 1,
        completionRate: item?.status === "completed" ? 100 : 0,
        mode: item?.course?.defaultDeliveryMode || "Virtual",
        mandatory: Boolean(item?.course?.mandatory),
        status: item?.course?.status || "published",
        certificateOnCompletion: Boolean(
          item?.course?.certificateOnCompletion ?? item?.certificateUrl,
        ),
        learningObjectives: item?.course?.learningObjectives,
        targetType: item?.course?.targetType || "department",
        targetIds: item?.course?.targetIds ?? [],
      });
    }
    return fallback;
  }, [catalogQuery.data, dashboardQuery.data?.courses, myLearningQuery.data]);

  const allRelevantCourses = useMemo(
    () =>
      filterStaffCourses(
        allCourses,
        identity,
        enrolledCourseIds,
        "all-relevant",
      ),
    [allCourses, identity, enrolledCourseIds],
  );

  const displayedCourses = useMemo(
    () => filterStaffCourses(allCourses, identity, enrolledCourseIds, scopeTab),
    [allCourses, identity, enrolledCourseIds, scopeTab],
  );

  const relevantCourseIds = useMemo(
    () => new Set(allRelevantCourses.map((c) => c.id)),
    [allRelevantCourses],
  );

  const sessions = useMemo(() => {
    const list = (dashboardQuery.data?.upcomingSessions ?? []).map((item) =>
      mapBackendUpcomingSessionToUi(item, staffNameMap),
    );
    return list.filter(
      (s) => !s.courseId || relevantCourseIds.has(s.courseId),
    );
  }, [dashboardQuery.data?.upcomingSessions, staffNameMap, relevantCourseIds]);

  const isLoading =
    identityLoading ||
    (catalogQuery.isLoading && dashboardQuery.isLoading && myLearningQuery.isLoading);

  if (isLoading) {
    return (
      <div className="space-y-6 pb-12">
        <PageHeader
          title="My Training & Development"
          description="Loading courses and sessions for your department..."
        />
        <div className="card bg-base-100 border border-base-200 p-12 text-center max-w-lg mx-auto">
          <span className="loading loading-spinner loading-lg mx-auto mb-4" />
          <p className="text-base-content/80">Loading training courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Training & Development"
        description={
          identity.departmentName
            ? `Training programs, certifications, and sessions related to ${identity.departmentName}.`
            : "Courses, certifications, and upcoming training sessions assigned to you."
        }
      />

      <MyLearningSection />

      <StaffCourseCardsGrid
        allRelevantCourses={allRelevantCourses}
        displayedCourses={displayedCourses}
        enrolledCourseIds={enrolledCourseIds}
        departmentName={identity.departmentName}
        scopeTab={scopeTab}
        onChangeScopeTab={setScopeTab}
        onSelectCourse={(course) =>
          navigate({
            to: "/staff/training/$id",
            params: { id: course.id },
          })
        }
      />

      <StaffUpcomingSessionsTable
        sessions={sessions}
        onOpenCourse={(courseId) =>
          navigate({
            to: "/staff/training/$id",
            params: { id: courseId },
          })
        }
      />
    </div>
  );
}
