import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/Headers/PageHeader";
import {
  useCreateDepartment,
  useCreatePosition,
  useDeleteDepartment,
  useOrganization,
  useUpdateDepartment,
  type CreateDepartmentPayload,
  type CreatePositionPayload,
} from "@/api/organizationApi";
import OrganizationStats from "./organization/-components/OrganizationStats";
import OrgHierarchy from "./organization/-components/OrgHierarchy";
import DepartmentsTable from "./organization/-components/DepartmentsTable";
import PositionsTable from "./organization/-components/PositionsTable";
import AddDepartmentModal from "./organization/-components/AddDepartmentModal";
import AddPositionModal from "./organization/-components/AddPositionModal";
import EditDepartmentModal from "./organization/-components/EditDepartmentModal";
import { useAuth, useProfile } from "@/store/authStore";
import type {
  Department,
  DepartmentStatus,
  OrgLeader,
} from "./organization/-components/types";
import { extract_message } from "@/helpers/auth";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/hr/organization/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data } = useOrganization();
  const [authUser] = useAuth();
  const [profile] = useProfile();
  const companyName =
    authUser?.user?.companyName ||
    authUser?.profile?.companyName ||
    profile?.companyName;
  const orgLeader: OrgLeader | undefined = companyName
    ? {
        name: companyName,
        title: "Organization",
        email: authUser?.user?.email,
      }
    : undefined;
  const departments = data?.departments ?? [];
  const positions = data?.positions ?? [];
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);

  // Modals state
  const [isAddDeptModalOpen, setIsAddDeptModalOpen] = useState(false);
  const [isAddPosModalOpen, setIsAddPosModalOpen] = useState(false);
  const [isEditDeptModalOpen, setIsEditDeptModalOpen] = useState(false);
  const [editDept, setEditDept] = useState<Department | null>(null);

  // Organization mutations
  const createDepartment = useCreateDepartment();
  const updateDepartment = useUpdateDepartment();
  const deleteDepartment = useDeleteDepartment();
  const createPosition = useCreatePosition();

  // Department handlers
  const handleAddDepartment = async (payload: CreateDepartmentPayload) => {
    const promise = createDepartment.mutateAsync(payload);
    toast.promise(promise, {
      loading: "Creating department...",
      success: "Department created",
      error: (error) => extract_message(error as never),
    });
    return promise.then(() => true).catch(() => false);
  };

  const handleUpdateDeptStatus = (deptId: string, status: DepartmentStatus) => {
    updateDepartment.mutate(
      { id: deptId, status: status.toLowerCase() as "active" | "inactive" },
      { onError: () => toast.error("Failed to update department status") },
    );
  };

  const handleDeleteDepartment = (deptId: string) => {
    deleteDepartment.mutate(deptId, {
      onError: () => toast.error("Failed to mark department inactive"),
    });
  };

  const handleEditDepartment = (updated: {
    id: string;
    name: string;
    code: string;
    headEmployeeId?: string;
    parentDepartmentId?: string;
    costCentre?: string;
    primaryLocation?: string;
    approvedHeadcount?: number;
    description?: string;
    status: string;
  }) => {
    updateDepartment.mutate(
      {
        id: updated.id,
        name: updated.name,
        code: updated.code,
        headEmployeeId: updated.headEmployeeId,
        parentDepartmentId: updated.parentDepartmentId,
        costCentre: updated.costCentre,
        primaryLocation: updated.primaryLocation,
        approvedHeadcount: updated.approvedHeadcount,
        description: updated.description,
        status: updated.status.toLowerCase() as "active" | "inactive",
      },
      { onError: () => toast.error("Failed to update department") },
    );
  };

  // Position handlers
  const handleAddPosition = (payload: CreatePositionPayload) => {
    toast.promise(createPosition.mutateAsync(payload), {
      loading: "Creating position...",
      success: "Position created",
      error: (error) => extract_message(error as never),
    });
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
        leader={orgLeader}
        departments={departments}
        selectedDeptId={selectedDeptId}
        onSelectDept={(deptId) => {
          setSelectedDeptId((prev) => (prev === deptId ? null : deptId));
          const dept = departments.find((d) => d.id === deptId);
          if (dept) {
            toast.info(
              `${dept.name} department · Head: ${dept.head || "Unassigned"} (${dept.count ?? 0} staff)`,
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
          onEditDepartment={(dept) => {
            setEditDept(dept);
            setIsEditDeptModalOpen(true);
          }}
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

      <EditDepartmentModal
        isOpen={isEditDeptModalOpen}
        department={editDept}
        onClose={() => setIsEditDeptModalOpen(false)}
        onEditDepartment={handleEditDepartment}
        existingDepartments={departments}
      />
    </div>
  );
}
