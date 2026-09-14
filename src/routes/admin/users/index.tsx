import { createFileRoute } from "@tanstack/react-router";
import ContainerRow from "@/components/ContainerRow";
import SimpleContainer from "@/components/SimpleContainer";
import { useSearch } from "@/stores/data";
import { PlusCircleIcon, User } from "lucide-react";
import CustomTable from "@/components/tables/CustomTable";
import UserSummary from "./-components/UsersSummary";
import DropDownBtn from "@/components/buttons/DropdownBtn";
import type { Actions } from "@/components/tables/pop-up";
import { useModal } from "@/helpers/modals";
import Modal from "@/components/DialogModal";
import { Link } from "@tanstack/react-router";
import PageHeader from "@/components/Headers/PageHeader";
import PageLoader from "@/components/layout/PageLoader";
import { useStaffs, type StaffMember } from "@/api/adminApi";

export const Route = createFileRoute("/admin/users/")({
  component: RouteComponent,
});

function RouteComponent() {
  const query = useStaffs();
  const props = useSearch();

  const columns = [
    {
      key: "profilePic",
      label: "Avatar",
      render: (value: string, item: StaffMember) => (
        <div className="avatar">
          <div className="mask mask-squircle w-10 h-10 bg-primary/10 text-primary flex items-center justify-center font-bold">
            {value ? (
              <img src={value} alt={`${item.firstName} ${item.lastName}`} />
            ) : (
              <User className="size-5" />
            )}
          </div>
        </div>
      ),
    },
    {
      key: "name",
      label: "Name",
      render: (_value: any, item: StaffMember) => (
        <span className="font-semibold text-base-content">
          {item.firstName} {item.lastName}
        </span>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (_value: any, item: StaffMember) => (
        <span className="badge badge-sm badge-ghost">
          {item.role?.name || "Staff"}
        </span>
      ),
    },
    { key: "email", label: "Email" },
    {
      key: "phoneNumber",
      label: "Phone",
      render: (value: string) => value || "—",
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => (
        <span
          className={`badge badge-sm ${
            value === "active" ? "badge-success text-success-content" : "badge-ghost"
          }`}
        >
          {value || "active"}
        </span>
      ),
    },
  ];

  const actions: Actions[] = [
    {
      key: "view",
      label: "View",
      action: (item: any, nav) => {
        nav({
          to: "/admin/users/details/" + (item.id || "details"),
        });
      },
    },
  ];

  const modal = useModal();

  return (
    <div className="space-y-4 pb-12">
      <PageHeader title="Staff Members">
        <Link to="/admin/users/add" className="btn btn-primary btn-sm">
          <PlusCircleIcon className="size-4" /> Add Staff
        </Link>
      </PageHeader>
      <Modal ref={modal.ref} title="Add Staff"></Modal>
      <UserSummary />
      <SimpleContainer
        title={
          <>
            Staff Directory{" "}
            {query.data && (
              <span className="opacity-80 text-xs">({query.data.length})</span>
            )}
          </>
        }
      >
        <ContainerRow showSearch searchProps={props}>
          <DropDownBtn
            title="Export"
            items={[
              {
                name: "CSV",
                action: () => {},
              },
            ]}
          />
        </ContainerRow>
        <PageLoader query={query}>
          {(staffs) => (
            <CustomTable data={staffs} columns={columns} actions={actions} />
          )}
        </PageLoader>
      </SimpleContainer>
    </div>
  );
}
