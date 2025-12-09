import React, { forwardRef, type PropsWithChildren } from "react";

const SimpleTitle = forwardRef<
  HTMLDivElement,
  PropsWithChildren<{ title?: string | Element | any }>
>(({ title = "TItle", children }, ref) => {
  return (
    <div className="flex items-center gap-2 flex-1   ">
      <div
        ref={ref}
        className="text-xl flex-1 font-bold  divider divider-start"
      >
        {title}
      </div>
      <div className="">{children}</div>
    </div>
  );
});

export default SimpleTitle;
