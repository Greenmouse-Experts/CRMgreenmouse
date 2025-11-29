import type { useSearch } from "@/stores/data";
import { Search, XIcon } from "lucide-react";
import { useForm } from "react-hook-form";
interface ContainerRowProps {
  searchProps?: ReturnType<typeof useSearch>;
  actions?: any;
  showSearch?: boolean;
}

export default function ContainerRow(props: ContainerRowProps) {
  const { search, setSearch, clear } = props.searchProps || {}; // Provide a default empty object
  const form = useForm({
    defaultValues: {
      search: search || "", // Initialize with existing search value if available
    },
  });
  return (
    <div className=" h-16 px-2 bg-base-100 flex gap-2 items-center py-2">
      {props.showSearch && (
        <form
          className="join"
          onSubmit={form.handleSubmit((data) => {
            if (setSearch) {
              // Only call setSearch if it exists
              setSearch(data.search);
            }
          })}
        >
          <input
            {...form.register("search")}
            className="input join-item input-sm text-sm"
            placeholder="Search...."
          />
          <button className="btn btn-accent btn-soft btn-square btn-sm join-item ">
            <Search />
          </button>
          {search && search.length > 0 && (
            <button
              className="btn btn-error btn-soft btn-square join-item "
              onClick={() => {
                if (clear) {
                  clear();
                }
                form.setValue("search", "");
              }}
            >
              <XIcon />
            </button>
          )}
        </form>
      )}
      <div className={""}>{props.actions}</div>
    </div>
  );
}
