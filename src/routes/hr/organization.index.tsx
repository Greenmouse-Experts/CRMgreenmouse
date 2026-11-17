import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/Headers/PageHeader";
import OrganizationStats from "./organization/-components/OrganizationStats";
import OrgHierarchy from "./organization/-components/OrgHierarchy";
import DepartmentsTable from "./organization/-components/DepartmentsTable";
import PositionsTable from "./organization/-components/PositionsTable";
import AddDepartmentModal from "./organization/-components/AddDepartmentModal";
import AddPositionModal from "./organization/-components/AddPositionModal";
import {
  INITIAL_DEPARTMENTS,
  INITIAL_LEADER,
  INITIAL_POSITIONS,
} from "./organization/-components/organizationData";
import type {
  Department,
  DepartmentStatus,
  Position,
} from "./organization/-components/types";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/hr/organization/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [departments, setDepartments] =
    useState<Department[]>(INITIAL_DEPARTMENTS);
  const [positions, setPositions] = useState<Position[]>(INITIAL_POSITIONS);
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);

  // Modals state
  const [isAddDeptModalOpen, setIsAddDeptModalOpen] = useState(false);
  const [isAddPosModalOpen, setIsAddPosModalOpen] = useState(false);

  // Department handlers
  const handleAddDepartment = (newDept: Department) => {
    setDepartments((prev) => [newDept, ...prev]);
  };

  const handleUpdateDeptStatus = (deptId: string, status: DepartmentStatus) => {
    setDepartments((prev) =>
      prev.map((d) => (d.id === deptId ? { ...d, status } : d)),
    );
    toast.success(`Department status updated to ${status}`);
  };

  const handleDeleteDepartment = (deptId: string) => {
    setDepartments((prev) => prev.filter((d) => d.id !== deptId));
    toast.success("Department removed");
  };

  // Position handlers
  const handleAddPosition = (newPos: Position) => {
    setPositions((prev) => [newPos, ...prev]);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <PageHeader
        title="Organization"
        description="Department structure, job positions and reporting hierarchy."
      >
        <button
          type="button"
          onClick={() => setIsAddDeptModalOpen(true)}
          className="btn btn-sm bg-primary text-white hover:bg-primary/90 border-0 rounded-xl px-4 font-medium gap-1.5 shadow-sm shadow-primary/20"
        >
          <Plus className="size-4" />
          <span>Add department</span>
        </button>
      </PageHeader>

      {/* Top 4 Metrics Stats */}
      <OrganizationStats departments={departments} positions={positions} />

      {/* Visual Hierarchy Flow */}
      <OrgHierarchy
        leader={INITIAL_LEADER}
        departments={departments}
        selectedDeptId={selectedDeptId}
        onSelectDept={(deptId) => {
          setSelectedDeptId((prev) => (prev === deptId ? null : deptId));
          const dept = departments.find((d) => d.id === deptId);
          if (dept) {
            toast.info(
              `${dept.name} department · Head: ${dept.head} (${dept.count} staff)`,
            );
          }
        }}
      />

      {/* 2-Column Responsive Grid: Departments & Positions */}
      <div className="grid gap-6 lg:grid-cols-2 items-start">
        <DepartmentsTable
          departments={
            selectedDeptId
              ? departments.filter((d) => d.id === selectedDeptId)
              : departments
          }
          onSelectDepartment={(dept) => {
            setSelectedDeptId((prev) => (prev === dept.id ? null : dept.id));
            toast.info(`Selected ${dept.name} (${dept.code})`);
          }}
          onUpdateStatus={handleUpdateDeptStatus}
          onDeleteDepartment={handleDeleteDepartment}
        />

        <PositionsTable
          positions={positions}
          onAddPositionClick={() => setIsAddPosModalOpen(true)}
        />
      </div>

      {/* Modals */}
      <AddDepartmentModal
        isOpen={isAddDeptModalOpen}
        onClose={() => setIsAddDeptModalOpen(false)}
        onAddDepartment={handleAddDepartment}
        existingDepartments={departments}
      />

      <AddPositionModal
        isOpen={isAddPosModalOpen}
        onClose={() => setIsAddPosModalOpen(false)}
        onAddPosition={handleAddPosition}
        departments={departments}
      />
    </div>
  );
}
