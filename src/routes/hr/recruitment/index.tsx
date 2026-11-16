import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/Headers/PageHeader";
import RecruitmentStats from "./-components/RecruitmentStats";
import CandidatePipeline from "./-components/CandidatePipeline";
import VacanciesTable from "./-components/VacanciesTable";
import OfferConversionSection from "./-components/OfferConversionSection";
import CreateVacancyModal from "./-components/CreateVacancyModal";
import CandidateDetailModal from "./-components/CandidateDetailModal";
import {
  INITIAL_CANDIDATES,
  INITIAL_VACANCIES,
} from "./-components/recruitmentData";
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

function RouteComponent() {
  const [candidates, setCandidates] = useState<Candidate[]>(INITIAL_CANDIDATES);
  const [vacancies, setVacancies] = useState<Vacancy[]>(INITIAL_VACANCIES);

  // Modals state
  const [isCreateVacancyOpen, setIsCreateVacancyOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null,
  );

  // Candidate Actions
  const handleAdvanceStage = (
    candidateId: string,
    nextStage: PipelineStage,
  ) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, stage: nextStage } : c)),
    );
    toast.success(`Candidate advanced to ${nextStage}`);
  };

  const handleUpdateCandidateStage = (
    candidateId: string,
    newStage: PipelineStage,
  ) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, stage: newStage } : c)),
    );
  };

  // Vacancy Actions
  const handleCreateVacancy = (newVacancy: Vacancy) => {
    setVacancies((prev) => [newVacancy, ...prev]);
  };

  const handleUpdateVacancyStatus = (
    vacancyId: string,
    status: VacancyStatus,
  ) => {
    setVacancies((prev) =>
      prev.map((v) => (v.id === vacancyId ? { ...v, status } : v)),
    );
    toast.success(`Vacancy status updated to ${status}`);
  };

  const handleDeleteVacancy = (vacancyId: string) => {
    setVacancies((prev) => prev.filter((v) => v.id !== vacancyId));
    toast.success("Vacancy listing removed");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
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

      {/* Top 4 Stats Cards */}
      <RecruitmentStats vacancies={vacancies} candidates={candidates} />

      {/* Candidate Pipeline Kanban */}
      <CandidatePipeline
        candidates={candidates}
        onSelectCandidate={(c) => setSelectedCandidate(c)}
        onAdvanceStage={handleAdvanceStage}
      />

      {/* Vacancies Table */}
      <VacanciesTable
        vacancies={vacancies}
        onSelectVacancy={(v) => {
          toast.info(`Vacancy ${v.id}: ${v.title} (${v.dept}) - ${v.status}`);
        }}
        onUpdateStatus={handleUpdateVacancyStatus}
        onDeleteVacancy={handleDeleteVacancy}
      />

      {/* Offer & Conversion Workflow */}
      <OfferConversionSection />

      {/* Modals */}
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
