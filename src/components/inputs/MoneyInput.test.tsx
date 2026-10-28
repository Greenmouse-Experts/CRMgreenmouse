// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import MoneyInput from "./MoneyInput";

describe("MoneyInput", () => {
  it("shows grouped naira amounts and emits an unformatted number", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <MoneyInput label="Selling Price (₦)" value={0} onChange={onChange} />,
    );
    const input = screen.getByRole("textbox", { name: "Selling Price (₦)" }) as HTMLInputElement;

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "12345.67" } });
    expect(input.value).toBe("12,345.67");
    expect(onChange).toHaveBeenLastCalledWith(12345.67);

    fireEvent.blur(input);
    rerender(
      <MoneyInput label="Selling Price (₦)" value={12345.67} onChange={onChange} />,
    );
    expect(input.value).toBe("12,345.67");
  });
});
