import { forwardRef, useEffect, useId, useState } from "react";

interface MoneyInputProps {
  label: string;
  name?: string;
  value?: number;
  onChange: (value: number | undefined) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

const formatAmount = (value?: number) =>
  value === undefined || !Number.isFinite(value)
    ? ""
    : new Intl.NumberFormat("en-NG", {
        maximumFractionDigits: 2,
      }).format(value);

const formatDraft = (input: string) => {
  const cleaned = input.replace(/[^\d.]/g, "");
  const [whole = "", ...decimalParts] = cleaned.split(".");
  const decimal = decimalParts.join("").slice(0, 2);
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decimalParts.length ? `${grouped || "0"}.${decimal}` : grouped;
};

const MoneyInput = forwardRef<HTMLInputElement, MoneyInputProps>(
  function MoneyInput(
    {
      label,
      name,
      value,
      onChange,
      onBlur,
      placeholder = "0.00",
      error,
      required,
      className = "input input-bordered w-full mt-1",
    },
    ref,
  ) {
    const id = useId();
    const [draft, setDraft] = useState(() => formatAmount(value));
    const [focused, setFocused] = useState(false);

    useEffect(() => {
      if (!focused) setDraft(formatAmount(value));
    }, [value, focused]);

    return (
      <div>
        <label htmlFor={id} className="text-sm font-semibold text-base-content/70">
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </label>
        <input
          id={id}
          name={name}
          ref={ref}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={draft}
          placeholder={placeholder}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={className}
          onFocus={() => setFocused(true)}
          onChange={(event) => {
            const input = event.currentTarget;
            const charactersBeforeCaret = input.value
              .slice(0, input.selectionStart ?? input.value.length)
              .replaceAll(",", "").length;
            const formatted = formatDraft(input.value);
            setDraft(formatted);
            onChange(
              formatted ? Number(formatted.replaceAll(",", "")) : undefined,
            );
            if (typeof requestAnimationFrame === "function") {
              requestAnimationFrame(() => {
                if (document.activeElement !== input) return;
                let position = 0;
                let seen = 0;
                while (position < formatted.length && seen < charactersBeforeCaret) {
                  if (formatted[position] !== ",") seen++;
                  position++;
                }
                input.setSelectionRange(position, position);
              });
            }
          }}
          onBlur={() => {
            setFocused(false);
            setDraft(formatAmount(value));
            onBlur?.();
          }}
        />
        {error && (
          <span id={`${id}-error`} className="mt-1 block text-xs text-error">
            {error}
          </span>
        )}
      </div>
    );
  },
);

export default MoneyInput;
