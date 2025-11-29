import { Eye } from "lucide-react";
import React, { forwardRef, useState } from "react";
import type { UseFormReturn } from "react-hook-form";

interface SimpleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  _form?: Partial<UseFormReturn<any>>;
}

const SimpleInput = forwardRef<HTMLInputElement, SimpleInputProps>(
  ({ label, icon, _form, ...props }, ref) => {
    const [visibility, setVisiblity] = useState(props.type || "text");
    const fieldError = _form?.formState?.errors?.[props.name as string];
    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="label">
            <span className="label-text">{label}</span>
          </label>
        )}
        <div
          className={`input input-bordered flex items-center gap-2 w-full ${fieldError ? "input-error" : ""}`}
        >
          {icon}
          <input className="grow" {...props} ref={ref} type={visibility} />
          {props.type === "password" && (
            <button
              type="button"
              onClick={() =>
                setVisiblity(visibility === "password" ? "text" : "password")
              }
              className="btn btn-sm btn-square btn-ghost"
            >
              <Eye size={16} />
            </button>
          )}
        </div>
        {/*<div>{JSON.stringify(fieldError?.message)}</div>*/}
        {fieldError?.message && (
          <label className="fieldset-label">
            <span className="label-text-alt text-xs text-error">
              {/*//@ts-ignore*/}
              {fieldError.message}
            </span>
          </label>
        )}
      </div>
    );
  },
);

SimpleInput.displayName = "SimpleInput";

export default SimpleInput;
