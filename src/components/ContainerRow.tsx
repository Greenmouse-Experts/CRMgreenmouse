import type { useSearch } from "@/stores/data";
import { Search, XIcon } from "lucide-react";
import type { PropsWithChildren } from "react";
import { useForm } from "react-hook-form";
interface ContainerRowProps extends PropsWithChildren {
  searchProps?: ReturnType<typeof useSearch>;
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
    <div className=" shadow-md rounded-b-box ring ring-current/20  lg:h-16 px-2 bg-base-100 flex  flex-col md:flex-row gap-2 items-center py-2">
      {props.showSearch && (
        <form
          className="min-w-xs join w-full  md:w-fit"
          onSubmit={form.handleSubmit((data) => {
            if (setSearch) {
              // Only call setSearch if it exists
              setSearch(data.search);
            }
          })}
        >
          <input
            {...form.register("search")}
            className="input join-item text-sm "
            placeholder="Search...."
          />
          <button className="btn btn-primary btn-square  join-item ">
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
      <div className={"flex-1 flex items-center gap-2 w-full lg:w-auto"}>
        {props.children}
      </div>
    </div>
  );
}
