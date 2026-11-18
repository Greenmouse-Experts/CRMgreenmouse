import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/Headers/PageHeader";
import DisciplinaryStats from "./-components/DisciplinaryStats";
import CaseWorkflowStepper from "./-components/CaseWorkflowStepper";
import DisciplinaryCasesTable from "./-components/DisciplinaryCasesTable";
import OpenCaseModal from "./-components/OpenCaseModal";
import CaseDetailModal from "./-components/CaseDetailModal";
import { INITIAL_DISCIPLINARY_CASES } from "./-components/disciplinaryData";
import type { DisciplinaryCase, WorkflowStep } from "./-components/types";
import { Plus, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/hr/disciplinary/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [cases, setCases] = useState<DisciplinaryCase[]>(
    INITIAL_DISCIPLINARY_CASES,
  );
  const [isOpenCaseModalOpen, setIsOpenCaseModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<DisciplinaryCase | null>(
    null,
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleOpenCase = (newCase: DisciplinaryCase) => {
    setCases((prev) => [newCase, ...prev]);
  };

  const handleSelectCase = (caseItem: DisciplinaryCase) => {
    setSelectedCase(caseItem);
    setIsDetailModalOpen(true);
  };

  const handleAdvanceStep = (id: string, nextStep: WorkflowStep) => {
    setCases((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              currentStep: nextStep,
              status:
                nextStep === "Decision"
                  ? "Decision Pending"
                  : nextStep === "Hearing"
                    ? "Hearing Scheduled"
                    : c.status,
            }
          : c,
      ),
    );
    toast.success(`Case ${id} advanced to ${nextStep}`);
  };

  const handleCloseCase = (id: string) => {
    setCases((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: "Closed",
              currentStep: "Decision",
            }
          : c,
      ),
    );
    toast.success(`Case ${id} concluded and archived`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <PageHeader
        title="Disciplinary Cases"
        description="Compliance · Highly restricted — Cases, investigations and corrective actions."
      >
        <button
          type="button"
          onClick={() => setIsOpenCaseModalOpen(true)}
          className="btn btn-sm bg-primary text-white hover:bg-primary/90 border-0 rounded-xl px-4 font-medium gap-1.5 shadow-sm shadow-primary/20"
        >
          <Plus className="size-4" />
          <span>Open case</span>
        </button>
      </PageHeader>

      {/* Mandatory Human Review Warning Banner */}
      <div className="flex items-center gap-3 rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 text-xs sm:text-sm font-medium text-amber-900 dark:text-amber-200 shadow-2xs">
        <ShieldAlert className="size-5 shrink-0 text-amber-600 dark:text-amber-400" />
        <span>
          Outcomes are never automated. Human review and due process are required.
        </span>
      </div>

      {/* Top 4 Metric KPI Cards */}
      <DisciplinaryStats cases={cases} />

      {/* 6-Stage Due Process Stepper */}
      <CaseWorkflowStepper currentStep="Employee response" />

      {/* Disciplinary Cases Table */}
      <DisciplinaryCasesTable
        cases={cases}
        onSelectCase={handleSelectCase}
      />

      {/* Open New Case Modal */}
      <OpenCaseModal
        isOpen={isOpenCaseModalOpen}
        onClose={() => setIsOpenCaseModalOpen(false)}
        onOpenCase={handleOpenCase}
        nextCaseNumber={cases.length + 13}
      />

      {/* Case Details & Progression Modal */}
      <CaseDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedCase(null);
        }}
        caseItem={selectedCase}
        onAdvanceStep={handleAdvanceStep}
        onCloseCase={handleCloseCase}
      />
    </div>
  );
}
