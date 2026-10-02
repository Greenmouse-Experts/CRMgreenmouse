import { useState, useRef, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import ContainerRow from "@/components/ContainerRow";
import SimpleContainer from "@/components/SimpleContainer";
import { useSearch } from "@/stores/data";
import { PlusCircleIcon, Tag, Layers, Wrench, Package } from "lucide-react";
import CustomTable from "@/components/tables/CustomTable";
import type { Actions } from "@/components/tables/pop-up";
import PageHeader from "@/components/Headers/PageHeader";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import PageLoader from "@/components/layout/PageLoader";
import ProductNav from "../-components/ProductNav";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  type Category,
} from "@/api/crmApi";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/products/categories/")({
  component: RouteComponent,
});

function RouteComponent() {
  const query = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const searchProps = useSearch();

  const [typeFilter, setTypeFilter] = useState<string>("all");

  const addModalRef = useRef<ModalHandle>(null);
  const editModalRef = useRef<ModalHandle>(null);

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [form, setForm] = useState({
    name: "",
    description: "",
    type: "product",
  });

  const handleOpenAdd = () => {
    setForm({
      name: "",
      description: "",
      type: "product",
    });
    addModalRef.current?.open();
  };

  const handleOpenEdit = (category: Category) => {
    setSelectedCategory(category);
    setForm({
      name: category.name || "",
      description: category.description || "",
      type: category.type || "product",
    });
    editModalRef.current?.open();
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Category name is required");
      return;
    }
    try {
      await createCategory.mutateAsync(form);
      toast.success("Category created successfully");
      addModalRef.current?.close();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create category");
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;
    try {
      await updateCategory.mutateAsync({
        id: selectedCategory.id,
        ...form,
      });
      toast.success("Category updated successfully");
      editModalRef.current?.close();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update category");
    }
  };

  const handleDelete = async (category: Category) => {
    if (
      !confirm(`Are you sure you want to delete category "${category.name}"?`)
    )
      return;
    try {
      await deleteCategory.mutateAsync(category.id);
      toast.success("Category deleted successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete category");
    }
  };

  const categoriesList = query.data || [];
  const searchTerm = searchProps.search?.toLowerCase() || "";

  const filteredCategories = useMemo(() => {
    return categoriesList.filter((c) => {
      if (searchTerm) {
        const matchesName = c.name?.toLowerCase().includes(searchTerm);
        const matchesDesc = c.description?.toLowerCase().includes(searchTerm);
        if (!matchesName && !matchesDesc) return false;
      }

      if (typeFilter !== "all") {
        const catType = c.type?.toLowerCase() || "product";
        if (catType !== typeFilter) return false;
      }

      return true;
    });
  }, [categoriesList, searchTerm, typeFilter]);

  const totalCategories = categoriesList.length;
  const productCategories = categoriesList.filter(
    (c) => (c.type || "product") === "product",
  ).length;
  const serviceCategories = categoriesList.filter(
    (c) => c.type === "service",
  ).length;

  const columns = [
    {
      key: "name",
      label: "Category Name",
      render: (_: any, item: Category) => (
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
            <Tag className="size-4" />
          </div>
          <div>
            <div className="font-semibold text-base-content">{item.name}</div>
            <div className="text-xs text-base-content/60 line-clamp-1 max-w-[280px]">
              {item.description || "No description"}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (val: any) => {
        const isService = val === "service";
        return (
          <span
            className={`badge badge-sm font-semibold capitalize ${
              isService
                ? "badge-secondary text-white"
                : "badge-primary text-white"
            }`}
          >
            {val || "product"}
          </span>
        );
      },
    },
    {
      key: "createdAt",
      label: "Created",
      render: (val: any) => (
        <span className="text-xs text-base-content/70">
          {val ? new Date(val).toLocaleDateString() : "—"}
        </span>
      ),
    },
  ];

  const actions: Actions<Category>[] = [
    {
      key: "edit",
      label: "Edit Category",
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
        title="Product & Service Categories"
        description="Organize your catalog items by department, type, or service group"
      >
        <button
          onClick={handleOpenAdd}
          className="btn btn-primary btn-sm gap-1.5"
        >
          <PlusCircleIcon className="size-4" /> Create Category
        </button>
      </PageHeader>

      <ProductNav />

      <PageLoader
        query={query}
        showSuccessState={true}
        emptyState={{
          title: "No Categories Found",
          description:
            "Get started by creating your first product or service category.",
          actionText: "Create Category",
          onAction: handleOpenAdd,
        }}
      >
        {/* Quick Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div
            onClick={() => setTypeFilter("all")}
            className={`card bg-base-100/70 backdrop-blur-md border p-4 shadow-sm cursor-pointer transition-all ${
              typeFilter === "all"
                ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                : "border-base-200 hover:shadow-md"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-base-content/60 uppercase">
                  Total Categories
                </p>
                <h3 className="text-2xl font-bold text-base-content mt-1">
                  {totalCategories}
                </h3>
                <p className="text-xs text-base-content/50 mt-0.5">
                  All item classifications
                </p>
              </div>
              <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20">
                <Layers className="size-6" />
              </div>
            </div>
          </div>

          <div
            onClick={() =>
              setTypeFilter(typeFilter === "product" ? "all" : "product")
            }
            className={`card bg-base-100/70 backdrop-blur-md border p-4 shadow-sm cursor-pointer transition-all ${
              typeFilter === "product"
                ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                : "border-base-200 hover:shadow-md"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-base-content/60 uppercase">
                  Product Categories
                </p>
                <h3 className="text-2xl font-bold text-base-content mt-1">
                  {productCategories}
                </h3>
                <p className="text-xs text-base-content/50 mt-0.5">
                  Inventory groupings
                </p>
              </div>
              <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20">
                <Package className="size-6" />
              </div>
            </div>
          </div>

          <div
            onClick={() =>
              setTypeFilter(typeFilter === "service" ? "all" : "service")
            }
            className={`card bg-base-100/70 backdrop-blur-md border p-4 shadow-sm cursor-pointer transition-all ${
              typeFilter === "service"
                ? "border-secondary ring-2 ring-secondary/20 bg-secondary/5"
                : "border-base-200 hover:shadow-md"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-base-content/60 uppercase">
                  Service Categories
                </p>
                <h3 className="text-2xl font-bold text-base-content mt-1">
                  {serviceCategories}
                </h3>
                <p className="text-xs text-base-content/50 mt-0.5">
                  Service offerings & consulting
                </p>
              </div>
              <div className="p-3 rounded-xl bg-secondary/10 text-secondary border border-secondary/20">
                <Wrench className="size-6" />
              </div>
            </div>
          </div>
        </div>

        <SimpleContainer title="Categories Directory">
          {/* Filter Bar */}
          <div className="flex items-center gap-1.5 mb-4">
            {[
              { id: "all", label: "All Categories" },
              { id: "product", label: "Products" },
              { id: "service", label: "Services" },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setTypeFilter(btn.id)}
                className={`btn btn-xs rounded-lg transition-all ${
                  typeFilter === btn.id
                    ? "btn-neutral text-neutral-content shadow-sm"
                    : "btn-ghost text-base-content/70"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <ContainerRow searchProps={searchProps} showSearch={true} />

          <CustomTable
            data={filteredCategories}
            columns={columns}
            actions={actions}
          />
        </SimpleContainer>
      </PageLoader>

      {/* Add Category Modal */}
      <Modal ref={addModalRef} title="Create Category">
        <form onSubmit={handleSaveAdd} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-base-content/70">
              Category Name *
            </label>
            <input
              type="text"
              required
              className="input input-bordered w-full mt-1"
              placeholder="e.g. Office Furniture or IT Consulting"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-base-content/70">
              Category Type
            </label>
            <select
              className="select select-bordered w-full mt-1"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="product">Product Category</option>
              <option value="service">Service Category</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-base-content/70">
              Description
            </label>
            <textarea
              className="textarea textarea-bordered w-full mt-1"
              rows={3}
              placeholder="Brief description of this category classification..."
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
              disabled={createCategory.isPending}
            >
              {createCategory.isPending ? "Creating..." : "Create Category"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Category Modal */}
      <Modal ref={editModalRef} title="Edit Category">
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-base-content/70">
              Category Name *
            </label>
            <input
              type="text"
              required
              className="input input-bordered w-full mt-1"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-base-content/70">
              Category Type
            </label>
            <select
              className="select select-bordered w-full mt-1"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="product">Product Category</option>
              <option value="service">Service Category</option>
            </select>
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
              disabled={updateCategory.isPending}
            >
              {updateCategory.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
