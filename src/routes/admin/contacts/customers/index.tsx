import { useState, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import SimpleContainer from "@/components/SimpleContainer";
import ContainerRow from "@/components/ContainerRow";
import { useSearch } from "@/stores/data";
import { User, RefreshCw } from "lucide-react";
import CustomTable from "@/components/tables/CustomTable";
import type { Actions } from "@/components/tables/pop-up";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import CustomerSummary from "./-components/CustomerSum";
import PageHeader from "@/components/Headers/PageHeader";
import PageLoader from "@/components/layout/PageLoader";
import { useAdminCrossContacts } from "@/api/adminApi";
import type { Customer } from "@/api/crmApi";

export const Route = createFileRoute("/admin/contacts/customers/")({
  component: RouteComponent,
});

function RouteComponent() {
  const searchProps = useSearch();
  const query = useAdminCrossContacts({
    search: searchProps.search || undefined,
  });

  const detailsModalRef = useRef<ModalHandle>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );

  const handleOpenDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    detailsModalRef.current?.open();
  };

  const columns = [
    {
      key: "name",
      label: "Customer Name",
      render: (_value: any, item: Customer) => (
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
            <User className="size-4" />
          </div>
          <div>
            <div className="font-semibold text-base-content leading-tight">
              {item.firstName} {item.lastName}
            </div>
            <div className="text-sm text-base-content/60">{item.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "workPhone",
      label: "Phone",
      render: (_value: any, item: Customer) => (
        <span className="text-sm text-base-content/70">
          {item.workPhone || item.cellPhone || "—"}
        </span>
      ),
    },
    {
      key: "city",
      label: "City / State",
      render: (_value: any, item: Customer) => (
        <span className="text-sm text-base-content/70">
          {[item.city, item.state].filter(Boolean).join(", ") || "—"}
        </span>
      ),
    },
    {
      key: "country",
      label: "Country",
      render: (_value: any, item: Customer) => (
        <span className="badge badge-ghost badge-md font-medium">
          {item.country || "—"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Date Added",
      render: (_value: any, item: Customer) => (
        <span className="text-sm text-base-content/60">
          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}
        </span>
      ),
    },
  ];

  const actions: Actions<Customer>[] = [
    {
      key: "view",
      label: "View Details",
      action: (customer) => handleOpenDetails(customer),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Customers Directory"
        description="Audit, monitor, and inspect individual client profiles across all platform tenants"
      >
        <button
          onClick={() => query.refetch()}
          className="btn btn-outline btn-sm gap-2"
          disabled={query.isFetching}
        >
          <RefreshCw
            size={15}
            className={query.isFetching ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </PageHeader>

      <PageLoader query={query}>
        {() => (
          <div className="space-y-6">
            <CustomerSummary />

            <SimpleContainer>
              <ContainerRow
                showSearch
                searchProps={searchProps}
                searchPlaceholder="Search customers by name or email..."
              />
              <CustomTable
                actions={actions}
                columns={columns}
                data={query.data || []}
              />
            </SimpleContainer>

            {/* Customer Details Modal */}
            <Modal ref={detailsModalRef}>
              {selectedCustomer && (
                <div className="p-6 space-y-6">
                  <div className="flex items-center gap-3 border-b border-base-200 pb-4">
                    <div className="bg-primary/10 text-primary p-3 rounded-xl">
                      <User size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-base-content">
                        {selectedCustomer.firstName} {selectedCustomer.lastName}
                      </h3>
                      <p className="text-sm text-base-content/60">
                        Customer ID: {selectedCustomer.id}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-base-200/50 p-3 rounded-lg">
                      <span className="text-sm text-base-content/60 block">
                        Email Address
                      </span>
                      <span className="text-sm font-semibold text-base-content break-all">
                        {selectedCustomer.email || "—"}
                      </span>
                    </div>
                    <div className="bg-base-200/50 p-3 rounded-lg">
                      <span className="text-sm text-base-content/60 block">
                        Phone
                      </span>
                      <span className="text-sm font-semibold text-base-content">
                        {selectedCustomer.workPhone ||
                          selectedCustomer.cellPhone ||
                          "—"}
                      </span>
                    </div>
                    <div className="bg-base-200/50 p-3 rounded-lg">
                      <span className="text-sm text-base-content/60 block">
                        Location
                      </span>
                      <span className="text-sm font-semibold text-base-content">
                        {[
                          selectedCustomer.addressLine1,
                          selectedCustomer.city,
                          selectedCustomer.state,
                          selectedCustomer.country,
                        ]
                          .filter(Boolean)
                          .join(", ") || "—"}
                      </span>
                    </div>
                    <div className="bg-base-200/50 p-3 rounded-lg">
                      <span className="text-sm text-base-content/60 block">
                        Created At
                      </span>
                      <span className="text-sm font-semibold text-base-content">
                        {selectedCustomer.createdAt
                          ? new Date(
                              selectedCustomer.createdAt,
                            ).toLocaleString()
                          : "—"}
                      </span>
                    </div>
                  </div>

                  <div className="modal-action">
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => detailsModalRef.current?.close()}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </Modal>
          </div>
        )}
      </PageLoader>
    </div>
  );
}
