import React, { forwardRef } from "react";
import type { SelectHTMLAttributes } from "react";

interface LocalSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  // Add any specific props for your LocalSelect component here if needed
}

const LocalSelect = forwardRef<HTMLSelectElement, LocalSelectProps>(
  ({ children, className, ...props }, ref) => {
    const { label } = props;
    return (
      <div className="w-full flex-1 ">
        {label && (
          <div className="fieldset-label font-semibold">
            <span className="text-base">{label}</span>
          </div>
        )}
        <select
          ref={ref}
          className={`select flex-1 select-bordered w-full  ${className || ""}`}
          {...props}
        >
          {children}
        </select>
      </div>
    );
  },
);

LocalSelect.displayName = "LocalSelect";

export default LocalSelect;
