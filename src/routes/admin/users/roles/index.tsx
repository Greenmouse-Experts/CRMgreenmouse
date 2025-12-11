import { createFileRoute, Link } from "@tanstack/react-router";
import ContainerRow from "@/components/ContainerRow";
import SimpleContainer from "@/components/SimpleContainer";
import { useSearch } from "@/stores/data";
import { PlusCircleIcon } from "lucide-react";
import CustomTable from "@/components/tables/CustomTable";
import DialogModal from "@/components/modals/DialogModal";
import { useModal } from "@/helpers/modals";
import SimpleInput from "@/components/inputs/SimpleInput";
import ActionButton from "@/components/buttons/ActionButton";
import { FormProvider, useForm } from "react-hook-form";
import SimpleTextArea from "@/components/inputs/SimpleTextArea";
import Modal from "@/components/modals/DialogModal";
import { useState } from "react";
import PageHeader from "@/components/Headers/PageHeader";

export const Route = createFileRoute("/admin/users/roles/")({
  component: RouteComponent,
});

const roles = [
  {
    id: 1,
    name: "Superadmin",
    description: "Full access to all system features and settings.",
    usersCount: 1,
    permissions: [
      "manage_users",
      "manage_roles",
      "manage_settings",
      "view_reports",
    ],
  },
  {
    id: 2,
    name: "Admin",
    description: "Manage users, content, and some system settings.",
    usersCount: 5,
    permissions: ["manage_users", "manage_content", "view_reports"],
  },
  {
    id: 3,
    name: "Staff",
    description: "Access to specific operational tasks and data.",
    usersCount: 20,
    permissions: ["view_orders", "process_returns"],
  },
  {
    id: 4,
    name: "Editor",
    description: "Create, edit, and publish content.",
    usersCount: 12,
    permissions: ["create_content", "edit_content", "publish_content"],
  },
  {
    id: 5,
    name: "Viewer",
    description: "Read-only access to certain sections.",
    usersCount: 50,
    permissions: ["view_content", "view_products"],
  },
];
function RouteComponent() {
  const [selectedItem, setSeletedItem] = useState<
    (typeof roles)[number] | null
  >(null);
  const columns = [
    { key: "id", label: "ID" },
    { key: "name", label: "Role Name" },
    { key: "description", label: "Description" },
    { key: "usersCount", label: "Number of Users" },
  ];

  const actions = [
    {
      key: "edit",
      label: "Edit",
      action: (item: any) => console.log("Edit", item),
    },
    {
      key: "viewPermissions",
      label: "View Permissions",
      action: (item: any) => {
        setSeletedItem(item);
        modal.showModal();

        // You might open a modal here to display permissions
      },
    },
    {
      key: "addPermissions",
      label: "Add Permissions",
      action: (item: any) => {
        addModal.showModal();
      },
    },
    {
      key: "delete",
      label: "Delete",
      action: (item: any) => console.log("Delete", item),
    },
  ];

  const {
    ref: addRoleModalRef,
    showModal: openAddRoleModal,
    closeModal: closeAddRoleModal,
  } = useModal();
  const methods = useForm();

  const onSubmit = (data: any) => {
    console.log("Add Role:", data);
    closeAddRoleModal();
  };

  const props = useSearch();
  const modal = useModal();
  const addModal = useModal();

  return (
    <>
      <PageHeader title="Staffs">
        {/*//@ts-ignore*/}
        <button onClick={openAddRoleModal} className="btn btn-primary ">
          <PlusCircleIcon /> Create Role
        </button>
      </PageHeader>
      <Modal title="Add Permissions" ref={addModal.ref}>
        <div className="space-y-2">
          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-2">
              <input type="checkbox" className="checkbox checkbox-primary" />
              <span className="label-text">Manage Users</span>
            </label>
          </div>
          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-2">
              <input type="checkbox" className="checkbox checkbox-primary" />
              <span className="label-text">Manage Roles</span>
            </label>
          </div>
          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-2">
              <input type="checkbox" className="checkbox checkbox-primary" />
              <span className="label-text">View Reports</span>
            </label>
          </div>
          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-2">
              <input type="checkbox" className="checkbox checkbox-primary" />
              <span className="label-text">View Orders</span>
            </label>
          </div>
          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-2">
              <input type="checkbox" className="checkbox checkbox-primary" />
              <span className="label-text">View Products</span>
            </label>
          </div>
          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-2">
              <input type="checkbox" className="checkbox checkbox-primary" />
              <span className="label-text">Edit Content</span>
            </label>
          </div>
          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-2">
              <input type="checkbox" className="checkbox checkbox-primary" />
              <span className="label-text">Publish Content</span>
            </label>
          </div>
        </div>
        <div className="modal-action">
          <ActionButton
            onClick={() => {
              addModal.closeModal();
              console.log("Permissions saved!");
            }}
          >
            Save Permissions
          </ActionButton>
        </div>
      </Modal>
      <Modal
        title={`Permissions for ${selectedItem?.name || "Role"}`}
        ref={modal.ref}
      >
        <div className="menu">
          {selectedItem?.permissions.length ? (
            selectedItem.permissions.map((permission, index) => (
              <li>
                <a>
                  <span className="size-2 bg-base-content/70 rounded-full"></span>
                  <span key={index} className="capitalize">
                    {permission.replace(/_/g, " ")}
                  </span>
                </a>
              </li>
            ))
          ) : (
            <p className="text-gray-500">
              No permissions assigned to this role.
            </p>
          )}
        </div>
      </Modal>
      <SimpleContainer
        title="Roles"
        actions={
          <>
            {/*<button
              className="btn btn-sm btn-primary"
              onClick={openAddRoleModal}
            >
              <PlusCircleIcon /> Create Role
            </button>*/}
          </>
        }
      >
        {props.search}
        <ContainerRow
          searchProps={props}
          showSearch={true}
          //@ts-ignore
          actions={
            <>
              <ExportOptions
                position="left"
                options={[
                  {
                    name: "export as pdf",
                    action: () => console.log("yes"),
                  },
                ]}
              />
            </>
          }
        />
        <CustomTable data={roles} columns={columns} actions={actions} />
      </SimpleContainer>

      <DialogModal ref={addRoleModalRef} title="Add New Role">
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
            <SimpleInput
              label="Role Name"
              placeholder="Enter role name"
              {...methods.register("roleName", {
                required: "Role name is required",
              })}
            />
            <SimpleTextArea
              label="Description"
              placeholder="Enter role description"
              {...methods.register("description")}
            />
            <div className="flex justify-end gap-2">
              <ActionButton
                type="button"
                onClick={closeAddRoleModal}
                className="btn-ghost"
              >
                Cancel
              </ActionButton>
              <ActionButton type="submit">Add Role</ActionButton>
            </div>
          </form>
        </FormProvider>
      </DialogModal>
    </>
  );
}

interface ExportProps {
  options?: [
    {
      name: string;
      action: () => any;
    },
  ];
  position?: "left" | "right";
}
const ExportOptions = (props: ExportProps) => {
  return (
    <div
      className={`dropdown ${props?.position == "left" ? "dropdown-start" : "dropdown-end"}`}
    >
      <button className="btn btn-sm ">Export</button>
      <ul className="dropdown-content menu bg-base-100 w-[152px] rounded-box shadow-xs">
        {props.options?.map((option) => (
          <li key={option.name}>
            <a>
              <button onClick={option.action}>{option.name}</button>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};
