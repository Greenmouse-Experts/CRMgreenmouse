import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/Headers/PageHeader";
import PageLoader from "@/components/layout/PageLoader";
import OffboardingStats from "./-components/OffboardingStats";
import OffboardingStepperCard from "./-components/OffboardingStepperCard";
import ClearanceSection from "./-components/ClearanceSection";
import OffboardingCasesTable from "./-components/OffboardingCasesTable";
import InitiateOffboardingModal from "./-components/InitiateOffboardingModal";
import AddClearanceItemModal from "./-components/AddClearanceItemModal";
import { useOffboardingCase, useOffboardingCases } from "@/api/offboardingApi";
import { Plus, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/hr/offboarding/")({
  component: RouteComponent,
});

function RouteComponent() {
  const casesQuery = useOffboardingCases();
  const [selectedCaseId, setSelectedCaseId] = useState<string>("");
  const [isInitiateModalOpen, setIsInitiateModalOpen] = useState(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);

  const cases = casesQuery.data ?? [];
  const activeCase =
    cases.find((c) => c.id === selectedCaseId) ?? cases[0] ?? null;

  const activeCaseDetailQuery = useOffboardingCase(activeCase?.id);
  const resolvedActiveCase = activeCaseDetailQuery.data ?? activeCase;
  const activeCaseClearanceItems =
    resolvedActiveCase?.tasks ?? activeCase?.tasks ?? [];
  const allClearanceItems = cases.flatMap((c) => c.tasks ?? []);

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Offboarding"
        description="Compliance · Resignation, clearance, asset return and final settlement."
      >
        <button
          type="button"
          onClick={() => setIsInitiateModalOpen(true)}
          className="btn btn-sm bg-primary text-white hover:bg-primary/90 border-0 rounded-xl px-4 font-medium gap-1.5 shadow-sm shadow-primary/20"
        >
          <Plus className="size-4" />
          <span>Initiate offboarding</span>
        </button>
      </PageHeader>

      <div className="flex items-center gap-3 rounded-xl bg-blue-500/10 border border-blue-500/20 p-4 sm:text-sm font-medium text-blue-900 dark:text-blue-200 shadow-2xs">
        <ShieldCheck className="size-5 shrink-0 text-blue-600 dark:text-blue-400" />
        <span>
          Records are retained after exit; access to company services is
          scheduled for revocation at the authorized time.
        </span>
      </div>

      <PageLoader
        query={casesQuery}
        emptyState={{
          title: "No offboarding cases yet",
          description:
            "Initiate an offboarding case to manage clearance tasks, asset return, and final settlement.",
          actionText: "Initiate offboarding",
          onAction: () => setIsInitiateModalOpen(true),
        }}
      >
        {(loadedCases) => {
          const currentActive =
            loadedCases.find((c) => c.id === selectedCaseId) ?? loadedCases[0];
          const detailCase = activeCaseDetailQuery.data ?? currentActive;
          const clearanceList =
            detailCase?.tasks ??
            currentActive?.tasks ??
            activeCaseClearanceItems;

          return (
            <div className="space-y-6">
              <OffboardingStats
                cases={loadedCases}
                clearanceItems={
                  allClearanceItems.length > 0
                    ? allClearanceItems
                    : clearanceList
                }
              />

              {detailCase && (
                <OffboardingStepperCard
                  activeCase={detailCase}
                  allCases={loadedCases}
                  onSelectCase={(c) => setSelectedCaseId(c.id)}
                />
              )}

              {detailCase && (
                <ClearanceSection
                  items={clearanceList}
                  employeeName={detailCase.employee}
                  onOpenAddItemModal={() => setIsAddItemModalOpen(true)}
                />
              )}

              <OffboardingCasesTable
                cases={loadedCases}
                activeCaseId={detailCase?.id ?? ""}
                onSelectCase={(c) => setSelectedCaseId(c.id)}
              />
            </div>
          );
        }}
      </PageLoader>

      <InitiateOffboardingModal
        isOpen={isInitiateModalOpen}
        onClose={() => setIsInitiateModalOpen(false)}
        onSuccess={(created) => {
          if (created.id) setSelectedCaseId(created.id);
        }}
      />

      <AddClearanceItemModal
        isOpen={isAddItemModalOpen}
        onClose={() => setIsAddItemModalOpen(false)}
        caseId={resolvedActiveCase?.id ?? ""}
      />
    </div>
  );
}
