import { createFileRoute } from "@tanstack/react-router";
import ContainerRow from "@/components/ContainerRow";
import SimpleContainer from "@/components/SimpleContainer";
import { useSearch } from "@/stores/data";
import { PlusCircleIcon } from "lucide-react";
import CustomTable from "@/components/tables/CustomTable";
import { faker } from "@faker-js/faker";
import DialogModal from "@/components/modals/DialogModal";
import { useModal } from "@/helpers/modals";
import SimpleInput from "@/components/inputs/SimpleInput";
import ActionButton from "@/components/buttons/ActionButton";
import { FormProvider, useForm } from "react-hook-form";
import SimpleTextArea from "@/components/inputs/SimpleTextArea";

export const Route = createFileRoute("/admin/users/roles/")({
  component: RouteComponent,
});

function RouteComponent() {
  const roles = Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    name: faker.person.jobTitle(),
    description: faker.lorem.sentence(),
    usersCount: faker.number.int({ min: 0, max: 100 }),
  }));

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
  return (
    <div>
      <SimpleContainer
        title="Roles"
        actions={
          <>
            <button
              className="btn btn-sm btn-primary"
              onClick={openAddRoleModal}
            >
              <PlusCircleIcon /> Create Role
            </button>
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
    </div>
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
