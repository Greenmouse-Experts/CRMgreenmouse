import { useState } from "react";
import SimpleTitle from "@/components/SimpleTitle";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import SimpleInput from "@/components/inputs/SimpleInput";
import { useForm, FormProvider, Controller } from "react-hook-form";
import SimpleTextArea from "@/components/inputs/SimpleTextArea";
import MoneyInput from "@/components/inputs/MoneyInput";
import LocalSelect from "@/components/inputs/LocalSelect";
import UpdateImages from "@/components/images/UpdateImages";
import { useCreateProduct } from "@/api/catalogApi";
import { useCategories } from "@/api/crmApi";
import { uploadedFileUrl, useUploadImage } from "@/api/imageApi";
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
  const categoriesQuery = useCategories("product");
  const uploadImage = useUploadImage();
  const [submitting, setSubmitting] = useState(false);

  const [newImages, setNewImages] = useState<File[] | FileList | []>([]);
  const [prevImages, setPrevImages] = useState<{ url: string; path: string }[]>(
    [],
  );

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
      const uploadedUrls: string[] = [];

      if (newImages && newImages.length > 0) {
        const filesArr = Array.from(newImages);
        for (const file of filesArr) {
          const uploadRes = await uploadImage.mutateAsync(file);
          const url = uploadedFileUrl(uploadRes);
          if (!url) throw new Error(`Could not upload ${file.name}.`);
          uploadedUrls.push(url);
        }
      }

      const finalImages = [...prevImages.map((i) => i.url), ...uploadedUrls];

      await createProduct.mutateAsync({
        name: data.name,
        price: Number(data.price),
        cost: Number(data.cost || 0),
        stock: Number(data.quantity),
        description: data.description || undefined,
        categoryId: data.categoryId || undefined,
        images: finalImages.length > 0 ? finalImages : undefined,
        type: "product",
      });

      toast.success(`Product "${data.name}" created successfully.`);
      navigate({ to: "/tenant/products" });
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to create product.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4  mx-auto space-y-6">
      <SimpleTitle title={"Add New Product"} />
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className="flex flex-col gap-6 p-6 bg-base-100 border border-base-200 shadow-sm rounded-2xl"
        >
          <div>
            <label className="text-sm font-semibold mb-2 block">
              Product Images
            </label>
            <UpdateImages
              images={prevImages}
              setNew={(files) => setNewImages(files)}
              setPrev={(imgs) => setPrevImages(imgs)}
            />
          </div>

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
              <Controller
                name="price"
                control={methods.control}
                rules={{
                  required: "Price is required",
                  validate: (value) =>
                    (value !== undefined && value > 0) ||
                    "Price must be a positive number",
                }}
                render={({ field, fieldState }) => (
                  <MoneyInput
                    label="Selling Price (₦)"
                    required
                    {...field}
                    error={fieldState.error?.message}
                  />
                )}
              />

              <Controller
                name="cost"
                control={methods.control}
                rules={{
                  validate: (value) =>
                    value === undefined || value >= 0 || "Cost cannot be negative",
                }}
                render={({ field, fieldState }) => (
                  <MoneyInput
                    label="Cost Price (₦)"
                    {...field}
                    error={fieldState.error?.message}
                  />
                )}
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
