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
      <>
        {label && (
          <div className="fieldset-label font-semibold">
            <span className="text-base">{label}</span>
          </div>
        )}
        <select
          ref={ref}
          className={`select select-bordered w-full max-w-xs ${className || ""}`}
          {...props}
        >
          {children}
        </select>
      </>
    );
  },
);

LocalSelect.displayName = "LocalSelect";

export default LocalSelect;
