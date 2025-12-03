import type { PropsWithChildren } from "react";

export default function SummaryGrid(props: PropsWithChildren) {
  return (
    <div className="p-2 gap-2 grid grid-cols-[repeat(auto-fit,minmax(120px,auto))]">
      {props.children}
    </div>
  );
}
