import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import PageHeader from "@/components/Headers/PageHeader";
import QueryCompLayout from "@/components/layout/QueryCompLayout";
import StatCard from "@/components/StatCard";
import { RichTextContent } from "@/components/inputs/RichTextEditor";
import {
  useArchiveVacancy,
  useCloseVacancy,
  useCreateApplication,
  useDecideVacancy,
  usePublishVacancy,
  useRecruitmentApplications,
  useRecruitmentApprovers,
  useRecruitmentOptions,
  useRecruitmentVacancy,
  useSubmitVacancy,
  useUnpublishVacancy,
  useUpdateApplicationStage,
  useUpdateVacancy,
  type CreateApplicationPayload,
  type CreateVacancyPayload,
} from "@/api/recruitmentApi";
import { useOrganization } from "@/api/organizationApi";
import { useEmployees } from "@/api/employeesApi";
import { extract_message } from "@/helpers/errors";
import CreateVacancyModal from "./-components/CreateVacancyModal";
import CandidateDetailModal from "./-components/CandidateDetailModal";
import VacancyActionModal, {
  type VacancyLifecycleAction,
} from "./-components/VacancyActionModal";
import AddApplicationModal from "./-components/AddApplicationModal";
import {
  formatVacancyDate,
  getVacancyStatusBadgeClass,
  toUiCandidate,
  toUiVacancy,
} from "./-components/mappers";
import type { Candidate, PipelineStage } from "./-components/types";
import { toast } from "sonner";
import {
  Archive,
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Coins,
  EyeOff,
  FileText,
  Globe,
  Lock,
  MapPin,
  Pencil,
  Send,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";

export const Route = createFileRoute("/hr/recruitment/$id")({
  component: VacancyDetailPage,
});

function VacancyDetailPage() {
  const { id } = Route.useParams();

  const vacancyQuery = useRecruitmentVacancy(id);
  const applicationsQuery = useRecruitmentApplications({ vacancyId: id });
  const departmentsQuery = useRecruitmentOptions("department");
  const approversQuery = useRecruitmentApprovers();
  const orgQuery = useOrganization();
  const employeesQuery = useEmployees();

  const updateVacancyMutation = useUpdateVacancy();
  const submitVacancyMutation = useSubmitVacancy();
  const decideVacancyMutation = useDecideVacancy();
  const publishVacancyMutation = usePublishVacancy();
  const unpublishVacancyMutation = useUnpublishVacancy();
  const closeVacancyMutation = useCloseVacancy();
  const archiveVacancyMutation = useArchiveVacancy();
  const createApplicationMutation = useCreateApplication();
  const updateStageMutation = useUpdateApplicationStage();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddCandidateOpen, setIsAddCandidateOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null,
  );
  const [activeAction, setActiveAction] =
    useState<VacancyLifecycleAction | null>(null);

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

  const departmentOptions = useMemo(
    () =>
      departmentsQuery.data && departmentsQuery.data.length > 0
        ? departmentsQuery.data.map((d) => ({
            id: d.id,
            name: d.name || "Department",
          }))
        : (orgQuery.data?.departments ?? []).map((d) => ({
            id: d.id,
            name: d.name || "Department",
          })),
    [departmentsQuery.data, orgQuery.data?.departments],
  );

  const approverOptions = useMemo(
    () =>
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
          })),
    [approversQuery.data, employeesQuery.data],
  );

  const rawVacancy = vacancyQuery.data;
  const vacancy = useMemo(
    () => (rawVacancy ? toUiVacancy(rawVacancy, nameLookup) : null),
    [rawVacancy, nameLookup],
  );

  const applicants = useMemo(
    () => (applicationsQuery.data ?? []).map(toUiCandidate),
    [applicationsQuery.data],
  );

  const handleUpdateVacancy = async (
    vacancyId: string,
    payload: Partial<CreateVacancyPayload>,
  ) => {
    return await toast.promise(
      updateVacancyMutation.mutateAsync({ id: vacancyId, ...payload }),
      {
        loading: "Saving vacancy changes...",
        success: "Vacancy updated",
        error: (error) => extract_message(error),
      },
    );
  };

  const handleSubmitForApproval = () => {
    if (!vacancy) return;
    toast.promise(submitVacancyMutation.mutateAsync(vacancy.id), {
      loading: "Submitting vacancy for approval...",
      success: "Vacancy submitted for approval",
      error: (error) => extract_message(error),
    });
  };

  const handlePublish = () => {
    if (!vacancy) return;
    toast.promise(publishVacancyMutation.mutateAsync(vacancy.id), {
      loading: "Publishing vacancy...",
      success: "Vacancy is now published",
      error: (error) => extract_message(error),
    });
  };

  const handleConfirmAction = async (reason?: string) => {
    if (!vacancy || !activeAction) return;
    try {
      switch (activeAction) {
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
      setActiveAction(null);
    } catch (error) {
      toast.error(extract_message(error));
    }
  };

  const handleCreateApplication = async (payload: CreateApplicationPayload) => {
    if (!vacancy) return;
    return await toast.promise(
      createApplicationMutation.mutateAsync({
        vacancyId: vacancy.id,
        ...payload,
      }),
      {
        loading: "Adding candidate application...",
        success: "Candidate added to vacancy",
        error: (error) => extract_message(error),
      },
    );
  };

  const handleUpdateCandidateStage = (
    candidateId: string,
    newStage: PipelineStage,
  ) => {
    toast.promise(
      updateStageMutation.mutateAsync({
        id: candidateId,
        stage: newStage.toLowerCase() as "applied",
      }),
      {
        loading: "Updating candidate stage...",
        success: `Candidate moved to ${newStage}`,
        error: (error) => extract_message(error),
      },
    );
  };

  const isActionPending =
    decideVacancyMutation.isPending ||
    unpublishVacancyMutation.isPending ||
    closeVacancyMutation.isPending ||
    archiveVacancyMutation.isPending;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-2">
        <Link
          to="/hr/recruitment"
          className="btn btn-sm btn-ghost rounded-xl gap-1.5 text-base-content/80 hover:text-base-content"
        >
          <ArrowLeft className="size-4" />
          <span>Back to Recruitment</span>
        </Link>
      </div>

      <QueryCompLayout query={vacancyQuery}>
        {() => {
          if (!vacancy || !rawVacancy) {
            return (
              <div className="card bg-base-100 border border-base-200 p-8 text-center">
                <p className="font-semibold text-base-content">
                  Vacancy not found
                </p>
              </div>
            );
          }

          const isDraft = vacancy.status === "Draft";
          const isPendingApproval = vacancy.status === "Pending Approval";
          const isPublished = vacancy.status === "Published";
          const canPublish = ["Approved", "Unpublished", "Draft"].includes(
            vacancy.status,
          );
          const canEdit = !["Closed", "Archived"].includes(vacancy.status);
          const canClose = !["Closed", "Archived"].includes(vacancy.status);
          const canArchive = vacancy.status !== "Archived";

          return (
            <div className="space-y-6">
              <PageHeader
                title={vacancy.title}
                description={`${vacancy.vacancyNumber ? `${vacancy.vacancyNumber} · ` : ""}${vacancy.dept} · ${vacancy.type || "Full-time"}`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${getVacancyStatusBadgeClass(vacancy.status)}`}
                  >
                    {vacancy.status}
                  </span>

                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => setIsEditOpen(true)}
                      className="btn btn-sm btn-outline rounded-xl gap-1.5"
                    >
                      <Pencil className="size-3.5" />
                      <span>Edit</span>
                    </button>
                  )}

                  {isDraft && (
                    <button
                      type="button"
                      disabled={submitVacancyMutation.isPending}
                      onClick={handleSubmitForApproval}
                      className="btn btn-sm bg-primary text-white hover:bg-primary/90 border-0 rounded-xl gap-1.5"
                    >
                      <Send className="size-3.5" />
                      <span>Submit for approval</span>
                    </button>
                  )}

                  {isPendingApproval && (
                    <>
                      <button
                        type="button"
                        onClick={() => setActiveAction("approve")}
                        className="btn btn-sm bg-primary text-white hover:bg-primary/90 border-0 rounded-xl gap-1.5"
                      >
                        <CheckCircle2 className="size-3.5" />
                        <span>Approve vacancy</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveAction("reject")}
                        className="btn btn-sm btn-outline btn-error rounded-xl gap-1.5"
                      >
                        <XCircle className="size-3.5" />
                        <span>Reject</span>
                      </button>
                    </>
                  )}

                  {canPublish && (
                    <button
                      type="button"
                      disabled={publishVacancyMutation.isPending}
                      onClick={handlePublish}
                      className="btn btn-sm bg-primary text-white hover:bg-primary/90 border-0 rounded-xl gap-1.5"
                    >
                      <Globe className="size-3.5" />
                      <span>Publish</span>
                    </button>
                  )}

                  {isPublished && (
                    <button
                      type="button"
                      onClick={() => setActiveAction("unpublish")}
                      className="btn btn-sm btn-outline rounded-xl gap-1.5"
                    >
                      <EyeOff className="size-3.5" />
                      <span>Unpublish</span>
                    </button>
                  )}

                  {canClose && (
                    <button
                      type="button"
                      onClick={() => setActiveAction("close")}
                      className="btn btn-sm btn-outline btn-error rounded-xl gap-1.5"
                    >
                      <Lock className="size-3.5" />
                      <span>Close</span>
                    </button>
                  )}

                  {canArchive && (
                    <button
                      type="button"
                      onClick={() => setActiveAction("archive")}
                      className="btn btn-sm btn-ghost rounded-xl gap-1.5"
                    >
                      <Archive className="size-3.5" />
                      <span>Archive</span>
                    </button>
                  )}
                </div>
              </PageHeader>

              {isPendingApproval && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-amber-300/70 bg-amber-50/70 p-4 text-sm">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="size-5 shrink-0 text-amber-700 mt-0.5" />
                    <div>
                      <p className="font-bold text-amber-950">
                        Pending Approval
                      </p>
                      <p className="text-amber-900/80">
                        Assigned approver:{" "}
                        <strong>{vacancy.approver || "Pending"}</strong>. Approve
                        this requisition before publishing to candidates.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setActiveAction("reject")}
                      className="btn btn-sm btn-outline btn-error rounded-xl gap-1"
                    >
                      <XCircle className="size-3.5" />
                      <span>Reject</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveAction("approve")}
                      className="btn btn-sm bg-primary text-white hover:bg-primary/90 border-0 rounded-xl gap-1"
                    >
                      <CheckCircle2 className="size-3.5" />
                      <span>Approve vacancy</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Summary Metrics */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <StatCard
                  title="Openings"
                  value={String(vacancy.openings)}
                  desc="Headcount requested"
                  icon={<Briefcase className="size-5" />}
                  variant="primary"
                />
                <StatCard
                  title="Applicants"
                  value={String(Math.max(vacancy.applicants, applicants.length))}
                  desc="Total candidates"
                  icon={<Users className="size-5" />}
                  variant="info"
                />
                <StatCard
                  title="Closing Date"
                  value={formatVacancyDate(vacancy.closingDate)}
                  desc="Application deadline"
                  icon={<Calendar className="size-5" />}
                  variant="warning"
                />
                <StatCard
                  title="Compensation"
                  value={vacancy.budget || "Not specified"}
                  desc={vacancy.salaryPeriod ? `${vacancy.salaryPeriod} range` : "Salary band"}
                  icon={<Coins className="size-5" />}
                  variant="success"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Left Column: Description & Applicants */}
                <div className="lg:col-span-2 space-y-6">
                  <section className="card bg-base-100 border border-base-200 shadow-sm p-5 sm:p-6 space-y-3">
                    <div className="flex items-center gap-2">
                      <FileText className="size-4 text-primary" />
                      <h2 className="text-lg font-bold text-base-content">
                        Job Description &amp; Requirements
                      </h2>
                    </div>
                    {vacancy.desc ? (
                      <div className="rounded-xl border border-base-200 bg-base-200/20 p-4">
                        <RichTextContent value={vacancy.desc} />
                      </div>
                    ) : (
                      <p className="text-sm text-base-content/70">
                        No job description provided.
                      </p>
                    )}
                  </section>

                  <section className="card bg-base-100 border border-base-200 shadow-sm p-5 sm:p-6 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-bold text-base-content">
                          Applicants ({applicants.length})
                        </h2>
                        <p className="text-sm text-base-content/75">
                          Candidates who applied for this vacancy
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsAddCandidateOpen(true)}
                        className="btn btn-sm bg-primary text-white hover:bg-primary/90 border-0 rounded-xl gap-1.5"
                      >
                        <UserPlus className="size-3.5" />
                        <span>Add candidate</span>
                      </button>
                    </div>

                    {applicationsQuery.isLoading ? (
                      <div className="py-8 text-center">
                        <span className="loading loading-spinner loading-md" />
                      </div>
                    ) : applicants.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-base-300 bg-base-200/30 p-8 text-center space-y-2">
                        <Users className="size-6 mx-auto text-base-content/50" />
                        <p className="text-sm font-semibold text-base-content">
                          No applicants yet
                        </p>
                        <p className="text-sm text-base-content/70">
                          Add a candidate manually or publish the vacancy to
                          receive applications.
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-base-200">
                        {applicants.map((candidate) => (
                          <div
                            key={candidate.id}
                            onClick={() => setSelectedCandidate(candidate)}
                            className="flex flex-wrap items-center justify-between gap-3 py-3 px-2 rounded-lg hover:bg-base-200/40 cursor-pointer transition-colors"
                          >
                            <div className="min-w-0">
                              <p className="font-semibold text-base-content truncate">
                                {candidate.name}
                              </p>
                              <p className="text-xs text-base-content/75 truncate">
                                {[candidate.email, candidate.phone]
                                  .filter(Boolean)
                                  .join(" · ") || "No contact info"}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="badge badge-sm badge-primary font-semibold">
                                {candidate.stage}
                              </span>
                              <span className="text-xs text-base-content/70">
                                {formatVacancyDate(candidate.appliedDate)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                </div>

                {/* Right Column: Requisition & Audit Metadata */}
                <div className="space-y-6">
                  <section className="card bg-base-100 border border-base-200 shadow-sm p-5 space-y-4">
                    <h2 className="text-base font-bold text-base-content">
                      Requisition Details
                    </h2>
                    <dl className="space-y-3 text-sm">
                      <div className="flex items-start justify-between gap-2">
                        <dt className="text-base-content/70 flex items-center gap-1.5">
                          <Building2 className="size-3.5" />
                          Department
                        </dt>
                        <dd className="font-semibold text-right capitalize">
                          {vacancy.dept}
                        </dd>
                      </div>
                      <div className="flex items-start justify-between gap-2">
                        <dt className="text-base-content/70 flex items-center gap-1.5">
                          <Briefcase className="size-3.5" />
                          Employment type
                        </dt>
                        <dd className="font-semibold text-right">
                          {vacancy.type || "—"}
                        </dd>
                      </div>
                      <div className="flex items-start justify-between gap-2">
                        <dt className="text-base-content/70 flex items-center gap-1.5">
                          <MapPin className="size-3.5" />
                          Work location
                        </dt>
                        <dd className="font-semibold text-right">
                          {vacancy.location || "—"}
                        </dd>
                      </div>
                      <div className="flex items-start justify-between gap-2">
                        <dt className="text-base-content/70 flex items-center gap-1.5">
                          <Globe className="size-3.5" />
                          Channel
                        </dt>
                        <dd className="font-semibold text-right">
                          {vacancy.channels || "—"}
                        </dd>
                      </div>
                      <div className="flex items-start justify-between gap-2">
                        <dt className="text-base-content/70">Reason for hire</dt>
                        <dd className="font-semibold text-right">
                          {vacancy.reason || "—"}
                        </dd>
                      </div>
                      <div className="flex items-start justify-between gap-2 pt-2 border-t border-base-200">
                        <dt className="text-base-content/70 flex items-center gap-1.5">
                          <UserCheck className="size-3.5" />
                          Hiring manager
                        </dt>
                        <dd className="font-semibold text-right">
                          {vacancy.manager || "—"}
                        </dd>
                      </div>
                      <div className="flex items-start justify-between gap-2">
                        <dt className="text-base-content/70 flex items-center gap-1.5">
                          <ShieldCheck className="size-3.5" />
                          Approver
                        </dt>
                        <dd className="font-semibold text-right">
                          {vacancy.approver || "—"}
                        </dd>
                      </div>
                      <div className="flex items-start justify-between gap-2 pt-2 border-t border-base-200">
                        <dt className="text-base-content/70">Created</dt>
                        <dd className="font-medium text-right">
                          {formatVacancyDate(vacancy.createdAt)}
                        </dd>
                      </div>
                      <div className="flex items-start justify-between gap-2">
                        <dt className="text-base-content/70">Last updated</dt>
                        <dd className="font-medium text-right">
                          {formatVacancyDate(vacancy.updatedAt)}
                        </dd>
                      </div>
                    </dl>
                  </section>

                  {(vacancy.decidedAt ||
                    vacancy.rejectionReason ||
                    vacancy.archivedAt ||
                    vacancy.archiveReason) && (
                    <section className="card bg-base-100 border border-base-200 shadow-sm p-5 space-y-3">
                      <h2 className="text-base font-bold text-base-content">
                        Decision &amp; Lifecycle Notes
                      </h2>
                      {vacancy.decidedAt && (
                        <div className="text-sm">
                          <p className="text-base-content/70 text-xs">
                            Decided on {formatVacancyDate(vacancy.decidedAt)}
                          </p>
                          <p className="font-semibold text-base-content">
                            By{" "}
                            {(vacancy.decidedBy &&
                              nameLookup[vacancy.decidedBy]) ||
                              vacancy.decidedBy ||
                              "Approver"}
                          </p>
                        </div>
                      )}
                      {vacancy.rejectionReason && (
                        <div className="rounded-xl border border-error/25 bg-error/10 p-3 text-sm text-error">
                          <p className="font-semibold text-xs uppercase tracking-wider mb-1">
                            Rejection reason
                          </p>
                          <p>{vacancy.rejectionReason}</p>
                        </div>
                      )}
                      {vacancy.archivedAt && (
                        <div className="rounded-xl border border-base-300 bg-base-200/50 p-3 text-sm">
                          <p className="font-semibold text-xs uppercase tracking-wider text-base-content/70 mb-1">
                            Archived on {formatVacancyDate(vacancy.archivedAt)}
                          </p>
                          {vacancy.archiveReason && (
                            <p className="text-base-content/80">
                              {vacancy.archiveReason}
                            </p>
                          )}
                        </div>
                      )}
                    </section>
                  )}
                </div>
              </div>

              <CreateVacancyModal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                onCreateVacancy={async () => {}}
                onUpdateVacancy={handleUpdateVacancy}
                initialVacancy={rawVacancy}
                departments={departmentOptions}
                approvers={approverOptions}
                managers={approverOptions}
              />

              <VacancyActionModal
                isOpen={Boolean(activeAction)}
                onClose={() => setActiveAction(null)}
                action={activeAction}
                vacancyTitle={vacancy.title}
                onConfirm={handleConfirmAction}
                isPending={isActionPending}
              />

              <AddApplicationModal
                isOpen={isAddCandidateOpen}
                onClose={() => setIsAddCandidateOpen(false)}
                vacancyTitle={vacancy.title}
                onSubmitApplication={handleCreateApplication}
                isPending={createApplicationMutation.isPending}
              />

              <CandidateDetailModal
                candidate={selectedCandidate}
                isOpen={Boolean(selectedCandidate)}
                onClose={() => setSelectedCandidate(null)}
                onUpdateStage={handleUpdateCandidateStage}
              />
            </div>
          );
        }}
      </QueryCompLayout>
    </div>
  );
}
