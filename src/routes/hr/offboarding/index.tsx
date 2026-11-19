import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/Headers/PageHeader";
import OffboardingStats from "./-components/OffboardingStats";
import OffboardingStepperCard from "./-components/OffboardingStepperCard";
import ClearanceSection from "./-components/ClearanceSection";
import OffboardingCasesTable from "./-components/OffboardingCasesTable";
import InitiateOffboardingModal from "./-components/InitiateOffboardingModal";
import AddClearanceItemModal from "./-components/AddClearanceItemModal";
import {
  INITIAL_CLEARANCE_ITEMS,
  INITIAL_OFFBOARDING_CASES,
} from "./-components/offboardingData";
import type {
  ClearanceItem,
  ClearanceStatus,
  OffboardingCase,
  OffboardingStep,
} from "./-components/types";
import { Plus, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/hr/offboarding/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [cases, setCases] = useState<OffboardingCase[]>(
    INITIAL_OFFBOARDING_CASES,
  );
  const [clearanceItems, setClearanceItems] = useState<ClearanceItem[]>(
    INITIAL_CLEARANCE_ITEMS,
  );
  const [selectedCaseId, setSelectedCaseId] = useState<string>(
    INITIAL_OFFBOARDING_CASES[0]?.id || "OFF-001",
  );

  // Modals state
  const [isInitiateModalOpen, setIsInitiateModalOpen] = useState(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);

  // Active case for the stepper and clearance section
  const activeCase =
    cases.find((c) => c.id === selectedCaseId) || cases[0];

  // Clearance items for currently active case
  const activeCaseClearanceItems = clearanceItems.filter(
    (item) => item.caseId === activeCase?.id,
  );

  // Handlers
  const handleInitiateOffboarding = (
    newCase: OffboardingCase,
    defaultTasks: ClearanceItem[],
  ) => {
    setCases((prev) => [newCase, ...prev]);
    setClearanceItems((prev) => [...defaultTasks, ...prev]);
    setSelectedCaseId(newCase.id);
  };

  const handleAdvanceStep = (nextStep: OffboardingStep) => {
    if (!activeCase) return;
    setCases((prev) =>
      prev.map((c) =>
        c.id === activeCase.id
          ? {
              ...c,
              currentStep: nextStep,
              status:
                nextStep === "Exit interview"
                  ? "Completed"
                  : c.status,
            }
          : c,
      ),
    );
    toast.success(`Offboarding milestone for ${activeCase.employee} advanced to "${nextStep}"`);
  };

  const handleUpdateClearanceStatus = (
    itemId: string,
    status: ClearanceStatus,
  ) => {
    setClearanceItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, status } : i)),
    );
  };

  const handleAddClearanceItem = (newItem: ClearanceItem) => {
    setClearanceItems((prev) => [newItem, ...prev]);
  };

  const handleCompleteCase = (id: string) => {
    setCases((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: "Completed",
              currentStep: "Exit interview",
            }
          : c,
      ),
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
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

      {/* Compliance Notice Banner */}
      <div className="flex items-center gap-3 rounded-xl bg-blue-500/10 border border-blue-500/20 p-4 text-xs sm:text-sm font-medium text-blue-900 dark:text-blue-200 shadow-2xs">
        <ShieldCheck className="size-5 shrink-0 text-blue-600 dark:text-blue-400" />
        <span>
          Records are retained after exit; access to company services is scheduled for revocation at the authorized time.
        </span>
      </div>

      {/* Top 4 KPI Metrics */}
      <OffboardingStats
        cases={cases}
        clearanceItems={clearanceItems}
      />

      {/* Active Case 8-Step Milestone Stepper Card */}
      {activeCase && (
        <OffboardingStepperCard
          activeCase={activeCase}
          allCases={cases}
          onSelectCase={(c) => setSelectedCaseId(c.id)}
          onAdvanceStep={handleAdvanceStep}
        />
      )}

      {/* Clearance Checklist Table (uses CustomTable) */}
      {activeCase && (
        <ClearanceSection
          items={activeCaseClearanceItems}
          employeeName={activeCase.employee}
          onUpdateStatus={handleUpdateClearanceStatus}
          onOpenAddItemModal={() => setIsAddItemModalOpen(true)}
        />
      )}

      {/* All Offboarding Records Table (uses CustomTable) */}
      <OffboardingCasesTable
        cases={cases}
        activeCaseId={selectedCaseId}
        onSelectCase={(c) => setSelectedCaseId(c.id)}
        onCompleteCase={handleCompleteCase}
      />

      {/* Initiate Offboarding Modal */}
      <InitiateOffboardingModal
        isOpen={isInitiateModalOpen}
        onClose={() => setIsInitiateModalOpen(false)}
        onInitiate={handleInitiateOffboarding}
        nextCaseNum={cases.length + 1}
      />

      {/* Add Clearance Task Modal */}
      <AddClearanceItemModal
        isOpen={isAddItemModalOpen}
        onClose={() => setIsAddItemModalOpen(false)}
        caseId={selectedCaseId}
        onAddItem={handleAddClearanceItem}
      />
    </div>
  );
}
