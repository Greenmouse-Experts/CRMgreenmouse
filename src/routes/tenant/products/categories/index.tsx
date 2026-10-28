import { createFileRoute } from "@tanstack/react-router";
import CatalogCategoriesPage from "../-components/CatalogCategoriesPage";

export const Route = createFileRoute("/tenant/products/categories/")({
  component: () => <CatalogCategoriesPage type="product" />,
});
