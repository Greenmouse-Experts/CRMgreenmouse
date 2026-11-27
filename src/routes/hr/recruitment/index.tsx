import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import PageHeader from "@/components/Headers/PageHeader";
import PageLoader from "@/components/layout/PageLoader";
import {
  useArchiveVacancy,
  useCloseVacancy,
  useCreateVacancy,
  useDecideVacancy,
  usePublishVacancy,
  useRecruitmentApplications,
  useRecruitmentApprovers,
  useRecruitmentDashboard,
  useRecruitmentOffers,
  useRecruitmentOptions,
  useRecruitmentVacancies,
  useSubmitVacancy,
  useUnpublishVacancy,
  useUpdateApplicationStage,
  useUpdateVacancy,
  type CreateVacancyPayload,
  type RecruitmentVacancy,
} from "@/api/recruitmentApi";
import { useOrganization } from "@/api/organizationApi";
import { useEmployees } from "@/api/employeesApi";
import { extract_message } from "@/helpers/errors";
import RecruitmentStats from "./-components/RecruitmentStats";
import CandidatePipeline from "./-components/CandidatePipeline";
import VacanciesTable from "./-components/VacanciesTable";
import OfferConversionSection from "./-components/OfferConversionSection";
import CreateVacancyModal from "./-components/CreateVacancyModal";
import CandidateDetailModal from "./-components/CandidateDetailModal";
import VacancyActionModal, {
  type VacancyLifecycleAction,
} from "./-components/VacancyActionModal";
import { toUiCandidate, toUiVacancy } from "./-components/mappers";
import type { Candidate, PipelineStage, Vacancy } from "./-components/types";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/hr/recruitment/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  // Server state
  const dashboardQuery = useRecruitmentDashboard();
  const vacanciesQuery = useRecruitmentVacancies({
    sort: "vacancyNumber",
    order: "desc",
  });
  const applicationsQuery = useRecruitmentApplications();
  const departmentsQuery = useRecruitmentOptions("department");
  const approversQuery = useRecruitmentApprovers();
  const offersQuery = useRecruitmentOffers();
  const orgQuery = useOrganization();
  const employeesQuery = useEmployees();

  const createVacancyMutation = useCreateVacancy();
  const updateVacancyMutation = useUpdateVacancy();
  const submitVacancyMutation = useSubmitVacancy();
  const decideVacancyMutation = useDecideVacancy();
  const publishVacancyMutation = usePublishVacancy();
  const unpublishVacancyMutation = useUnpublishVacancy();
  const closeVacancyMutation = useCloseVacancy();
  const archiveVacancyMutation = useArchiveVacancy();
  const updateStageMutation = useUpdateApplicationStage();

  // Local view state (optimistic updates; refreshed when queries invalidate)
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isCreateVacancyOpen, setIsCreateVacancyOpen] = useState(false);
  const [editingVacancy, setEditingVacancy] =
    useState<RecruitmentVacancy | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null,
  );
  const [actionTarget, setActionTarget] = useState<{
    vacancy: Vacancy;
    action: VacancyLifecycleAction;
  } | null>(null);

  useEffect(() => {
    if (applicationsQuery.data) {
      setCandidates(applicationsQuery.data.map(toUiCandidate));
    }
  }, [applicationsQuery.data]);

  const nameLookup = useMemo(() => {
    const map: Record<string, string> = {};
    for (const a of approversQuery.data ?? []) {
      if (a.id && a.name) map[a.id] = a.name;
    }
    for (const e of employeesQuery.data ?? []) {
      const full = `${e.firstName ?? ""} ${e.lastName ?? ""}`.trim();
      if (e.id && (full || e.email)) map[e.id] = full || e.email || e.id;
    }
    return map;
  }, [approversQuery.data, employeesQuery.data]);

  const vacancies = useMemo(
    () =>
      (vacanciesQuery.data ?? []).map((raw) => toUiVacancy(raw, nameLookup)),
    [vacanciesQuery.data, nameLookup],
  );

  const departmentOptions =
    departmentsQuery.data && departmentsQuery.data.length > 0
      ? departmentsQuery.data.map((d) => ({
          id: d.id,
          name: d.name || "Department",
        }))
      : (orgQuery.data?.departments ?? []).map((d) => ({
          id: d.id,
          name: d.name || "Department",
        }));

  const approverOptions =
    approversQuery.data && approversQuery.data.length > 0
      ? approversQuery.data.map((a) => ({
          id: a.id,
          name: a.name || "Approver",
        }))
      : (employeesQuery.data ?? []).map((e) => ({
          id: e.id,
          name:
            `${e.firstName ?? ""} ${e.lastName ?? ""}`.trim() ||
            e.email ||
            "Approver",
        }));

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
        error: (error) => extract_message(error),
      },
    );
  };

  const handleUpdateCandidateStage = (
    candidateId: string,
    newStage: PipelineStage,
  ) => {
    handleAdvanceStage(candidateId, newStage);
  };

  const handleCreateVacancy = async (payload: CreateVacancyPayload) => {
    if (!payload.departmentId) {
      toast.error("Recruitment setup incomplete", {
        description: "Configure departments before creating a vacancy.",
      });
      throw new Error("Recruitment setup incomplete: missing department");
    }

    if (!payload.approverId || !payload.hiringManagerId) {
      toast.error("Recruitment setup incomplete", {
        description:
          "Configure approvers or staff members before creating a vacancy.",
      });
      throw new Error("Recruitment setup incomplete: missing approver");
    }

    return await toast.promise(createVacancyMutation.mutateAsync(payload), {
      loading: "Submitting vacancy requisition...",
      success: payload.saveAsDraft
        ? "Vacancy saved as draft"
        : "Vacancy submitted for approval",
      error: (error) => extract_message(error),
    });
  };

  const handleUpdateVacancy = async (
    id: string,
    payload: Partial<CreateVacancyPayload>,
  ) => {
    return await toast.promise(
      updateVacancyMutation.mutateAsync({ id, ...payload }),
      {
        loading: "Saving vacancy changes...",
        success: "Vacancy updated",
        error: (error) => extract_message(error),
      },
    );
  };

  const handleSubmitVacancy = (vacancy: Vacancy) => {
    toast.promise(submitVacancyMutation.mutateAsync(vacancy.id), {
      loading: "Submitting vacancy for approval...",
      success: "Vacancy submitted for approval",
      error: (error) => extract_message(error),
    });
  };

  const handlePublishVacancy = (vacancy: Vacancy) => {
    toast.promise(publishVacancyMutation.mutateAsync(vacancy.id), {
      loading: "Publishing vacancy...",
      success: "Vacancy is now published",
      error: (error) => extract_message(error),
    });
  };

  const handleConfirmAction = async (reason?: string) => {
    if (!actionTarget) return;
    const { vacancy, action } = actionTarget;

    try {
      switch (action) {
        case "approve":
          await decideVacancyMutation.mutateAsync({
            id: vacancy.id,
            decision: "approve",
            reason,
          });
          toast.success("Vacancy approved");
          break;
        case "reject":
          await decideVacancyMutation.mutateAsync({
            id: vacancy.id,
            decision: "reject",
            reason,
          });
          toast.success("Vacancy rejected");
          break;
        case "unpublish":
          await unpublishVacancyMutation.mutateAsync({
            id: vacancy.id,
            reason,
          });
          toast.success("Vacancy unpublished");
          break;
        case "close":
          await closeVacancyMutation.mutateAsync({
            id: vacancy.id,
            reason,
          });
          toast.success("Vacancy closed");
          break;
        case "archive":
          await archiveVacancyMutation.mutateAsync({
            id: vacancy.id,
            reason,
          });
          toast.success("Vacancy archived");
          break;
      }
      setActionTarget(null);
    } catch (error) {
      toast.error(extract_message(error));
    }
  };

  const isActionPending =
    decideVacancyMutation.isPending ||
    unpublishVacancyMutation.isPending ||
    closeVacancyMutation.isPending ||
    archiveVacancyMutation.isPending;

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Recruitment & Hiring"
        description="Requisition → approve → publish → screen → interview → offer → convert to employee."
      >
        <button
          type="button"
          onClick={() => {
            setEditingVacancy(null);
            setIsCreateVacancyOpen(true);
          }}
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
        {(dashboard) => <RecruitmentStats stats={dashboard} />}
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
          description:
            "Create a vacancy to start tracking your hiring pipeline.",
          actionText: "Create vacancy",
          onAction: () => {
            setEditingVacancy(null);
            setIsCreateVacancyOpen(true);
          },
        }}
      >
        <VacanciesTable
          vacancies={vacancies}
          onSelectVacancy={(v) =>
            navigate({
              to: "/hr/recruitment/$id",
              params: { id: v.id },
            })
          }
          onEditVacancy={(v) => {
            if (v.raw) {
              setEditingVacancy(v.raw);
              setIsCreateVacancyOpen(true);
            }
          }}
          onSubmitVacancy={handleSubmitVacancy}
          onApproveVacancy={(v) =>
            setActionTarget({ vacancy: v, action: "approve" })
          }
          onRejectVacancy={(v) =>
            setActionTarget({ vacancy: v, action: "reject" })
          }
          onPublishVacancy={handlePublishVacancy}
          onUnpublishVacancy={(v) =>
            setActionTarget({ vacancy: v, action: "unpublish" })
          }
          onCloseVacancy={(v) =>
            setActionTarget({ vacancy: v, action: "close" })
          }
          onArchiveVacancy={(v) =>
            setActionTarget({ vacancy: v, action: "archive" })
          }
        />
      </PageLoader>

      <OfferConversionSection offers={offersQuery.data ?? []} />

      <CreateVacancyModal
        isOpen={isCreateVacancyOpen}
        onClose={() => {
          setIsCreateVacancyOpen(false);
          setEditingVacancy(null);
        }}
        onCreateVacancy={handleCreateVacancy}
        onUpdateVacancy={handleUpdateVacancy}
        initialVacancy={editingVacancy}
        departments={departmentOptions}
        approvers={approverOptions}
        managers={approverOptions}
      />

      <VacancyActionModal
        isOpen={Boolean(actionTarget)}
        onClose={() => setActionTarget(null)}
        action={actionTarget?.action ?? null}
        vacancyTitle={actionTarget?.vacancy.title}
        onConfirm={handleConfirmAction}
        isPending={isActionPending}
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
