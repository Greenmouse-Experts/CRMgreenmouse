import { useState, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import SimpleContainer from "@/components/SimpleContainer";
import ContainerRow from "@/components/ContainerRow";
import { useSearch } from "@/stores/data";
import { PlusCircleIcon, Package, Layers } from "lucide-react";
import CustomTable from "@/components/tables/CustomTable";
import type { Actions } from "@/components/tables/pop-up";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import PageHeader from "@/components/Headers/PageHeader";
import PageLoader from "@/components/layout/PageLoader";
import ProductSummary from "./-components/ProductSummary";
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useAdjustStock,
  type Product,
} from "@/api/catalogApi";
import { useCategories } from "@/api/crmApi";
import { toast } from "sonner";

export const Route = createFileRoute("/tenant/products/")({
  component: RouteComponent,
});

function RouteComponent() {
  const query = useProducts();
  const categoriesQuery = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const adjustStock = useAdjustStock();
  const searchProps = useSearch();

  const addModalRef = useRef<ModalHandle>(null);
  const editModalRef = useRef<ModalHandle>(null);
  const detailsModalRef = useRef<ModalHandle>(null);
  const stockModalRef = useRef<ModalHandle>(null);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [stockAdjustment, setStockAdjustment] = useState<number>(0);

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

  const productsList = query.data || [];
  const searchTerm = searchProps.search?.toLowerCase() || "";
  const filteredProducts = productsList.filter((p) => {
    if (!searchTerm) return true;
    return (
      p.name?.toLowerCase().includes(searchTerm) ||
      p.description?.toLowerCase().includes(searchTerm) ||
      p.category?.name?.toLowerCase().includes(searchTerm)
    );
  });

  const columns = [
    {
      key: "name",
      label: "Product",
      render: (_: any, item: Product) => (
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
            <Package className="size-4" />
          </div>
          <div>
            <div className="font-semibold text-base-content">{item.name}</div>
            <div className="text-xs text-base-content/60 line-clamp-1 max-w-[200px]">
              {item.description || "No description"}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "price",
      label: "Price",
      render: (val: any, item: Product) => (
        <div>
          <span className="font-medium text-base-content">
            {item.currency || "₦"}
            {Number(val || 0).toLocaleString()}
          </span>
          {item.cost ? (
            <div className="text-xs text-base-content/50">
              Cost: {item.currency || "₦"}
              {Number(item.cost).toLocaleString()}
            </div>
          ) : null}
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (_: any, item: Product) => (
        <span className="badge badge-sm badge-ghost">
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
          <span
            className={`badge badge-sm font-semibold ${
              qty > 5
                ? "badge-success text-white"
                : qty > 0
                  ? "badge-warning text-white"
                  : "badge-error text-white"
            }`}
          >
            {qty} units
          </span>
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
        description="Manage your inventory items, pricing, and stock levels"
      >
        <div className="flex items-center gap-2">
          <Link
            to="/tenant/products/categories"
            className="btn btn-outline btn-sm"
          >
            <Layers className="size-4" /> Categories
          </Link>
          <Link to="/tenant/products/add" className="btn btn-outline btn-sm">
            <PlusCircleIcon className="size-4" /> Full Add Form
          </Link>
          <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
            <PlusCircleIcon className="size-4" /> Quick Add
          </button>
        </div>
      </PageHeader>

      <PageLoader
        query={query}
        showSuccessState={true}
        emptyState={{
          title: "No Products Found",
          description:
            "Get started by adding your first product to the catalog.",
          actionText: "Add Product",
          onAction: handleOpenAdd,
        }}
      >
        <ProductSummary products={productsList} />

        <SimpleContainer title="Products Inventory">
          <ContainerRow searchProps={searchProps} showSearch={true} />
          <CustomTable
            data={filteredProducts}
            columns={columns}
            actions={actions}
          />
        </SimpleContainer>
      </PageLoader>

      {/* Quick Add Product Modal */}
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
            <span className="badge badge-sm badge-info">
              {selectedProduct?.stock ?? selectedProduct?.quantity ?? 0}
            </span>
          </p>

          <div>
            <label className="text-xs font-semibold text-base-content/70">
              Adjustment Amount (use positive to add, negative to remove)
            </label>
            <input
              type="number"
              required
              className="input input-bordered w-full mt-1"
              placeholder="e.g. 10 or -5"
              value={stockAdjustment}
              onChange={(e) => setStockAdjustment(Number(e.target.value))}
            />
          </div>

          <div className="p-3 bg-base-200/50 rounded-lg text-xs text-base-content/70">
            New calculated stock:{" "}
            <span className="font-bold text-base-content">
              {Math.max(
                0,
                (selectedProduct?.stock ?? selectedProduct?.quantity ?? 0) +
                  Number(stockAdjustment),
              )}
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

      {/* Details Modal */}
      <Modal ref={detailsModalRef} title="Product Details">
        {selectedProduct && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-base-200/50 rounded-xl">
              <div className="size-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Package className="size-7" />
              </div>
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

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-base-200/30 rounded-lg">
                <span className="text-xs text-base-content/60 block">
                  Selling Price
                </span>
                <span className="font-bold text-base-content text-base">
                  ₦{Number(selectedProduct.price || 0).toLocaleString()}
                </span>
              </div>
              <div className="p-3 bg-base-200/30 rounded-lg">
                <span className="text-xs text-base-content/60 block">
                  Cost Price
                </span>
                <span className="font-bold text-base-content text-base">
                  ₦{Number(selectedProduct.cost || 0).toLocaleString()}
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
              <div className="p-3 bg-base-200/30 rounded-lg">
                <span className="text-xs text-base-content/60 block">
                  Product ID
                </span>
                <span className="font-mono text-xs text-base-content/70">
                  {selectedProduct.id}
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
