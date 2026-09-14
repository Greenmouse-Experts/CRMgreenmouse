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
import { ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";

interface ProductFormFields {
  name: string;
  price: number;
  cost?: number;
  description: string;
  quantity: number;
  categoryId: string;
}

export const Route = createFileRoute("/admin/products/add/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const createProduct = useCreateProduct();
  const { data: categories = [] } = useCategories();
  const { image, setImage, image_link } = useSelectImage();
  const methods = useForm<ProductFormFields>();
  const { handleSubmit } = methods;

  const onSubmit = async (data: ProductFormFields) => {
    try {
      await createProduct.mutateAsync({
        name: data.name,
        price: Number(data.price),
        cost: data.cost ? Number(data.cost) : undefined,
        description: data.description,
        stock: Number(data.quantity),
        quantity: Number(data.quantity),
        categoryId: data.categoryId || undefined,
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
        <SimpleTitle title={"Add Product"} />
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
              placeholder="Enter product name"
              {...methods.register("name", {
                required: "Product name is required",
              })}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LocalSelect
                label="Category"
                {...methods.register("categoryId")}
              >
                <option value="">Select a category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </LocalSelect>

              <SimpleInput
                label="Stock Quantity *"
                type="number"
                placeholder="0"
                {...methods.register("quantity", {
                  required: "Quantity is required",
                  valueAsNumber: true,
                  min: { value: 0, message: "Quantity cannot be negative" },
                })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SimpleInput
                label="Selling Price (₦) *"
                type="number"
                placeholder="0.00"
                {...methods.register("price", {
                  required: "Price is required",
                  valueAsNumber: true,
                  min: { value: 0.01, message: "Price must be greater than 0" },
                })}
              />
              <SimpleInput
                label="Cost Price (₦)"
                type="number"
                placeholder="0.00"
                {...methods.register("cost", {
                  valueAsNumber: true,
                })}
              />
            </div>

            <SimpleTextArea
              label="Description"
              placeholder="Enter product description"
              {...methods.register("description")}
            />
          </div>

          <div className="flex items-center gap-3">
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
