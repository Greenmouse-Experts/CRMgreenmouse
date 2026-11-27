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
  mapBackendSessionRecordToUi,
  mapCourseRecordToUi,
} from "@/routes/hr/training/-components/mappers";
import type {
  Course,
  TrainingSession,
} from "@/routes/hr/training/-components/types";
import {
  normalizeMyLearningEntry,
  useMyTrainingLearning,
  type NormalizedMyLearningEntry,
} from "@/api/trainingApi";
import { useEmployeeColleagues } from "@/api/employeesApi";
import { AlertCircle } from "lucide-react";

export const Route = createFileRoute("/staff/training/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const [scopeTab, setScopeTab] =
    useState<StaffTrainingScopeTab>("all-relevant");

  const { identity, isLoading: identityLoading } = useCurrentStaffIdentity();
  const myLearningQuery = useMyTrainingLearning();
  const colleaguesQuery = useEmployeeColleagues({ limit: 100 });

  const staffNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const colleague of colleaguesQuery.data?.data ?? []) {
      const fullName =
        `${colleague.firstName ?? ""} ${colleague.lastName ?? ""}`.trim();
      const label = fullName || colleague.email || colleague.id;
      if (colleague.id) map[colleague.id] = label;
      if (colleague.staffId) map[colleague.staffId] = label;
    }
    return map;
  }, [colleaguesQuery.data?.data]);

  const myLearningEntries = useMemo(
    () =>
      (myLearningQuery.data ?? [])
        .map(normalizeMyLearningEntry)
        .filter((entry): entry is NormalizedMyLearningEntry => Boolean(entry)),
    [myLearningQuery.data],
  );

  const enrolledCourseIds = useMemo(() => {
    const ids = new Set<string>();
    for (const entry of myLearningEntries) {
      ids.add(entry.courseId);
    }
    return ids;
  }, [myLearningEntries]);

  const allCourses: Course[] = useMemo(() => {
    const seen = new Set<string>();
    const list: Course[] = [];

    for (const entry of myLearningEntries) {
      if (seen.has(entry.courseId)) continue;
      seen.add(entry.courseId);
      const isCompleted = entry.status.toLowerCase() === "completed";
      list.push(
        mapCourseRecordToUi(entry.courseRecord, {
          enrolled: 1,
          completionPercent: isCompleted ? 100 : 0,
        }),
      );
    }

    return list;
  }, [myLearningEntries]);

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

  const sessions: TrainingSession[] = useMemo(() => {
    const seen = new Set<string>();
    const list: TrainingSession[] = [];

    for (const entry of myLearningEntries) {
      for (const session of entry.sessions) {
        if (!session.id || seen.has(session.id)) continue;
        seen.add(session.id);
        const uiSession = mapBackendSessionRecordToUi(
          session,
          entry.courseTitle,
          1,
          staffNameMap,
        );
        if (!uiSession.courseId || relevantCourseIds.has(uiSession.courseId)) {
          list.push(uiSession);
        }
      }
    }

    return list;
  }, [myLearningEntries, staffNameMap, relevantCourseIds]);

  const isLoading = identityLoading || myLearningQuery.isLoading;

  if (isLoading) {
    return (
      <div className="space-y-6 pb-12">
        <PageHeader
          title="My Training & Development"
          description="Loading courses and sessions for your account..."
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
            ? `Training programs, certifications, and sessions for ${identity.departmentName}.`
            : "Courses, certifications, and upcoming training sessions assigned to you."
        }
      />

      {myLearningQuery.isError && (
        <div
          className="alert border border-error/30 bg-error/10 text-sm flex items-center justify-between gap-3"
          role="alert"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="size-5 text-error shrink-0" />
            <span>Could not load your training records. Please try again.</span>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-outline"
            onClick={() => myLearningQuery.refetch()}
          >
            Retry
          </button>
        </div>
      )}

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
