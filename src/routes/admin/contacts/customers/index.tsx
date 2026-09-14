import { useState, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import SimpleContainer from "@/components/SimpleContainer";
import ContainerRow from "@/components/ContainerRow";
import { useSearch } from "@/stores/data";
import { PlusCircleIcon, User, Mail, Phone, MapPin } from "lucide-react";
import CustomTable from "@/components/tables/CustomTable";
import type { Actions } from "@/components/tables/pop-up";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import CustomerSummary from "./-components/CustomerSum";
import PageHeader from "@/components/Headers/PageHeader";
import PageLoader from "@/components/layout/PageLoader";
import {
  useCustomers,
  useCreateCustomer,
  useDeleteCustomer,
  type Customer,
} from "@/api/crmApi";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/contacts/customers/")({
  component: RouteComponent,
});

function RouteComponent() {
  const query = useCustomers();
  const createCustomer = useCreateCustomer();
  const deleteCustomer = useDeleteCustomer();
  const searchProps = useSearch();

  const addModalRef = useRef<ModalHandle>(null);
  const detailsModalRef = useRef<ModalHandle>(null);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    workPhone: "",
    cellPhone: "",
    addressLine1: "",
    city: "",
    state: "",
    country: "",
  });

  const handleOpenAdd = () => {
    setForm({
      firstName: "",
      lastName: "",
      email: "",
      workPhone: "",
      cellPhone: "",
      addressLine1: "",
      city: "",
      state: "",
      country: "",
    });
    addModalRef.current?.open();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email) {
      toast.error("Please fill in First Name, Last Name, and Email.");
      return;
    }

    try {
      await createCustomer.mutateAsync(form);
      toast.success(`Customer "${form.firstName} ${form.lastName}" added successfully.`);
      addModalRef.current?.close();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create customer.");
    }
  };

  const handleDelete = async (customer: Customer) => {
    if (
      !window.confirm(
        `Are you sure you want to delete customer "${customer.firstName} ${customer.lastName}"?`
      )
    ) {
      return;
    }

    try {
      await deleteCustomer.mutateAsync(customer.id);
      toast.success("Customer deleted.");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete customer.");
    }
  };

  const columns = [
    {
      key: "name",
      label: "Customer",
      render: (_value: any, item: Customer) => (
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
            <User className="size-4" />
          </div>
          <div>
            <div className="font-semibold text-base-content leading-tight">
              {item.firstName} {item.lastName}
            </div>
            <div className="text-xs text-base-content/60">{item.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "workPhone",
      label: "Phone",
      render: (_value: any, item: Customer) => (
        <span className="text-xs text-base-content/70">
          {item.workPhone || item.cellPhone || "—"}
        </span>
      ),
    },
    {
      key: "location",
      label: "Location",
      render: (_value: any, item: Customer) => (
        <span className="text-xs text-base-content/70">
          {item.city && item.country
            ? `${item.city}, ${item.country}`
            : item.country || item.city || "—"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Added",
      render: (value: string) => (
        <span className="text-xs text-base-content/60">
          {value ? new Date(value).toLocaleDateString() : "—"}
        </span>
      ),
    },
  ];

  const actions: Actions<Customer>[] = [
    {
      key: "view",
      label: "View Details",
      action: (item: Customer) => {
        setSelectedCustomer(item);
        detailsModalRef.current?.open();
      },
    },
    {
      key: "delete",
      label: "Delete Customer",
      render: () => <span className="text-error font-medium">Delete Customer</span>,
      action: (item: Customer) => {
        handleDelete(item);
      },
    },
  ];

  return (
    <div className="space-y-4 pb-12">
      <PageHeader
        title="Customers"
        description="Manage contacts, individual client accounts, and relationship records."
      >
        <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
          <PlusCircleIcon className="size-4" /> Add Customer
        </button>
      </PageHeader>

      <CustomerSummary />

      <SimpleContainer
        title={
          <>
            Customer Directory{" "}
            {query.data && (
              <span className="opacity-80 text-xs">({query.data.length})</span>
            )}
          </>
        }
      >
        <ContainerRow showSearch searchProps={searchProps} />

        <PageLoader query={query}>
          {(customers) => {
            const filtered = customers.filter((c) => {
              if (!searchProps.search) return true;
              const term = searchProps.search.toLowerCase();
              return (
                c.firstName.toLowerCase().includes(term) ||
                c.lastName.toLowerCase().includes(term) ||
                c.email.toLowerCase().includes(term)
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

      {/* Add Customer Modal */}
      <Modal ref={addModalRef} title="Add New Customer">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">
                <span className="label-text font-semibold">First Name *</span>
              </label>
              <input
                type="text"
                required
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                placeholder="John"
                className="input input-sm input-bordered w-full"
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text font-semibold">Last Name *</span>
              </label>
              <input
                type="text"
                required
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                placeholder="Doe"
                className="input input-sm input-bordered w-full"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="label">
                <span className="label-text font-semibold">Email Address *</span>
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="john.doe@example.com"
                className="input input-sm input-bordered w-full"
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text font-semibold">Work Phone</span>
              </label>
              <input
                type="text"
                value={form.workPhone}
                onChange={(e) => setForm({ ...form, workPhone: e.target.value })}
                placeholder="555-123-4567"
                className="input input-sm input-bordered w-full"
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text font-semibold">Cell Phone</span>
              </label>
              <input
                type="text"
                value={form.cellPhone}
                onChange={(e) => setForm({ ...form, cellPhone: e.target.value })}
                placeholder="555-987-6543"
                className="input input-sm input-bordered w-full"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="label">
                <span className="label-text font-semibold">Address Line 1</span>
              </label>
              <input
                type="text"
                value={form.addressLine1}
                onChange={(e) => setForm({ ...form, addressLine1: e.target.value })}
                placeholder="456 Oak Avenue"
                className="input input-sm input-bordered w-full"
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text font-semibold">City</span>
              </label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="Metropolis"
                className="input input-sm input-bordered w-full"
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text font-semibold">State / Province</span>
              </label>
              <input
                type="text"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                placeholder="New York"
                className="input input-sm input-bordered w-full"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="label">
                <span className="label-text font-semibold">Country</span>
              </label>
              <input
                type="text"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                placeholder="United States"
                className="input input-sm input-bordered w-full"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-base-200">
            <button
              type="button"
              onClick={() => addModalRef.current?.close()}
              className="btn btn-sm btn-ghost"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createCustomer.isPending}
              className="btn btn-sm btn-primary"
            >
              {createCustomer.isPending ? "Creating..." : "Create Customer"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Customer Details Modal */}
      <Modal
        ref={detailsModalRef}
        title="Customer Profile Details"
        actions={
          <button
            type="button"
            onClick={() => detailsModalRef.current?.close()}
            className="btn btn-sm btn-ghost"
          >
            Close
          </button>
        }
      >
        {selectedCustomer && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-base-200/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-base-content/60">Full Name</span>
                <span className="font-bold text-base-content">
                  {selectedCustomer.firstName} {selectedCustomer.lastName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-base-content/60">Email</span>
                <span className="text-sm flex items-center gap-1.5">
                  <Mail className="size-3.5 text-base-content/60" /> {selectedCustomer.email}
                </span>
              </div>
              {(selectedCustomer.workPhone || selectedCustomer.cellPhone) && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-base-content/60">Phone</span>
                  <span className="text-sm flex items-center gap-1.5">
                    <Phone className="size-3.5 text-base-content/60" />{" "}
                    {selectedCustomer.workPhone || selectedCustomer.cellPhone}
                  </span>
                </div>
              )}
              {selectedCustomer.addressLine1 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-base-content/60">Address</span>
                  <span className="text-sm flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-base-content/60" /> {selectedCustomer.addressLine1}
                  </span>
                </div>
              )}
              {(selectedCustomer.city || selectedCustomer.country) && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-base-content/60">Location</span>
                  <span className="text-sm">
                    {[selectedCustomer.city, selectedCustomer.state, selectedCustomer.country]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
