import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/Headers/PageHeader";
import PageLoader from "@/components/layout/PageLoader";
import {
  useCreateVacancy,
  useDecideVacancy,
  usePublishVacancy,
  useRecruitmentApplications,
  useRecruitmentApprovers,
  useRecruitmentDashboard,
  useRecruitmentOptions,
  useRecruitmentVacancies,
  useUpdateApplicationStage,
  type RecruitmentApplication,
  type RecruitmentVacancy,
} from "@/api/recruitmentApi";
import { extract_message } from "@/helpers/auth";
import RecruitmentStats from "./-components/RecruitmentStats";
import CandidatePipeline from "./-components/CandidatePipeline";
import VacanciesTable from "./-components/VacanciesTable";
import OfferConversionSection from "./-components/OfferConversionSection";
import CreateVacancyModal from "./-components/CreateVacancyModal";
import CandidateDetailModal from "./-components/CandidateDetailModal";
import type {
  Candidate,
  PipelineStage,
  Vacancy,
  VacancyStatus,
} from "./-components/types";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/hr/recruitment/")({
  component: RouteComponent,
});

const STATUS_MAP: Record<string, VacancyStatus> = {
  published: "Published",
  approved: "Published",
  active: "Published",
  draft: "Draft",
  pending: "Pending Approval",
  pending_approval: "Pending Approval",
  closed: "Closed",
  rejected: "Closed",
  cancelled: "Closed",
};

const STAGE_MAP: Record<string, PipelineStage> = {
  applied: "Applied",
  screening: "Screening",
  shortlisted: "Shortlisted",
  interview: "Interview",
  assessment: "Assessment",
  offer: "Offer",
  hired: "Hired",
};

