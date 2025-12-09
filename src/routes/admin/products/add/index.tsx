import SimpleTitle from "@/components/SimpleTitle";
import { useImage } from "@/helpers/images";
import { createFileRoute } from "@tanstack/react-router";
import ImageUpload from "../../-components/images/ImageUpload";

export const Route = createFileRoute("/admin/products/add/")({
  component: RouteComponent,
});

function RouteComponent() {
  const props = useImage({});
  return (
    <div>
      <SimpleTitle title={"Add Product"} />
      <section className="p-4 flex flex-col">
        <div className="max-w-xs mx-auto">
          <ImageUpload {...props} />
        </div>
      </section>
    </div>
  );
}
