import { useState, useRef, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import SimpleContainer from "@/components/SimpleContainer";
import ContainerRow from "@/components/ContainerRow";
import { useSearch } from "@/stores/data";
import {
  PlusCircleIcon,
  Package,
  FileSpreadsheet,
  Upload,
  Globe,
  Store,
} from "lucide-react";
import CustomTable from "@/components/tables/CustomTable";
import type { Actions } from "@/components/tables/pop-up";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import PageHeader from "@/components/Headers/PageHeader";
import PageLoader from "@/components/layout/PageLoader";
import ProductSummary from "./-components/ProductSummary";
import ProductNav from "./-components/ProductNav";
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useAdjustStock,
  useExportProducts,
  useImportProducts,
  type Product,
} from "@/api/catalogApi";
import { useAdminCrossProducts } from "@/api/adminApi";
import { useCategories } from "@/api/crmApi";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/products/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [viewScope, setViewScope] = useState<"catalog" | "cross_tenant">(
    "catalog",
  );
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("");

  const productsQuery = useProducts();
  const crossProductsQuery = useAdminCrossProducts();
  const categoriesQuery = useCategories();

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const adjustStock = useAdjustStock();
  const exportProducts = useExportProducts();
  const importProducts = useImportProducts();

  const searchProps = useSearch();

  const addModalRef = useRef<ModalHandle>(null);
  const editModalRef = useRef<ModalHandle>(null);
  const detailsModalRef = useRef<ModalHandle>(null);
  const stockModalRef = useRef<ModalHandle>(null);
  const importModalRef = useRef<ModalHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [stockAdjustment, setStockAdjustment] = useState<number>(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    name: "",
    price: 0,
    cost: 0,
    description: "",
    categoryId: "",
    stock: 0,
    currency: "NGN",
    isActive: true,
  });

  const activeQuery =
    viewScope === "catalog" ? productsQuery : crossProductsQuery;
  const rawProducts: Product[] = (activeQuery.data || []) as Product[];

  const handleOpenAdd = () => {
    setForm({
      name: "",
      price: 0,
      cost: 0,
      description: "",
      categoryId: "",
      stock: 0,
      currency: "NGN",
      isActive: true,
    });
    addModalRef.current?.open();
  };

  const handleOpenEdit = (product: Product) => {
    setSelectedProduct(product);
    setForm({
      name: product.name || "",
      price: Number(product.price) || 0,
      cost: Number(product.cost) || 0,
      description: product.description || "",
      categoryId: product.categoryId || "",
      stock: product.stock ?? product.quantity ?? 0,
      currency: product.currency || "NGN",
      isActive: product.isActive ?? true,
    });
    editModalRef.current?.open();
  };

  const handleOpenDetails = (product: Product) => {
    setSelectedProduct(product);
    detailsModalRef.current?.open();
  };

  const handleOpenStock = (product: Product) => {
    setSelectedProduct(product);
    setStockAdjustment(0);
    stockModalRef.current?.open();
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Product name is required");
      return;
    }
    try {
      await createProduct.mutateAsync({
        ...form,
        type: "product",
      });
      toast.success("Product created successfully");
      addModalRef.current?.close();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create product");
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    try {
      await updateProduct.mutateAsync({
        id: selectedProduct.id,
        ...form,
      });
      toast.success("Product updated successfully");
      editModalRef.current?.close();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update product");
    }
  };

  const handleSaveStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    try {
      await adjustStock.mutateAsync({
        id: selectedProduct.id,
        adjustment: Number(stockAdjustment),
      });
      toast.success("Stock updated successfully");
      stockModalRef.current?.close();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to adjust stock");
    }
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) return;
    try {
      await deleteProduct.mutateAsync(product.id);
      toast.success("Product deleted successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete product");
    }
  };

  const handleExportCsv = async () => {
    try {
      toast.loading("Preparing CSV export...", { id: "export-csv" });
      await exportProducts.mutateAsync({
        type: "product",
        categoryId: categoryFilter || undefined,
      });
      toast.success("Products exported successfully", { id: "export-csv" });
    } catch (err: any) {
      toast.error(err?.message || "Failed to export products", {
        id: "export-csv",
      });
    }
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Please select a CSV file to import");
      return;
    }
    const formData = new FormData();
    formData.append("file", selectedFile);
    try {
      toast.loading("Importing products...", { id: "import-csv" });
      await importProducts.mutateAsync(formData);
      toast.success("Products imported successfully", { id: "import-csv" });
      setSelectedFile(null);
      importModalRef.current?.close();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to import products", {
        id: "import-csv",
      });
    }
  };

  const searchTerm = searchProps.search?.toLowerCase() || "";

  const filteredProducts = useMemo(() => {
    return rawProducts.filter((p) => {
      // Search term
      if (searchTerm) {
        const matchesName = p.name?.toLowerCase().includes(searchTerm);
        const matchesDesc = p.description?.toLowerCase().includes(searchTerm);
        const matchesCat = p.category?.name?.toLowerCase().includes(searchTerm);
        const matchesId = p.id?.toLowerCase().includes(searchTerm);
        if (!matchesName && !matchesDesc && !matchesCat && !matchesId)
          return false;
      }

      // Category filter
      if (categoryFilter && p.categoryId !== categoryFilter) {
        return false;
      }

      // Stock level filter
      const qty = p.stock ?? p.quantity ?? 0;
      if (stockFilter === "in_stock" && qty <= 5) return false;
      if (stockFilter === "low_stock" && (qty <= 0 || qty > 5)) return false;
      if (stockFilter === "out_of_stock" && qty > 0) return false;
      if (stockFilter === "inactive" && p.isActive !== false) return false;

      return true;
    });
  }, [rawProducts, searchTerm, categoryFilter, stockFilter]);

  const columns = [
    {
      key: "name",
      label: "Product",
      render: (_: any, item: Product) => {
        const img = item.images?.[0];
        return (
          <div className="flex items-center gap-3">
            {img ? (
              <img
                src={img}
                alt={item.name}
                className="size-10 rounded-lg object-cover border border-base-200"
              />
            ) : (
              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                <Package className="size-5" />
              </div>
            )}
            <div>
              <div
                className="font-semibold text-base-content hover:text-primary transition-colors cursor-pointer"
                onClick={() => handleOpenDetails(item)}
              >
                {item.name}
              </div>
              <div className="text-xs text-base-content/60 line-clamp-1 max-w-[220px]">
                {item.description || "No description provided"}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: "price",
      label: "Pricing & Margin",
      render: (val: any, item: Product) => {
        const price = Number(val || 0);
        const cost = Number(item.cost || 0);
        const margin =
          price > 0 && cost > 0
            ? (((price - cost) / price) * 100).toFixed(0)
            : null;
        return (
          <div>
            <span className="font-semibold text-base-content">
              {item.currency || "₦"}
              {price.toLocaleString()}
            </span>
            {cost > 0 && (
              <div className="text-xs text-base-content/50 flex items-center gap-1.5 mt-0.5">
                <span>
                  Cost: {item.currency || "₦"}
                  {cost.toLocaleString()}
                </span>
                {margin && (
                  <span className="badge badge-xs badge-success text-white font-mono">
                    {margin}%
                  </span>
                )}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "category",
      label: "Category",
      render: (_: any, item: Product) => (
        <span className="badge badge-sm badge-ghost font-medium">
          {item.category?.name || "General"}
        </span>
      ),
    },
    {
      key: "stock",
      label: "Stock Level",
      render: (_: any, item: Product) => {
        const qty = item.stock ?? item.quantity ?? 0;
        return (
          <button
            onClick={() => handleOpenStock(item)}
            title="Click to adjust stock"
            className={`badge badge-sm font-semibold cursor-pointer hover:opacity-80 transition-opacity ${
              qty > 5
                ? "badge-success text-white"
                : qty > 0
                  ? "badge-warning text-white"
                  : "badge-error text-white"
            }`}
          >
            {qty} units
          </button>
        );
      },
    },
    {
      key: "isActive",
      label: "Status",
      render: (val: any) => (
        <span
          className={`badge badge-sm ${
            val !== false ? "badge-success text-white" : "badge-ghost"
          }`}
        >
          {val !== false ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  const actions: Actions<Product>[] = [
    {
      key: "view",
      label: "View Details",
      action: (item) => handleOpenDetails(item),
    },
    {
      key: "stock",
      label: "Adjust Stock",
      action: (item) => handleOpenStock(item),
    },
    {
      key: "edit",
      label: "Edit Product",
      action: (item) => handleOpenEdit(item),
    },
    {
      key: "delete",
      label: "Delete",
      action: (item) => handleDelete(item),
    },
  ];

  return (
    <>
      <PageHeader
        title="Products Catalog"
        description="Oversee inventory, pricing, stock levels, and catalog items"
      >
        <div className="flex flex-wrap items-center gap-2">
          {/* Scope Toggle: Catalog vs Cross-tenant */}
          <div className="join border border-base-300 rounded-lg p-0.5 bg-base-100">
            <button
              onClick={() => setViewScope("catalog")}
              className={`join-item btn btn-xs ${
                viewScope === "catalog" ? "btn-primary" : "btn-ghost"
              }`}
            >
              <Store className="size-3 mr-1" /> My Catalog
            </button>
            <button
              onClick={() => setViewScope("cross_tenant")}
              className={`join-item btn btn-xs ${
                viewScope === "cross_tenant" ? "btn-primary" : "btn-ghost"
              }`}
            >
              <Globe className="size-3 mr-1" /> Platform Wide
            </button>
          </div>

          <button
            onClick={handleExportCsv}
            disabled={exportProducts.isPending}
            className="btn btn-outline btn-sm gap-1.5"
            title="Export products to CSV"
          >
            <FileSpreadsheet className="size-4" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={() => importModalRef.current?.open()}
            className="btn btn-outline btn-sm gap-1.5"
            title="Import products from CSV"
          >
            <Upload className="size-4" />
            <span className="hidden sm:inline">Import</span>
          </button>

          <Link
            to="/admin/products/add"
            className="btn btn-primary btn-sm gap-1.5"
          >
            <PlusCircleIcon className="size-4" /> Add Product
          </Link>
        </div>
      </PageHeader>

      <ProductNav />

      <PageLoader
        query={activeQuery}
        showSuccessState={true}
        emptyState={{
          title: "No Products Found",
          description:
            "Get started by adding your first product to the catalog.",
          actionText: "Add Product",
          onAction: handleOpenAdd,
        }}
      >
        <ProductSummary
          products={rawProducts}
          activeFilter={stockFilter}
          onFilterChange={(f) => setStockFilter(f)}
        />

        <SimpleContainer
          title={
            viewScope === "catalog"
              ? "Products Inventory"
              : "All Tenants' Products"
          }
        >
          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: "all", label: "All Items" },
                { id: "in_stock", label: "In Stock" },
                { id: "low_stock", label: "Low Stock" },
                { id: "out_of_stock", label: "Out of Stock" },
                { id: "inactive", label: "Inactive" },
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setStockFilter(btn.id)}
                  className={`btn btn-xs rounded-lg transition-all ${
                    stockFilter === btn.id
                      ? "btn-neutral text-neutral-content shadow-sm"
                      : "btn-ghost text-base-content/70"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <select
                className="select select-bordered select-sm text-xs rounded-lg w-40"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                {categoriesQuery.data?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <ContainerRow searchProps={searchProps} showSearch={true} />

          <CustomTable
            data={filteredProducts}
            columns={columns}
            actions={actions}
          />
        </SimpleContainer>
      </PageLoader>

      {/* Add Product Modal */}
      <Modal ref={addModalRef} title="Create New Product">
        <form onSubmit={handleSaveAdd} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-base-content/70">
              Product Name *
            </label>
            <input
              type="text"
              required
              className="input input-bordered w-full mt-1"
              placeholder="e.g. Ergonomic Office Chair"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-base-content/70">
                Selling Price (₦) *
              </label>
              <input
                type="number"
                required
                min="0"
                className="input input-bordered w-full mt-1"
                placeholder="0.00"
                value={form.price}
                onChange={(e) =>
                  setForm({ ...form, price: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-base-content/70">
                Cost Price (₦)
              </label>
              <input
                type="number"
                min="0"
                className="input input-bordered w-full mt-1"
                placeholder="0.00"
                value={form.cost}
                onChange={(e) =>
                  setForm({ ...form, cost: Number(e.target.value) })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-base-content/70">
                Initial Stock
              </label>
              <input
                type="number"
                min="0"
                className="input input-bordered w-full mt-1"
                placeholder="0"
                value={form.stock}
                onChange={(e) =>
                  setForm({ ...form, stock: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-base-content/70">
                Category
              </label>
              <select
                className="select select-bordered w-full mt-1"
                value={form.categoryId}
                onChange={(e) =>
                  setForm({ ...form, categoryId: e.target.value })
                }
              >
                <option value="">Select a category</option>
                {categoriesQuery.data?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-base-content/70">
              Description
            </label>
            <textarea
              className="textarea textarea-bordered w-full mt-1"
              rows={3}
              placeholder="Product description and specifications..."
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>

          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => addModalRef.current?.close()}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={createProduct.isPending}
            >
              {createProduct.isPending ? "Creating..." : "Create Product"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Product Modal */}
      <Modal ref={editModalRef} title="Edit Product">
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-base-content/70">
              Product Name *
            </label>
            <input
              type="text"
              required
              className="input input-bordered w-full mt-1"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-base-content/70">
                Selling Price (₦) *
              </label>
              <input
                type="number"
                required
                min="0"
                className="input input-bordered w-full mt-1"
                value={form.price}
                onChange={(e) =>
                  setForm({ ...form, price: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-base-content/70">
                Cost Price (₦)
              </label>
              <input
                type="number"
                min="0"
                className="input input-bordered w-full mt-1"
                value={form.cost}
                onChange={(e) =>
                  setForm({ ...form, cost: Number(e.target.value) })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-base-content/70">
                Category
              </label>
              <select
                className="select select-bordered w-full mt-1"
                value={form.categoryId}
                onChange={(e) =>
                  setForm({ ...form, categoryId: e.target.value })
                }
              >
                <option value="">Select a category</option>
                {categoriesQuery.data?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-base-content/70">
                Status
              </label>
              <select
                className="select select-bordered w-full mt-1"
                value={form.isActive ? "active" : "inactive"}
                onChange={(e) =>
                  setForm({ ...form, isActive: e.target.value === "active" })
                }
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-base-content/70">
              Description
            </label>
            <textarea
              className="textarea textarea-bordered w-full mt-1"
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>

          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => editModalRef.current?.close()}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={updateProduct.isPending}
            >
              {updateProduct.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Adjust Stock Modal */}
      <Modal ref={stockModalRef} title="Adjust Stock Quantity">
        <form onSubmit={handleSaveStock} className="space-y-4">
          <p className="text-sm text-base-content/70">
            Adjust inventory for{" "}
            <span className="font-semibold text-base-content">
              {selectedProduct?.name}
            </span>
            . Current stock:{" "}
            <span className="badge badge-sm badge-info font-bold">
              {selectedProduct?.stock ?? selectedProduct?.quantity ?? 0} units
            </span>
          </p>

          <div>
            <label className="text-xs font-semibold text-base-content/70">
              Adjustment Quantity (positive to add, negative to remove)
            </label>
            <input
              type="number"
              required
              className="input input-bordered w-full mt-1 font-mono"
              placeholder="e.g. 10 or -5"
              value={stockAdjustment}
              onChange={(e) => setStockAdjustment(Number(e.target.value))}
            />
          </div>

          <div className="p-3 bg-base-200/50 rounded-lg text-xs text-base-content/70 flex items-center justify-between">
            <span>New calculated stock level:</span>
            <span className="font-bold text-base-content text-sm">
              {Math.max(
                0,
                (selectedProduct?.stock ?? selectedProduct?.quantity ?? 0) +
                  Number(stockAdjustment),
              )}{" "}
              units
            </span>
          </div>

          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => stockModalRef.current?.close()}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={adjustStock.isPending}
            >
              {adjustStock.isPending ? "Updating..." : "Update Stock"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Import CSV Modal */}
      <Modal ref={importModalRef} title="Bulk Import Products from CSV">
        <form onSubmit={handleImportSubmit} className="space-y-4">
          <p className="text-xs text-base-content/70">
            Upload a CSV file with your product catalog items. File size should
            not exceed 2MB.
          </p>

          <div className="p-3 bg-base-200/60 rounded-xl text-xs space-y-1 font-mono text-base-content/80">
            <div className="font-bold text-base-content">
              Required CSV headers:
            </div>
            <div>name, price, cost, stock, categoryId, description</div>
          </div>

          <div>
            <label className="text-xs font-semibold text-base-content/70 block mb-1">
              Select CSV File
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              className="file-input file-input-bordered file-input-primary w-full text-xs"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
          </div>

          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => importModalRef.current?.close()}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={importProducts.isPending || !selectedFile}
            >
              {importProducts.isPending ? "Importing..." : "Upload & Import"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Details Modal */}
      <Modal ref={detailsModalRef} title="Product Details">
        {selectedProduct && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-base-200/50 rounded-xl">
              {selectedProduct.images?.[0] ? (
                <img
                  src={selectedProduct.images[0]}
                  alt={selectedProduct.name}
                  className="size-16 rounded-xl object-cover border border-base-200"
                />
              ) : (
                <div className="size-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Package className="size-8" />
                </div>
              )}
              <div>
                <h4 className="text-lg font-bold text-base-content">
                  {selectedProduct.name}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="badge badge-sm badge-ghost">
                    {selectedProduct.category?.name || "General"}
                  </span>
                  <span
                    className={`badge badge-sm ${
                      selectedProduct.isActive !== false
                        ? "badge-success text-white"
                        : "badge-ghost"
                    }`}
                  >
                    {selectedProduct.isActive !== false ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <div className="p-3 bg-base-200/30 rounded-lg">
                <span className="text-xs text-base-content/60 block">
                  Selling Price
                </span>
                <span className="font-bold text-base-content text-base">
                  {selectedProduct.currency || "₦"}
                  {Number(selectedProduct.price || 0).toLocaleString()}
                </span>
              </div>
              <div className="p-3 bg-base-200/30 rounded-lg">
                <span className="text-xs text-base-content/60 block">
                  Cost Price
                </span>
                <span className="font-bold text-base-content text-base">
                  {selectedProduct.currency || "₦"}
                  {Number(selectedProduct.cost || 0).toLocaleString()}
                </span>
              </div>
              <div className="p-3 bg-base-200/30 rounded-lg">
                <span className="text-xs text-base-content/60 block">
                  Current Stock
                </span>
                <span className="font-bold text-base-content text-base">
                  {selectedProduct.stock ?? selectedProduct.quantity ?? 0} units
                </span>
              </div>
            </div>

            {selectedProduct.description && (
              <div>
                <span className="text-xs font-semibold text-base-content/70 block mb-1">
                  Description
                </span>
                <p className="text-sm text-base-content/80 p-3 bg-base-200/30 rounded-lg">
                  {selectedProduct.description}
                </p>
              </div>
            )}

            <div className="flex justify-between items-center text-xs text-base-content/50 pt-2 border-t border-base-200">
              <span>ID: {selectedProduct.id}</span>
              <span>
                {selectedProduct.createdAt
                  ? `Created: ${new Date(selectedProduct.createdAt).toLocaleDateString()}`
                  : ""}
              </span>
            </div>

            <div className="modal-action">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => detailsModalRef.current?.close()}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
