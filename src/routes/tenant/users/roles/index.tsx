import { useState, useRef, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import ContainerRow from "@/components/ContainerRow";
import SimpleContainer from "@/components/SimpleContainer";
import { useSearch } from "@/stores/data";
import {
  PlusCircleIcon,
  Shield,
  Search,
  CheckSquare,
  Square,
} from "lucide-react";
import CustomTable from "@/components/tables/CustomTable";
import type { Actions } from "@/components/tables/pop-up";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import PageHeader from "@/components/Headers/PageHeader";
import PageLoader from "@/components/layout/PageLoader";
import {
  useRoles,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  useRolePermissions,
  type Role,
  type RolePermission,
} from "@/api/adminApi";
import { toast } from "sonner";

export const Route = createFileRoute("/tenant/users/roles/")({
  component: RouteComponent,
});

function RouteComponent() {
  const query = useRoles();
  const permissionsQuery = useRolePermissions();
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();

  const searchProps = useSearch();
  const roleModalRef = useRef<ModalHandle>(null);

  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [permissionFilter, setPermissionFilter] = useState("");

  const handleOpenCreate = () => {
    setEditingRole(null);
    setRoleName("");
    setRoleDescription("");
    setSelectedPermissions([]);
    setPermissionFilter("");
    roleModalRef.current?.open();
  };

  const handleOpenEdit = (role: Role) => {
    setEditingRole(role);
    setRoleName(role.name);
    setRoleDescription(role.description || "");
    setSelectedPermissions(role.permissions || []);
    setPermissionFilter("");
    roleModalRef.current?.open();
  };

  const handleDelete = async (role: Role) => {
    if (
      !window.confirm(`Are you sure you want to delete role "${role.name}"?`)
    ) {
      return;
    }
    try {
      await deleteRole.mutateAsync(role.id);
      toast.success(`Role "${role.name}" deleted.`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete role.");
    }
  };

  const handleTogglePermission = (key: string) => {
    if (selectedPermissions.includes(key)) {
      setSelectedPermissions(selectedPermissions.filter((k) => k !== key));
    } else {
      setSelectedPermissions([...selectedPermissions, key]);
    }
  };

  const handleSelectAllPermissions = () => {
    if (!permissionsQuery.data) return;
    if (selectedPermissions.length === permissionsQuery.data.length) {
      setSelectedPermissions([]);
    } else {
      setSelectedPermissions(permissionsQuery.data.map((p) => p.key));
    }
  };

  // Group permissions by category/prefix
  const groupedPermissions = useMemo(() => {
    const permissions = permissionsQuery.data || [];
    const filtered = permissions.filter((p) => {
      if (!permissionFilter) return true;
      const q = permissionFilter.toLowerCase();
      return (
        p.key.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.name && p.name.toLowerCase().includes(q))
      );
    });

    const groups: Record<string, RolePermission[]> = {};
    for (const p of filtered) {
      const category =
        p.category || (p.key.includes(":") ? p.key.split(":")[0] : "general");
      const normalizedCat =
        category.charAt(0).toUpperCase() + category.slice(1);
      if (!groups[normalizedCat]) groups[normalizedCat] = [];
      groups[normalizedCat].push(p);
    }
    return groups;
  }, [permissionsQuery.data, permissionFilter]);

  const handleToggleCategory = (categoryKeys: string[]) => {
    const allSelected = categoryKeys.every((k) =>
      selectedPermissions.includes(k),
    );
    if (allSelected) {
      setSelectedPermissions(
        selectedPermissions.filter((k) => !categoryKeys.includes(k)),
      );
    } else {
      const set = new Set([...selectedPermissions, ...categoryKeys]);
      setSelectedPermissions(Array.from(set));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) {
      toast.error("Role name is required");
      return;
    }

    try {
      if (editingRole) {
        await updateRole.mutateAsync({
          id: editingRole.id,
          name: roleName,
          description: roleDescription,
          permissions: selectedPermissions,
        });
        toast.success(`Role "${roleName}" updated successfully.`);
      } else {
        await createRole.mutateAsync({
          name: roleName,
          description: roleDescription,
          permissions: selectedPermissions,
        });
        toast.success(`Role "${roleName}" created successfully.`);
      }
      roleModalRef.current?.close();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Operation failed.");
    }
  };

  const columns = [
    {
      key: "name",
      label: "Role Name",
      render: (_value: any, item: Role) => (
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
            <Shield className="size-4" />
          </div>
          <div>
            <div className="font-semibold text-base-content leading-tight">
              {item.name}
            </div>
            <div className="text-xs text-base-content/60 max-w-sm truncate">
              {item.description || "No description provided"}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "permissions",
      label: "Permissions",
      render: (permissions: string[]) => (
        <div className="flex flex-wrap gap-1 max-w-md">
          {permissions && permissions.length > 0 ? (
            permissions.slice(0, 4).map((perm, i) => (
              <span key={i} className="badge badge-xs badge-ghost font-mono">
                {perm}
              </span>
            ))
          ) : (
            <span className="text-xs text-base-content/40">No permissions</span>
          )}
          {permissions && permissions.length > 4 && (
            <span className="badge badge-xs badge-primary badge-soft">
              +{permissions.length - 4} more
            </span>
          )}
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (value: string) => (
        <span className="text-xs text-base-content/60">
          {value ? new Date(value).toLocaleDateString() : "—"}
        </span>
      ),
    },
  ];

  const actions: Actions<Role>[] = [
    {
      key: "edit",
      label: "Edit Role",
      action: (item: Role) => {
        handleOpenEdit(item);
      },
    },
    {
      key: "delete",
      label: "Delete Role",
      render: () => <span className="text-error font-medium">Delete Role</span>,
      action: (item: Role) => {
        handleDelete(item);
      },
    },
  ];

  return (
    <div className="space-y-4 pb-12">
      <PageHeader
        title="Roles & Permissions"
        description="Configure workspace roles, privileges, and team access levels."
      >
        <button onClick={handleOpenCreate} className="btn btn-primary btn-sm">
          <PlusCircleIcon className="size-4" /> Add Role
        </button>
      </PageHeader>

      <SimpleContainer
        title={
          <>
            Workspace Roles{" "}
            {query.data && (
              <span className="opacity-80 text-xs">({query.data.length})</span>
            )}
          </>
        }
      >
        <ContainerRow showSearch searchProps={searchProps} />

        <PageLoader
          query={query}
          emptyState={{
            title: "No Roles Configured",
            description:
              "Create custom roles with fine-grained access control permissions.",
            actionText: "Add Role",
            onAction: handleOpenCreate,
          }}
        >
          {(rolesList) => {
            const list = Array.isArray(rolesList) ? rolesList : [];
            const filtered = list.filter((r) => {
              if (!searchProps.search) return true;
              return (
                r.name
                  .toLowerCase()
                  .includes(searchProps.search.toLowerCase()) ||
                (r.description &&
                  r.description
                    .toLowerCase()
                    .includes(searchProps.search.toLowerCase()))
              );
            });
            return (
              <CustomTable
                ring={false}
                data={filtered}
                columns={columns}
                actions={actions}
              />
            );
          }}
        </PageLoader>
      </SimpleContainer>

      {/* Create / Edit Role Modal */}
      <Modal
        ref={roleModalRef}
        title={
          editingRole
            ? `Edit Role: ${editingRole.name}`
            : "Create Workspace Role"
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">
              <span className="label-text font-semibold">Role Name *</span>
            </label>
            <input
              type="text"
              required
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="e.g. Sales Representative, Store Manager"
              className="input input-sm input-bordered w-full"
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text font-semibold">Description</span>
            </label>
            <textarea
              value={roleDescription}
              onChange={(e) => setRoleDescription(e.target.value)}
              placeholder="Brief description of the role responsibilities"
              className="textarea textarea-bordered textarea-sm w-full"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="label-text font-semibold">
                Assigned Permissions ({selectedPermissions.length})
              </label>
              <button
                type="button"
                onClick={handleSelectAllPermissions}
                className="btn btn-xs btn-ghost text-primary font-medium"
              >
                {permissionsQuery.data &&
                selectedPermissions.length === permissionsQuery.data.length
                  ? "Deselect All"
                  : "Select All"}
              </button>
            </div>

            {/* Permissions Search & Filter */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 size-3.5 text-base-content/40" />
              <input
                type="text"
                value={permissionFilter}
                onChange={(e) => setPermissionFilter(e.target.value)}
                placeholder="Filter permissions..."
                className="input input-xs input-bordered w-full pl-8"
              />
            </div>

            <div className="border border-base-200 rounded-xl p-3 max-h-72 overflow-y-auto space-y-3 bg-base-200/30">
              {permissionsQuery.isLoading ? (
                <div className="text-center py-6 text-xs text-base-content/50">
                  Loading permissions from workspace...
                </div>
              ) : Object.keys(groupedPermissions).length === 0 ? (
                <div className="text-center py-6 text-xs text-base-content/50">
                  {permissionFilter
                    ? "No matching permissions found."
                    : "No permissions available."}
                </div>
              ) : (
                Object.entries(groupedPermissions).map(([category, items]) => {
                  const categoryKeys = items.map((i) => i.key);
                  const allCatSelected = categoryKeys.every((k) =>
                    selectedPermissions.includes(k),
                  );

                  return (
                    <div key={category} className="space-y-1.5">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-xs font-bold text-base-content/70 uppercase tracking-wider">
                          {category}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleToggleCategory(categoryKeys)}
                          className="text-[11px] text-primary hover:underline flex items-center gap-1"
                        >
                          {allCatSelected ? (
                            <>
                              <CheckSquare className="size-3" /> Deselect Module
                            </>
                          ) : (
                            <>
                              <Square className="size-3" /> Select Module
                            </>
                          )}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {items.map((perm) => {
                          const isChecked = selectedPermissions.includes(
                            perm.key,
                          );
                          return (
                            <label
                              key={perm.key}
                              className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer border transition-colors ${
                                isChecked
                                  ? "bg-primary/5 border-primary/30"
                                  : "bg-base-100 border-base-200 hover:border-base-300"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() =>
                                  handleTogglePermission(perm.key)
                                }
                                className="checkbox checkbox-primary checkbox-xs mt-0.5"
                              />
                              <div className="space-y-0.5 min-w-0">
                                <span className="font-mono text-xs font-semibold block leading-tight truncate">
                                  {perm.key}
                                </span>
                                <span className="text-[11px] text-base-content/60 block leading-tight line-clamp-2">
                                  {perm.description || perm.name || perm.key}
                                </span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-base-200">
            <button
              type="button"
              onClick={() => roleModalRef.current?.close()}
              className="btn btn-sm btn-ghost"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createRole.isPending || updateRole.isPending}
              className="btn btn-sm btn-primary"
            >
              {createRole.isPending || updateRole.isPending
                ? "Saving..."
                : editingRole
                  ? "Update Role"
                  : "Create Role"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