function toUiVacancy(raw: RecruitmentVacancy): Vacancy {
  const status = raw.status?.toLowerCase();
  return {
    id: raw.id,
    title: raw.jobTitle ?? raw.title ?? "Untitled vacancy",
    dept: raw.department ?? raw.departmentName ?? "—",
    openings: raw.openings ?? 1,
    applicants: raw.applicants ?? raw.applicationCount ?? 0,
    closes: raw.closingDate
      ? new Date(raw.closingDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      : "—",
    status: (status && STATUS_MAP[status]) || "Draft",
    grade: raw.grade,
    type: raw.employmentType,
    location: raw.location,
    reason: raw.reasonForHire,
    budget: raw.budget,
    desc: raw.jobDescription,
  };
}

function toUiCandidate(raw: RecruitmentApplication): Candidate {
  const stageKey = (raw.stage ?? raw.applicationStage ?? "applied").toLowerCase();
  return {
    id: raw.id,
    name:
      raw.name ||
      [raw.firstName, raw.lastName].filter(Boolean).join(" ") ||
      "Candidate",
    role: raw.vacancyTitle ?? raw.jobTitle ?? "Applicant",
    stage: STAGE_MAP[stageKey] ?? "Applied",
    score: raw.score ?? 0,
    email: raw.email,
    phone: raw.phone,
    appliedDate: raw.appliedAt ?? raw.createdAt,
  };
}

function RouteComponent() {
  // Server state
  const dashboardQuery = useRecruitmentDashboard();
  const vacanciesQuery = useRecruitmentVacancies();
  const applicationsQuery = useRecruitmentApplications();
  const departmentsQuery = useRecruitmentOptions("department");
  const approversQuery = useRecruitmentApprovers();

  const createVacancyMutation = useCreateVacancy();
  const updateStageMutation = useUpdateApplicationStage();
  const publishVacancyMutation = usePublishVacancy();
  const decideVacancyMutation = useDecideVacancy();

  // Local view state (optimistic updates; refreshed when queries invalidate)
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);

  useEffect(() => {
    if (applicationsQuery.data) {
      setCandidates(applicationsQuery.data.map(toUiCandidate));
    }
  }, [applicationsQuery.data]);

  useEffect(() => {
    if (vacanciesQuery.data) {
      setVacancies(vacanciesQuery.data.map(toUiVacancy));
    }
  }, [vacanciesQuery.data]);

  const [isCreateVacancyOpen, setIsCreateVacancyOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null,
  );

  const handleAdvanceStage = (
    candidateId: string,
    nextStage: PipelineStage,
  ) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, stage: nextStage } : c)),
    );

    toast.promise(
      updateStageMutation.mutateAsync({
        id: candidateId,
        stage: nextStage.toLowerCase() as "applied",
      }),
      {
        loading: "Updating candidate stage...",
        success: `Candidate advanced to ${nextStage}`,
        error: (error) => extract_message(error as never),
      },
    );
  };

  const handleUpdateCandidateStage = (
    candidateId: string,
    newStage: PipelineStage,
  ) => {
    handleAdvanceStage(candidateId, newStage);
  };

  const handleCreateVacancy = (newVacancy: Vacancy) => {
    const departments = departmentsQuery.data ?? [];
    const approvers = approversQuery.data ?? [];

    const department = departments.find(
      (d) => d.name.toLowerCase() === newVacancy.dept.toLowerCase(),
    );
    const approver =
      approvers.find(
        (a) => a.name.toLowerCase() === (newVacancy.approver ?? "").toLowerCase(),
      ) ?? approvers[0];
    const hiringManager = approvers[0];

    if (!department || !approver || !hiringManager) {
      toast.error("Recruitment setup incomplete", {
        description:
          "Configure departments and approvers before creating a vacancy.",
      });
      return;
    }

    toast.promise(
      createVacancyMutation.mutateAsync({
        jobTitle: newVacancy.title,
        departmentId: department.id,
        openings: newVacancy.openings,
        employmentType: newVacancy.type ?? "Full-time",
        reasonForHire: newVacancy.reason ?? "New position",
        jobDescription: newVacancy.desc ?? "",
        closingDate: new Date(newVacancy.closes).toISOString(),
        hiringManagerId: hiringManager.id,
        approverId: approver.id,
      }),
      {
        loading: "Submitting vacancy requisition...",
        success: "Vacancy submitted for approval",
        error: (error) => extract_message(error as never),
      },
    );
  };

  const handleUpdateVacancyStatus = (
    vacancyId: string,
    status: VacancyStatus,
  ) => {
    if (status === "Published") {
      toast.promise(publishVacancyMutation.mutateAsync(vacancyId), {
        loading: "Publishing vacancy...",
        success: "Vacancy is now published",
        error: (error) => extract_message(error as never),
      });
      return;
    }

    if (status === "Closed") {
      toast.promise(
        decideVacancyMutation.mutateAsync({ id: vacancyId, decision: "reject" }),
        {
          loading: "Closing vacancy...",
          success: "Vacancy closed",
          error: (error) => extract_message(error as never),
        },
      );
      return;
    }

    setVacancies((prev) =>
      prev.map((v) => (v.id === vacancyId ? { ...v, status } : v)),
    );
    toast.success(`Vacancy status updated to ${status}`);
  };

  const handleDeleteVacancy = (vacancyId: string) => {
    setVacancies((prev) => prev.filter((v) => v.id !== vacancyId));
    toast.success("Vacancy listing removed");
  };

  const dashboard = dashboardQuery.data;

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Recruitment & Hiring"
        description="Requisition → publish → screen → interview → offer → convert to employee."
      >
        <button
          type="button"
          onClick={() => setIsCreateVacancyOpen(true)}
          className="btn btn-sm bg-primary text-white hover:bg-primary/90 border-0 rounded-xl px-4 font-medium gap-1.5 shadow-sm shadow-primary/20"
        >
          <Plus className="size-4" />
          <span>Create vacancy</span>
        </button>
      </PageHeader>

      {/* Stats from /recruitment/dashboard */}
      <PageLoader
        query={dashboardQuery}
        loadingText="Loading recruitment overview..."
      >
        <RecruitmentStats
          vacancies={
            dashboard?.vacancies?.length
              ? dashboard.vacancies.map(toUiVacancy)
              : vacancies
          }
          candidates={candidates}
        />
      </PageLoader>

      {/* Candidate pipeline from /recruitment/applications */}
      <PageLoader
        query={applicationsQuery}
        emptyState={{
          title: "No applications yet",
          description:
            "Applications will appear here as candidates apply to published vacancies.",
        }}
      >
        <CandidatePipeline
          candidates={candidates}
          onSelectCandidate={(c) => setSelectedCandidate(c)}
          onAdvanceStage={handleAdvanceStage}
        />
      </PageLoader>

      {/* Vacancies from /recruitment/vacancies */}
      <PageLoader
        query={vacanciesQuery}
        emptyState={{
          title: "No vacancies yet",
          description: "Create a vacancy to start tracking your hiring pipeline.",
          actionText: "Create vacancy",
          onAction: () => setIsCreateVacancyOpen(true),
        }}
      >
        <VacanciesTable
          vacancies={vacancies}
          onSelectVacancy={(v) => {
            toast.info(`${v.id}: ${v.title} (${v.dept}) — ${v.status}`);
          }}
          onUpdateStatus={handleUpdateVacancyStatus}
          onDeleteVacancy={handleDeleteVacancy}
        />
      </PageLoader>

      <OfferConversionSection />

      <CreateVacancyModal
        isOpen={isCreateVacancyOpen}
        onClose={() => setIsCreateVacancyOpen(false)}
        onCreateVacancy={handleCreateVacancy}
      />

      <CandidateDetailModal
        candidate={selectedCandidate}
        isOpen={!!selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
        onUpdateStage={handleUpdateCandidateStage}
      />
    </div>
  );
}
