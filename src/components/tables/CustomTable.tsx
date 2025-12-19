import { nanoid } from "nanoid";
import { useState } from "react";
import PopUp, { type Actions } from "./pop-up";
// import CaryBinApi from "../services/CarybinBaseUrl";
// import { Link } from "react-router-dom";

export type columnType<T = any> = {
  key: string;
  label: string;
  render?: (value: any, item: T) => any;
};

// type  Actions extends  = {
//   key: string;
//   label: string;
//   // action: (item: any) => any;
// };
interface CustomTableProps {
  data?: any[];
  columns?: columnType[];
  actions?: Actions[];
  user?: any;
  ring?: boolean;
}

export default function CustomTable(props: CustomTableProps) {
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const { ring = true } = props;
  return (
    <div
      className={
        "bg-base-100 shadow-xl  ring ring-current/20 " +
        (ring ? " rounded-box " : "rounded-b-box")
      }
    >
      <div className=" relative overflow-x-scroll">
        <table className="table   w-full text-md">
          <thead className="">
            <tr className=" rounded-2xl bg-base-200/50">
              {props.columns &&
                props.columns.map((column, idx) => (
                  <th
                    key={idx}
                    className="capitalize text-left   text-md font-semibold text-base-content/70 "
                  >
                    {column.label}
                  </th>
                ))}
              {!props.columns?.find((item) => item.key == "action") &&
                props.actions &&
                props.actions.length > 0 && (
                  <>
                    <th className="font-semibold text-md text-base-content/70 ">
                      Action
                    </th>
                  </>
                )}
            </tr>
          </thead>
          <tbody>
            {props.data &&
              props.data.map((item, rowIdx) => {
                const popoverId = `popover-${nanoid()}`;
                const anchorName = `--anchor-${nanoid()}`;
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
                    {!props.columns?.find(
                      (item, index) => item.key == "action",
                    ) &&
                      props.actions &&
                      props.actions.length > 0 && (
                        <>
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
                        </>
                      )}
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
