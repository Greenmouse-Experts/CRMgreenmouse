import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/Headers/PageHeader";
import OnboardingStats from "./-components/OnboardingStats";
import NewHireCards from "./-components/NewHireCards";
import OnboardingChecklist from "./-components/OnboardingChecklist";
import ProbationTracker from "./-components/ProbationTracker";
import AddOnboardingModal from "./-components/AddOnboardingModal";
import {
  INITIAL_HIRES,
  INITIAL_CHECKLISTS,
} from "./-components/onboardingData";
import type { ChecklistItem, OnboardingHire } from "./-components/types";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/hr/onboarding/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [hires, setHires] = useState<OnboardingHire[]>(INITIAL_HIRES);
  const [checklists, setChecklists] =
    useState<Record<string, ChecklistItem[]>>(INITIAL_CHECKLISTS);
  const [selectedHireId, setSelectedHireId] = useState<string>(
    INITIAL_HIRES[0]?.id || "HIRE-01",
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const selectedHire =
    hires.find((h) => h.id === selectedHireId) || hires[0] || null;
  const selectedChecklist = selectedHire
    ? checklists[selectedHire.id] || []
    : [];

  // Toggle checklist item
  const handleToggleItem = (itemId: string) => {
    if (!selectedHire) return;

    setChecklists((prev) => {
      const currentList = prev[selectedHire.id] || [];
      const updatedList = currentList.map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item,
      );

      // Recalculate progress for this hire
      const completedCount = updatedList.filter((i) => i.completed).length;
      const progress = Math.round(
        (completedCount / (updatedList.length || 1)) * 100,
      );

      setHires((prevHires) =>
        prevHires.map((h) =>
          h.id === selectedHire.id ? { ...h, progress } : h,
        ),
      );

      return {
        ...prev,
        [selectedHire.id]: updatedList,
      };
    });
  };

  // Add new task to checklist
  const handleAddItem = (newItem: ChecklistItem) => {
    if (!selectedHire) return;

    setChecklists((prev) => {
      const currentList = prev[selectedHire.id] || [];
      const updatedList = [...currentList, newItem];

      const completedCount = updatedList.filter((i) => i.completed).length;
      const progress = Math.round(
        (completedCount / (updatedList.length || 1)) * 100,
      );

      setHires((prevHires) =>
        prevHires.map((h) =>
          h.id === selectedHire.id ? { ...h, progress } : h,
        ),
      );

      return {
        ...prev,
        [selectedHire.id]: updatedList,
      };
    });
    toast.success("Task added to checklist");
  };

  // Delete task from checklist
  const handleDeleteItem = (itemId: string) => {
    if (!selectedHire) return;

    setChecklists((prev) => {
      const currentList = prev[selectedHire.id] || [];
      const updatedList = currentList.filter((i) => i.id !== itemId);

      const completedCount = updatedList.filter((i) => i.completed).length;
      const progress = Math.round(
        (completedCount / (updatedList.length || 1)) * 100,
      );

      setHires((prevHires) =>
        prevHires.map((h) =>
          h.id === selectedHire.id ? { ...h, progress } : h,
        ),
      );

      return {
        ...prev,
        [selectedHire.id]: updatedList,
      };
    });
    toast.success("Task removed");
  };

  // Update probation milestone
  const handleUpdateProbationStep = (hireId: string, stepIndex: number) => {
    setHires((prev) =>
      prev.map((h) =>
        h.id === hireId ? { ...h, probationStep: stepIndex } : h,
      ),
    );
  };

  // Add new hire
  const handleAddHire = (newHire: OnboardingHire) => {
    setHires((prev) => [newHire, ...prev]);
    // Create starter checklist for the new hire
    setChecklists((prev) => ({
      ...prev,
      [newHire.id]: [
        {
          id: `CHK-${Date.now()}-1`,
          dept: "HR",
          text: "Collect signed contract & ID",
          completed: false,
        },
        {
          id: `CHK-${Date.now()}-2`,
          dept: "HR",
          text: "Issue policy acknowledgements",
          completed: false,
        },
        {
          id: `CHK-${Date.now()}-3`,
          dept: "IT",
          text: "Create email & CRM account",
          completed: false,
        },
        {
          id: `CHK-${Date.now()}-4`,
          dept: "IT",
          text: "Assign laptop",
          completed: false,
        },
        {
          id: `CHK-${Date.now()}-5`,
          dept: "Manager",
          text: "Orientation session",
          completed: false,
        },
        {
          id: `CHK-${Date.now()}-6`,
          dept: "Payroll",
          text: "Add bank & tax details",
          completed: false,
        },
      ],
    }));
    setSelectedHireId(newHire.id);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <PageHeader
        title="Onboarding"
        description="Track every new hire from accepted offer through probation confirmation."
      >
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="btn btn-sm bg-primary text-white hover:bg-primary/90 border-0 rounded-xl px-4 font-medium gap-1.5 shadow-sm shadow-primary/20"
        >
          <UserPlus className="size-4" />
          <span>New Onboarding</span>
        </button>
      </PageHeader>

      {/* Top 4 Stats */}
      <OnboardingStats hires={hires} />

      {/* 3-Column New Hire Cards */}
      <NewHireCards
        hires={hires}
        selectedHireId={selectedHireId}
        onSelectHire={(id) => setSelectedHireId(id)}
      />

      {/* Interactive Checklist for Selected Hire */}
      {selectedHire && (
        <OnboardingChecklist
          hire={selectedHire}
          checklist={selectedChecklist}
          onToggleItem={handleToggleItem}
          onAddItem={handleAddItem}
          onDeleteItem={handleDeleteItem}
        />
      )}

      {/* Probation Tracker for Selected Hire */}
      {selectedHire && (
        <ProbationTracker
          hire={selectedHire}
          onUpdateStep={handleUpdateProbationStep}
        />
      )}

      {/* Add Hire Modal */}
      <AddOnboardingModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddHire={handleAddHire}
      />
    </div>
  );
}
