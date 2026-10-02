
import SimpleTitle from "@/components/SimpleTitle";
import { useSelectImage } from "@/helpers/images";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import SelectImage from "@/components/images/SelectImage";
import SimpleInput from "@/components/inputs/SimpleInput";
import { useForm, FormProvider } from "react-hook-form";
import SimpleTextArea from "@/components/inputs/SimpleTextArea";
import LocalSelect from "@/components/inputs/LocalSelect";
import { useCreateProduct } from "@/api/catalogApi";
import { useCategories } from "@/api/crmApi";
import { toast } from "sonner";
import { ArrowLeft, Percent } from "lucide-react";
import { Link } from "@tanstack/react-router";

interface ProductFormFields {
  name: string;
  price: number;
  cost?: number;
  currency?: string;
  description: string;
  quantity: number;
  categoryId: string;
  isActive?: boolean;
}

export const Route = createFileRoute("/admin/products/add/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const createProduct = useCreateProduct();
  const { data: categories = [] } = useCategories();
  const { image, setImage, image_link } = useSelectImage();
  const methods = useForm<ProductFormFields>({
    defaultValues: {
      currency: "NGN",
      isActive: true,
      quantity: 0,
    },
  });
  const { handleSubmit, watch } = methods;

  const watchedPrice = watch("price");
  const watchedCost = watch("cost");
  const calculatedMargin =
    watchedPrice &&
    watchedCost &&
    Number(watchedPrice) > 0 &&
    Number(watchedCost) > 0
      ? (
          ((Number(watchedPrice) - Number(watchedCost)) /
            Number(watchedPrice)) *
          100
        ).toFixed(1)
      : null;

  const onSubmit = async (data: ProductFormFields) => {
    try {
      await createProduct.mutateAsync({
        name: data.name,
        price: Number(data.price),
        cost: data.cost ? Number(data.cost) : undefined,
        currency: data.currency || "NGN",
        description: data.description,
        stock: Number(data.quantity || 0),
        quantity: Number(data.quantity || 0),
        categoryId: data.categoryId || undefined,
        isActive: data.isActive ?? true,
        type: "product",
        images: image_link ? [image_link] : [],
      });
      toast.success("Product created successfully");
      navigate({ to: "/admin/products" });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create product");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Link to="/admin/products" className="btn btn-ghost btn-sm btn-circle">
          <ArrowLeft className="size-5" />
        </Link>
        <SimpleTitle title={"Add New Product"} />
      </div>

      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-6 p-6 bg-base-100/70 backdrop-blur-md border border-base-200 shadow-sm rounded-box max-w-3xl"
        >
          <SelectImage
            image={image}
            setImage={setImage}
            image_link={image_link}
            title="Product Image"
          />

          <div className="flex flex-col gap-4">
            <SimpleInput
              label="Product Name *"
              placeholder="e.g. Ergonomic Office Chair"
              {...methods.register("name", {
                required: "Product name is required",
              })}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LocalSelect label="Category" {...methods.register("categoryId")}>
                <option value="">Select a category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </LocalSelect>

              <SimpleInput
                label="Initial Stock Quantity *"
                type="number"
                placeholder="0"
                {...methods.register("quantity", {
                  required: "Quantity is required",
                  valueAsNumber: true,
                  min: { value: 0, message: "Quantity cannot be negative" },
                })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SimpleInput
                label="Selling Price *"
                type="number"
                placeholder="0.00"
                {...methods.register("price", {
                  required: "Price is required",
                  valueAsNumber: true,
                  min: { value: 0.01, message: "Price must be greater than 0" },
                })}
              />
              <SimpleInput
                label="Cost Price"
                type="number"
                placeholder="0.00"
                {...methods.register("cost", {
                  valueAsNumber: true,
                })}
              />
              <LocalSelect label="Currency" {...methods.register("currency")}>
                <option value="NGN">NGN (₦)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </LocalSelect>
            </div>

            {calculatedMargin !== null && (
              <div className="flex items-center gap-2 p-3 bg-base-200/50 rounded-xl text-xs">
                <Percent className="size-4 text-primary" />
                <span className="text-base-content/70">
                  Estimated Profit Margin:
                </span>
                <span
                  className={`font-bold ${
                    Number(calculatedMargin) >= 20
                      ? "text-emerald-500"
                      : Number(calculatedMargin) > 0
                        ? "text-amber-500"
                        : "text-rose-500"
                  }`}
                >
                  {calculatedMargin}%
                </span>
              </div>
            )}

            <SimpleTextArea
              label="Description"
              placeholder="Enter product description, technical specifications, warranty, etc."
              {...methods.register("description")}
            />
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-base-200">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={createProduct.isPending}
            >
              {createProduct.isPending ? "Adding..." : "Add Product"}
            </button>
            <Link to="/admin/products" className="btn btn-ghost">
              Cancel
            </Link>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
