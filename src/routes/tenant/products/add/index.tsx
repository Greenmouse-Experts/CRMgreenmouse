import { useState } from "react";
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
import { useUploadImage } from "@/api/imageApi";
import { toast } from "sonner";

interface ProductFormFields {
  name: string;
  price: number;
  cost?: number;
  description: string;
  quantity: number;
  categoryId: string;
}

export const Route = createFileRoute("/tenant/products/add/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const createProduct = useCreateProduct();
  const categoriesQuery = useCategories();
  const uploadImage = useUploadImage();
  const { image, setImage, image_link } = useSelectImage();
  const [submitting, setSubmitting] = useState(false);

  const methods = useForm<ProductFormFields>({
    defaultValues: {
      name: "",
      price: 0,
      cost: 0,
      description: "",
      quantity: 1,
      categoryId: "",
    },
  });

  const onSubmit = async (data: ProductFormFields) => {
    try {
      setSubmitting(true);
      let imageUrl: string | undefined = undefined;

      if (image) {
        try {
          const uploadRes = await uploadImage.mutateAsync(image);
          imageUrl = uploadRes?.data?.url;
        } catch {
          // If image fails, proceed with item creation
        }
      }

      await createProduct.mutateAsync({
        name: data.name,
        price: Number(data.price),
        cost: Number(data.cost || 0),
        stock: Number(data.quantity),
        description: data.description || undefined,
        categoryId: data.categoryId || undefined,
        images: imageUrl ? [imageUrl] : undefined,
        type: "product",
      });

      toast.success(`Product "${data.name}" created successfully.`);
      navigate({ to: "/tenant/products" });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create product.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-6">
      <SimpleTitle title={"Add New Product"} />
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className="flex flex-col gap-6 p-6 bg-base-100 border border-base-200 shadow-sm rounded-2xl"
        >
          <SelectImage
            image={image}
            setImage={setImage}
            image_link={image_link}
            title="Product Image"
          />

          <div className="flex flex-col gap-4">
            <SimpleInput
              label="Product Name"
              placeholder="e.g. Industrial Office Desk"
              {...methods.register("name", {
                required: "Product name is required",
              })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LocalSelect label="Category" {...methods.register("categoryId")}>
                <option value="">-- Select Category --</option>
                {categoriesQuery.data?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </LocalSelect>

              <SimpleInput
                label="Initial Stock Quantity"
                type="number"
                placeholder="1"
                {...methods.register("quantity", {
                  required: "Quantity is required",
                  valueAsNumber: true,
                  min: { value: 0, message: "Quantity cannot be negative" },
                })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SimpleInput
                label="Selling Price (₦)"
                type="number"
                placeholder="0.00"
                {...methods.register("price", {
                  required: "Price is required",
                  valueAsNumber: true,
                  min: { value: 0, message: "Price must be positive" },
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
              label="Product Description"
              placeholder="Enter product specifications, features, and details"
              {...methods.register("description")}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-base-200">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => navigate({ to: "/tenant/products" })}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
            >
              {submitting ? "Saving..." : "Add Product"}
            </button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
