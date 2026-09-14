import { useState, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import SimpleContainer from "@/components/SimpleContainer";
import ContainerRow from "@/components/ContainerRow";
import { useSearch } from "@/stores/data";
import { PlusCircleIcon, Building2, Globe, Mail, Phone, MapPin } from "lucide-react";
import CustomTable from "@/components/tables/CustomTable";
import type { Actions } from "@/components/tables/pop-up";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import CompanySummary from "./-components/CompanySummary";
import PageHeader from "@/components/Headers/PageHeader";
import PageLoader from "@/components/layout/PageLoader";
import {
  useCompanies,
  useCreateCompany,
  useDeleteCompany,
  type Company,
} from "@/api/crmApi";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/contacts/companies/")({
  component: RouteComponent,
});

function RouteComponent() {
  const query = useCompanies();
  const createCompany = useCreateCompany();
  const deleteCompany = useDeleteCompany();
  const searchProps = useSearch();

  const addModalRef = useRef<ModalHandle>(null);
  const detailsModalRef = useRef<ModalHandle>(null);

  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [form, setForm] = useState({
    name: "",
    industry: "",
    workPhone: "",
    email: "",
    website: "",
    addressLine1: "",
    city: "",
    state: "",
    country: "",
  });

  const handleOpenAdd = () => {
    setForm({
      name: "",
      industry: "",
      workPhone: "",
      email: "",
      website: "",
      addressLine1: "",
      city: "",
      state: "",
      country: "",
    });
    addModalRef.current?.open();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) {
      toast.error("Company name is required.");
      return;
    }

    try {
      await createCompany.mutateAsync(form);
      toast.success(`Company "${form.name}" created successfully.`);
      addModalRef.current?.close();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create company.");
    }
  };

  const handleDelete = async (company: Company) => {
    if (!window.confirm(`Are you sure you want to delete "${company.name}"?`)) {
      return;
    }

    try {
      await deleteCompany.mutateAsync(company.id);
      toast.success("Company deleted.");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete company.");
    }
  };

  const columns = [
    {
      key: "name",
      label: "Company",
      render: (_value: any, item: Company) => (
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
            <Building2 className="size-4" />
          </div>
          <div>
            <div className="font-semibold text-base-content leading-tight">
              {item.name}
            </div>
            {item.industry && (
              <div className="text-xs text-base-content/60">{item.industry}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      label: "Contact",
      render: (_value: any, item: Company) => (
        <div className="text-xs space-y-0.5">
          {item.email && <div className="text-base-content/80">{item.email}</div>}
          {item.workPhone && <div className="text-base-content/60">{item.workPhone}</div>}
          {!item.email && !item.workPhone && <span className="text-base-content/40">—</span>}
        </div>
      ),
    },
    {
      key: "website",
      label: "Website",
      render: (value: string) =>
        value ? (
          <a
            href={value.startsWith("http") ? value : `https://${value}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            <Globe className="size-3" />
            {value.replace(/^https?:\/\//, "")}
          </a>
        ) : (
          <span className="text-xs text-base-content/40">—</span>
        ),
    },
    {
      key: "location",
      label: "Location",
      render: (_value: any, item: Company) => (
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

  const actions: Actions<Company>[] = [
    {
      key: "view",
      label: "View Details",
      action: (item: Company) => {
        setSelectedCompany(item);
        detailsModalRef.current?.open();
      },
    },
    {
      key: "delete",
      label: "Delete Company",
      render: () => <span className="text-error font-medium">Delete Company</span>,
      action: (item: Company) => {
        handleDelete(item);
      },
    },
  ];

  return (
    <div className="space-y-4 pb-12">
      <PageHeader
        title="Companies"
        description="Manage business accounts, organizations, and institutional clients."
      >
        <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
          <PlusCircleIcon className="size-4" /> Add Company
        </button>
      </PageHeader>

      <CompanySummary />

      <SimpleContainer
        title={
          <>
            Company Directory{" "}
            {query.data && (
              <span className="opacity-80 text-xs">({query.data.length})</span>
            )}
          </>
        }
      >
        <ContainerRow showSearch searchProps={searchProps} />

        <PageLoader query={query}>
          {(companies) => {
            const filtered = companies.filter((c) => {
              if (!searchProps.search) return true;
              const term = searchProps.search.toLowerCase();
              return (
                c.name.toLowerCase().includes(term) ||
                (c.email && c.email.toLowerCase().includes(term)) ||
                (c.industry && c.industry.toLowerCase().includes(term))
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

      {/* Add Company Modal */}
      <Modal ref={addModalRef} title="Add New Company">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="label">
                <span className="label-text font-semibold">Company Name *</span>
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Acme Corporation"
                className="input input-sm input-bordered w-full"
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text font-semibold">Industry</span>
              </label>
              <input
                type="text"
                value={form.industry}
                onChange={(e) => setForm({ ...form, industry: e.target.value })}
                placeholder="e.g. Technology, Retail"
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
                placeholder="555-000-0000"
                className="input input-sm input-bordered w-full"
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text font-semibold">Email</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="contact@company.com"
                className="input input-sm input-bordered w-full"
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text font-semibold">Website</span>
              </label>
              <input
                type="text"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                placeholder="https://company.com"
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
                placeholder="123 Main Street"
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
                <span className="label-text font-semibold">State / Country</span>
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
              disabled={createCompany.isPending}
              className="btn btn-sm btn-primary"
            >
              {createCompany.isPending ? "Saving..." : "Create Company"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Details Modal */}
      <Modal
        ref={detailsModalRef}
        title="Company Information"
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
        {selectedCompany && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-base-200/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-base-content/60">Company</span>
                <span className="font-bold text-base-content">{selectedCompany.name}</span>
              </div>
              {selectedCompany.industry && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-base-content/60">Industry</span>
                  <span className="text-sm">{selectedCompany.industry}</span>
                </div>
              )}
              {selectedCompany.email && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-base-content/60">Email</span>
                  <span className="text-sm flex items-center gap-1.5">
                    <Mail className="size-3.5 text-base-content/60" /> {selectedCompany.email}
                  </span>
                </div>
              )}
              {selectedCompany.workPhone && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-base-content/60">Phone</span>
                  <span className="text-sm flex items-center gap-1.5">
                    <Phone className="size-3.5 text-base-content/60" /> {selectedCompany.workPhone}
                  </span>
                </div>
              )}
              {selectedCompany.website && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-base-content/60">Website</span>
                  <a
                    href={
                      selectedCompany.website.startsWith("http")
                        ? selectedCompany.website
                        : `https://${selectedCompany.website}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    <Globe className="size-3.5" /> {selectedCompany.website}
                  </a>
                </div>
              )}
              {selectedCompany.addressLine1 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-base-content/60">Address</span>
                  <span className="text-sm flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-base-content/60" /> {selectedCompany.addressLine1}
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
