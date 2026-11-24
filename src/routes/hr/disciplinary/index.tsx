import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/Headers/PageHeader";
import PageLoader from "@/components/layout/PageLoader";
import DisciplinaryStats from "./-components/DisciplinaryStats";
import CaseWorkflowStepper from "./-components/CaseWorkflowStepper";
import DisciplinaryCasesTable from "./-components/DisciplinaryCasesTable";
import OpenCaseModal from "./-components/OpenCaseModal";
import CaseDetailModal from "./-components/CaseDetailModal";
import ConfigureOptionsModal from "./-components/ConfigureOptionsModal";
import {
  DEFAULT_CASE_CATEGORIES,
  DEFAULT_CASE_SEVERITIES,
} from "./-components/disciplinaryData";
import type { DisciplinaryCase, WorkflowStep } from "./-components/types";
import {
  STAGE_TO_API,
  useAdvanceDisciplinaryStage,
  useCloseDisciplinaryCase,
  useCreateDisciplinaryCase,
  useDisciplinaryCases,
  useDisciplinaryOptions,
  type CreateDisciplinaryCasePayload,
} from "@/api/disciplinaryApi";
import { extract_message } from "@/helpers/errors";
import { Plus, Settings, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/hr/disciplinary/")({
  component: RouteComponent,
});

function RouteComponent() {
  const casesQuery = useDisciplinaryCases();
  const optionsQuery = useDisciplinaryOptions();

  const createCaseMutation = useCreateDisciplinaryCase();
  const advanceStageMutation = useAdvanceDisciplinaryStage();
  const closeCaseMutation = useCloseDisciplinaryCase();

  const [isOpenCaseModalOpen, setIsOpenCaseModalOpen] = useState(false);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<DisciplinaryCase | null>(
    null,
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const cases = casesQuery.data ?? [];

  const resolvedOptions = useMemo(() => {
    const categories = optionsQuery.data?.categories?.length
      ? optionsQuery.data.categories
      : DEFAULT_CASE_CATEGORIES;
    const severities = optionsQuery.data?.severities?.length
      ? optionsQuery.data.severities
      : DEFAULT_CASE_SEVERITIES;
    return { categories, severities };
  }, [optionsQuery.data]);

  const handleOpenCase = async (payload: CreateDisciplinaryCasePayload) => {
    try {
      await createCaseMutation.mutateAsync(payload);
      toast.success("Disciplinary case opened");
      setIsOpenCaseModalOpen(false);
    } catch (error) {
      toast.error(extract_message(error as any));
    }
  };

  const handleSelectCase = (caseItem: DisciplinaryCase) => {
    setSelectedCase(caseItem);
    setIsDetailModalOpen(true);
  };

  const handleAdvanceStep = async (
    id: string,
    nextStep: WorkflowStep,
    notes?: string,
  ) => {
    try {
      await advanceStageMutation.mutateAsync({
        id,
        stage: STAGE_TO_API[nextStep],
        notes,
      });
      toast.success(`Case advanced to ${nextStep}`);
    } catch (error) {
      toast.error(extract_message(error as any));
      throw error;
    }
  };

  const handleCloseCase = async (id: string, outcome: string) => {
    try {
      await closeCaseMutation.mutateAsync({ id, outcome });
      toast.success("Case concluded and archived");
    } catch (error) {
      toast.error(extract_message(error as any));
      throw error;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Disciplinary Cases"
        description="Compliance · Highly restricted — Cases, investigations and corrective actions."
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsOptionsModalOpen(true)}
            className="btn btn-sm btn-outline border-base-300 hover:bg-base-200 text-base-content rounded-xl px-3.5 font-medium gap-1.5"
          >
            <Settings className="size-4" />
            <span>Options</span>
          </button>
          <button
            type="button"
            onClick={() => setIsOpenCaseModalOpen(true)}
            className="btn btn-sm bg-primary text-white hover:bg-primary/90 border-0 rounded-xl px-4 font-medium gap-1.5 shadow-sm shadow-primary/20"
          >
            <Plus className="size-4" />
            <span>Open case</span>
          </button>
        </div>
      </PageHeader>

      <div className="flex items-center gap-3 rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 sm:text-sm font-medium text-amber-900 dark:text-amber-200 shadow-2xs">
        <ShieldAlert className="size-5 shrink-0 text-amber-600 dark:text-amber-400" />
        <span>
          Outcomes are never automated. Human review and due process are
          required.
        </span>
      </div>

      <DisciplinaryStats cases={cases} />

      <CaseWorkflowStepper currentStep="Employee response" />

      <PageLoader
        query={casesQuery}
        loadingText="Loading disciplinary cases..."
        emptyState={{
          title: "No disciplinary cases",
          description:
            "Open a disciplinary case to start tracking due process.",
        }}
      >
        {(loadedCases) => (
          <DisciplinaryCasesTable
            cases={loadedCases}
            onSelectCase={handleSelectCase}
          />
        )}
      </PageLoader>

      <OpenCaseModal
        isOpen={isOpenCaseModalOpen}
        onClose={() => setIsOpenCaseModalOpen(false)}
        onOpenCase={handleOpenCase}
        options={resolvedOptions}
      />

      <ConfigureOptionsModal
        isOpen={isOptionsModalOpen}
        onClose={() => setIsOptionsModalOpen(false)}
        options={resolvedOptions}
      />

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
