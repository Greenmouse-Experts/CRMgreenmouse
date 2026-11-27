import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/Headers/PageHeader";
import PageLoader from "@/components/layout/PageLoader";
import {
  CHECKLIST_OWNER_OPTIONS,
  useChecklistItems,
  useUpdateChecklistItem,
  type ChecklistItemRecord,
} from "@/api/checklistApi";
import { extract_message } from "@/helpers/errors";
import { ListChecks, Plus } from "lucide-react";
import { toast } from "sonner";
import ChecklistStats from "./-components/ChecklistStats";
import ChecklistTable from "./-components/ChecklistTable";
import ChecklistItemModal from "./-components/ChecklistItemModal";
import ChecklistDetailModal from "./-components/ChecklistDetailModal";
import DeleteChecklistModal from "./-components/DeleteChecklistModal";
import { getNextSortOrder } from "./-components/checklistHelpers";

export const Route = createFileRoute("/hr/checklist/")({
  component: RouteComponent,
});

function RouteComponent() {
  const checklistQuery = useChecklistItems();
  const updateChecklistMutation = useUpdateChecklistItem();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOwner, setSelectedOwner] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState<
    "all" | "active" | "inactive"
  >("all");

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ChecklistItemRecord | null>(
    null,
  );
  const [viewingItem, setViewingItem] = useState<ChecklistItemRecord | null>(
    null,
  );
  const [deletingItem, setDeletingItem] = useState<ChecklistItemRecord | null>(
    null,
  );
  const [togglingItemId, setTogglingItemId] = useState<string | null>(null);

  const items = checklistQuery.data ?? [];

  const ownerOptions = useMemo(() => {
    const set = new Set<string>(
      CHECKLIST_OWNER_OPTIONS.map((opt) => opt.value),
    );
    for (const item of items) {
      if (item.owner) set.add(item.owner.toLowerCase());
    }
    return Array.from(set);
  }, [items]);

  const filteredItems = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return items.filter((item) => {
      if (selectedOwner !== "all" && item.owner !== selectedOwner) return false;
      if (selectedStatus === "active" && !item.active) return false;
      if (selectedStatus === "inactive" && item.active) return false;
      if (query) {
        return (
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.owner.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [items, searchTerm, selectedOwner, selectedStatus]);

  const hasActiveFilters =
    Boolean(searchTerm.trim()) ||
    selectedOwner !== "all" ||
    selectedStatus !== "all";

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedOwner("all");
    setSelectedStatus("all");
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (item: ChecklistItemRecord) => {
    setViewingItem(null);
    setEditingItem(item);
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setEditingItem(null);
  };

  const handleToggleActive = async (item: ChecklistItemRecord) => {
    if (!item.id || togglingItemId === item.id) return;
    const nextIsActive = item.active ? "N" : "Y";
    setTogglingItemId(item.id);
    try {
      const updated = await toast
        .promise(
          updateChecklistMutation.mutateAsync({
            itemId: item.id,
            isActive: nextIsActive,
          }),
          {
            loading:
              nextIsActive === "Y"
                ? "Activating checklist item..."
                : "Deactivating checklist item...",
            success:
              nextIsActive === "Y"
                ? "Checklist item activated"
                : "Checklist item deactivated",
            error: (error) => extract_message(error),
          },
        )
        .unwrap();

      setViewingItem((current) =>
        current && current.id === item.id ? updated : current,
      );
    } catch {
      // Error toast shown by toast.promise
    } finally {
      setTogglingItemId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Onboarding Checklist"
        description="Manage onboarding checklist steps, owner responsibilities, display order, and active status."
      >
        <button
          type="button"
          onClick={openCreateModal}
          className="btn btn-sm bg-primary text-white hover:bg-primary/90 border-0 rounded-xl px-4 font-medium gap-1.5 shadow-sm shadow-primary/20"
        >
          <Plus className="size-4" />
          <span>New Checklist Item</span>
        </button>
      </PageHeader>

      <div className="flex items-center gap-3 rounded-xl bg-primary/10 border border-primary/20 p-4 sm:text-sm font-medium text-base-content shadow-2xs">
        <ListChecks className="size-5 shrink-0 text-primary" />
        <span>
          Standardized employee onboarding steps — ordered by priority and
          assigned by department owner.
        </span>
      </div>

      <PageLoader
        query={checklistQuery}
        loadingText="Loading checklist items..."
        emptyState={{
          title: "No checklist items yet",
          description:
            "Create your first onboarding checklist item to standardize staff onboarding steps.",
          actionText: "Create Checklist Item",
          onAction: openCreateModal,
        }}
      >
        <div className="space-y-6">
          <ChecklistStats items={items} />

          <ChecklistTable
            items={filteredItems}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedOwner={selectedOwner}
            onOwnerChange={setSelectedOwner}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            ownerOptions={ownerOptions}
            hasActiveFilters={hasActiveFilters}
            onResetFilters={resetFilters}
            onViewItem={setViewingItem}
            onEditItem={openEditModal}
            onToggleActive={handleToggleActive}
            onDeleteItem={(item) => {
              setViewingItem(null);
              setDeletingItem(item);
            }}
            togglingItemId={togglingItemId}
          />
        </div>
      </PageLoader>

      <ChecklistItemModal
        isOpen={isFormModalOpen}
        onClose={closeFormModal}
        initialItem={editingItem}
        defaultSortOrder={getNextSortOrder(items)}
      />

      <ChecklistDetailModal
        item={viewingItem}
        onClose={() => setViewingItem(null)}
        onEdit={openEditModal}
        onToggleActive={handleToggleActive}
        onDelete={(item) => {
          setViewingItem(null);
          setDeletingItem(item);
        }}
        isToggling={togglingItemId === viewingItem?.id}
      />

      <DeleteChecklistModal
        item={deletingItem}
        onClose={() => setDeletingItem(null)}
        onDeleted={(deletedId) => {
          setViewingItem((current) =>
            current && current.id === deletedId ? null : current,
          );
        }}
      />
    </div>
  );
}
