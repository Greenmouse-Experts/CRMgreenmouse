import { useState } from "react";
import PopUp, { type Actions } from "./pop-up";

export type columnType<T = any> = {
  key: string;
  label: string;
  render?: (value: any, item: T) => any;
};

interface CustomTableProps {
  data?: any[];
  columns?: columnType[];
  actions?: Actions[];
  user?: any;
  ring?: boolean;
}

export default function CustomTable(props: CustomTableProps) {
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { ring = true } = props;

  return (
    <div
      className={
        "bg-base-100 shadow-xl ring ring-current/20 " +
        (ring ? " rounded-box " : "rounded-b-box")
      }
    >
      <div className="relative overflow-x-scroll">
        <table className="table w-full text-md">
          <thead>
            <tr className="rounded-2xl bg-base-200/50">
              {props.columns &&
                props.columns.map((column, idx) => (
                  <th
                    key={idx}
                    className="capitalize text-left text-md font-semibold text-base-content/70"
                  >
                    {column.label}
                  </th>
                ))}
              {!props.columns?.find((item) => item.key === "action") &&
                props.actions &&
                props.actions.length > 0 && (
                  <th className="font-semibold text-md text-base-content/70">
                    Action
                  </th>
                )}
            </tr>
          </thead>
          <tbody>
            {props.data &&
              props.data.map((item, rowIdx) => {
                return (
                  <tr
                    key={rowIdx}
                    className="hover:bg-base-300 border-base-300"
                  >
                    {props.columns?.map((col, colIdx) => (
                      <td
                        className="py-3 px-4 text-ellipsis overflow-hidden max-w-xs text-base-content"
                        key={colIdx}
                      >
                        {col.render
                          ? col.render(item[col.key], item)
                          : item[col.key]}
                      </td>
                    ))}
                    {!props.columns?.find((item) => item.key === "action") &&
                      props.actions &&
                      props.actions.length > 0 && (
                        <td>
                          <PopUp
                            itemIndex={rowIdx}
                            setIndex={setSelectedItem}
                            currentIndex={selectedItem}
                            key={rowIdx + "menu"}
                            actions={props?.actions || []}
                            item={item}
                          />
                        </td>
                      )}
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* Dummy Paginator */}
      <div className="flex items-center justify-between px-4 py-3 bg-base-200/30 border-t border-base-300">
        <div className="text-sm text-base-content/60">
          Showing <span className="font-medium">1</span> to{" "}
          <span className="font-medium">{props.data?.length || 0}</span> of{" "}
          <span className="font-medium">{props.data?.length || 0}</span> results
        </div>
        <div className="join">
          <button
            className="join-item btn btn-sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            «
          </button>
          <button className="join-item btn btn-sm btn-active">
            Page {currentPage}
          </button>
          <button
            className="join-item btn btn-sm"
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            »
          </button>
        </div>
      </div>
    </div>
  );
}
