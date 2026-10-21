import React, { forwardRef } from "react";
import { PhoneInput, type CountryIso2 } from "react-international-phone";
import "react-international-phone/style.css";
import { useFormContext } from "react-hook-form";

export interface SimplePhoneInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "size"> {
  label?: string;
  icon?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  defaultCountry?: CountryIso2 | string;
  disableDialCodePrefill?: boolean;
  onChange?: (value: any, rawValue?: string) => void;
  error?: string | { message?: string };
}

const SimplePhoneInput = forwardRef<HTMLInputElement, SimplePhoneInputProps>(
  (
    {
      label,
      icon,
      size = "md",
      defaultCountry = "ng",
      disableDialCodePrefill = true,
      name,
      value,
      defaultValue,
      onChange,
      placeholder = "Enter phone number",
      disabled,
      className,
      error: propError,
      ...props
    },
    ref,
  ) => {
    let formState: any = null;
    let formContext: any = null;
    try {
      formContext = useFormContext();
      formState = formContext?.formState;
    } catch {
      formContext = null;
      formState = null;
    }

    const formError = name && formState ? formState.errors?.[name] : undefined;
    const error = propError || formError;
    const errorMessage =
      typeof error === "string"
        ? error
        : error && typeof error === "object" && "message" in error
          ? error.message
          : undefined;

    const formValue =
      name && formContext?.watch ? formContext.watch(name) : undefined;
    const currentValue =
      value !== undefined
        ? (value ?? "")
        : formValue !== undefined
          ? (formValue ?? "")
          : ((defaultValue as string) ?? "");

    const handlePhoneChange = (newPhone: string) => {
      // Normalize empty/spaces
      const finalValue = newPhone.trim();

      if (name && formContext?.setValue) {
        formContext.setValue(name, finalValue, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        });
      }

      if (onChange) {
        const hybrid = new String(finalValue) as any;
        hybrid.target = { name: name || "", value: finalValue };
        hybrid.currentTarget = { name: name || "", value: finalValue };
        hybrid.type = "change";
        hybrid.valueOf = () => finalValue;
        hybrid.toString = () => finalValue;

        onChange(hybrid, finalValue);
      }
    };

    return (
      <div className={`w-full space-y-2 ${className || ""}`}>
        {label && (
          <div className="fieldset-label font-semibold">
            <span className="text-sm">{label}</span>
          </div>
        )}

        <div
          className={`input ${
            size === "sm"
              ? "input-sm text-xs"
              : size === "lg"
                ? "input-lg text-base"
                : "input-md text-sm"
          } input-bordered flex items-center gap-2 w-full simple-phone-input-root ${
            error ? "input-error" : ""
          } ${disabled ? "opacity-60 cursor-not-allowed bg-base-200" : ""}`}
        >
          {icon}

          <PhoneInput
            ref={ref as any}
            name={name}
            disabled={disabled}
            defaultCountry={defaultCountry as CountryIso2}
            disableDialCodePrefill={disableDialCodePrefill}
            value={currentValue}
            onChange={handlePhoneChange}
            placeholder={placeholder}
            inputProps={{
              id: props.id,
              name,
              autoComplete: props.autoComplete || "tel",
              required: props.required,
              onBlur: props.onBlur,
            }}
            className="flex items-center gap-1.5 grow w-full bg-transparent border-none p-0 m-0 shadow-none h-full min-w-0"
            inputClassName="grow bg-transparent border-none outline-none p-0 m-0 text-inherit w-full placeholder:text-base-content/40 focus:outline-none focus:ring-0 h-full"
            countrySelectorStyleProps={{
              buttonClassName:
                "bg-transparent border-none p-0 m-0 shadow-none hover:bg-transparent focus:outline-none flex items-center h-full cursor-pointer pr-1 shrink-0",
              dropdownStyleProps: {
                className:
                  "z-50 bg-base-100 text-base-content rounded-box border border-base-300 shadow-xl max-h-60 overflow-y-auto text-sm",
              },
            }}
          />
        </div>

        {errorMessage && (
          <p className="text-error text-sm mt-1">{errorMessage}</p>
        )}
      </div>
    );
  },
);

SimplePhoneInput.displayName = "SimplePhoneInput";
export default SimplePhoneInput;
export { SimplePhoneInput };
