import React, { forwardRef, type PropsWithChildren } from "react";

const SimpleTitle = forwardRef<
  HTMLDivElement,
  PropsWithChildren<{ title?: string | Element | any; backBtn?: boolean }>
>(({ title = "Title", children, backBtn = true }, ref) => {
  return (
    <>
      {backBtn && (
        <button className="btn btn-accent from-accent bg-linear-30 to-primary/10">
          Go Back
        </button>
      )}
      <div className="flex items-center gap-2 flex-1    ">
        <div
          ref={ref}
          className="text-xl flex-1 font-bold  divider divider-start"
        >
          {title}
        </div>
        <div className="">{children}</div>
      </div>
    </>
  );
});

export default SimpleTitle;
