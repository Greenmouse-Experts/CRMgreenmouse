import { useState, useRef, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import ContainerRow from "@/components/ContainerRow";
import SimpleContainer from "@/components/SimpleContainer";
import { useSearch } from "@/stores/data";
import { Tag, Layers, Wrench, Package, RefreshCw } from "lucide-react";
import CustomTable from "@/components/tables/CustomTable";
import type { Actions } from "@/components/tables/pop-up";
import PageHeader from "@/components/Headers/PageHeader";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import PageLoader from "@/components/layout/PageLoader";
import ProductNav from "../-components/ProductNav";
import { useAdminCrossCategories } from "@/api/adminApi";

export const Route = createFileRoute("/admin/products/categories/")({
  component: RouteComponent,
});

function RouteComponent() {
  const query = useAdminCrossCategories();
  const searchProps = useSearch();

  const [typeFilter, setTypeFilter] = useState<string>("all");
  const detailsModalRef = useRef<ModalHandle>(null);
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);

  const rawCategories = useMemo(() => {
    return Array.isArray(query.data) ? query.data : [];
  }, [query.data]);

  // Statistics
  const stats = useMemo(() => {
    const total = rawCategories.length;
    const products = rawCategories.filter(
      (c: any) => (c.type || "product").toLowerCase() === "product",
    ).length;
    const services = rawCategories.filter(
      (c: any) => (c.type || "").toLowerCase() === "service",
    ).length;
    return { total, products, services };
  }, [rawCategories]);

  // Filtered categories
  const filteredCategories = useMemo(() => {
    return rawCategories.filter((c: any) => {
      if (typeFilter === "product") {
        return (c.type || "product").toLowerCase() === "product";
      }
      if (typeFilter === "service") {
        return (c.type || "").toLowerCase() === "service";
      }
      return true;
    });
  }, [rawCategories, typeFilter]);

  const handleOpenDetails = (category: any) => {
    setSelectedCategory(category);
    detailsModalRef.current?.open();
  };

  const actions: Actions<any>[] = [
    {
      key: "view_details",
      label: "View Details",
      action: (cat) => handleOpenDetails(cat),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Category Directory"
        description="Monitor, audit, and organize catalog classifications across all tenant catalogs"
      >
        <div className="flex flex-wrap items-center gap-2">
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
        </div>
      </PageHeader>

      <ProductNav />

      <PageLoader query={query}>
        {() => (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-base-100 rounded-box border border-base-200 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 text-primary p-2.5 rounded-lg">
                    <Layers size={20} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-base-content">
                      {stats.total}
                    </div>
                    <div className="text-xs text-base-content/60">
                      Total Categories
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-base-100 rounded-box border border-base-200 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="bg-info/10 text-info p-2.5 rounded-lg">
                    <Package size={20} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-info">
                      {stats.products}
                    </div>
                    <div className="text-xs text-base-content/60">
                      Product Categories
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-base-100 rounded-box border border-base-200 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="bg-secondary/10 text-secondary p-2.5 rounded-lg">
                    <Wrench size={20} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-secondary">
                      {stats.services}
                    </div>
                    <div className="text-xs text-base-content/60">
                      Service Categories
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <SimpleContainer>
              <div className="p-4 border-b border-base-200 flex flex-wrap items-center justify-between gap-4">
                {/* Type Filter Pills */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { label: "All Categories", key: "all" },
                    { label: "Products", key: "product" },
                    { label: "Services", key: "service" },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setTypeFilter(tab.key)}
                      className={`btn btn-xs rounded-full ${
                        typeFilter === tab.key
                          ? "btn-primary text-primary-content"
                          : "btn-ghost text-base-content/70"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <ContainerRow {...searchProps}>
                <CustomTable
                  actions={actions}
                  columns={[
                    {
                      label: "Category Name",
                      key: "name",
                      render: (c: any) => (
                        <div className="flex items-center gap-3">
                          <div className="avatar placeholder">
                            <div className="bg-base-200 text-base-content/70 rounded-lg w-9 h-9 flex items-center justify-center">
                              <Tag size={16} />
                            </div>
                          </div>
                          <div>
                            <div className="font-semibold text-base-content">
                              {c.name}
                            </div>
                            {c.description && (
                              <div className="text-xs text-base-content/60 truncate max-w-sm">
                                {c.description}
                              </div>
                            )}
                          </div>
                        </div>
                      ),
                    },
                    {
                      label: "Type",
                      key: "type",
                      render: (c: any) => {
                        const isService =
                          (c.type || "").toLowerCase() === "service";
                        return (
                          <span
                            className={`badge badge-sm font-medium ${
                              isService
                                ? "badge-secondary badge-outline"
                                : "badge-info badge-outline"
                            }`}
                          >
                            {isService ? "Service" : "Product"}
                          </span>
                        );
                      },
                    },
                    {
                      label: "Tenant ID",
                      key: "tenantId",
                      render: (c: any) => (
                        <span className="text-xs font-mono text-base-content/60 truncate max-w-[140px] block">
                          {c.tenantId || "Global / System"}
                        </span>
                      ),
                    },
                    {
                      label: "Created",
                      key: "createdAt",
                      render: (c: any) => (
                        <span className="text-xs text-base-content/60">
                          {c.createdAt
                            ? new Date(c.createdAt).toLocaleDateString()
                            : "—"}
                        </span>
                      ),
                    },
                  ]}
                  data={filteredCategories}
                />
              </ContainerRow>
            </SimpleContainer>

            {/* Details Modal */}
            <Modal ref={detailsModalRef}>
              {selectedCategory && (
                <div className="p-6 space-y-6">
                  <div className="flex items-start justify-between border-b border-base-200 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 text-primary p-3 rounded-xl">
                        <Tag size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-base-content">
                          {selectedCategory.name}
                        </h3>
                        <p className="text-xs text-base-content/60 font-mono">
                          ID: {selectedCategory.id}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`badge badge-md ${
                        (selectedCategory.type || "").toLowerCase() ===
                        "service"
                          ? "badge-secondary"
                          : "badge-info"
                      }`}
                    >
                      {selectedCategory.type || "Product"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-base-200/50 p-3 rounded-lg">
                      <span className="text-xs text-base-content/60 block">
                        Tenant Scope
                      </span>
                      <span className="text-xs font-mono text-base-content font-semibold break-all">
                        {selectedCategory.tenantId || "Platform / Global"}
                      </span>
                    </div>
                    <div className="bg-base-200/50 p-3 rounded-lg">
                      <span className="text-xs text-base-content/60 block">
                        Created Date
                      </span>
                      <span className="text-sm font-semibold text-base-content">
                        {selectedCategory.createdAt
                          ? new Date(
                              selectedCategory.createdAt,
                            ).toLocaleString()
                          : "N/A"}
                      </span>
                    </div>
                  </div>

                  {selectedCategory.description && (
                    <div className="bg-base-200/30 p-4 rounded-lg">
                      <span className="text-xs font-semibold text-base-content/70 block mb-1">
                        Description
                      </span>
                      <p className="text-sm text-base-content/80 whitespace-pre-wrap">
                        {selectedCategory.description}
                      </p>
                    </div>
                  )}

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
