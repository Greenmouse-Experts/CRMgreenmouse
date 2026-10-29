// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import type { TenantProfileUpdate } from "@/api/tenantApi";
import AddressInfo from "./AddressInfo";

function ProfileAddress({ initial }: { initial: TenantProfileUpdate }) {
  const form = useForm<TenantProfileUpdate>({ defaultValues: initial });
  const values = useWatch({ control: form.control });
  return (
    <FormProvider {...form}>
      <AddressInfo disabled={false} />
      <output data-testid="values">{JSON.stringify(values)}</output>
    </FormProvider>
  );
}

describe("AddressInfo", () => {
  it("restores saved names and clears dependent fields when country changes", async () => {
    render(<ProfileAddress initial={{ companyCountry: "Nigeria", companyState: "Lagos", companyCity: "Ikeja" }} />);
    const country = screen.getByRole("combobox", { name: "Country" }) as HTMLSelectElement;
    const state = screen.getByRole("combobox", { name: "State or region" }) as HTMLSelectElement;
    expect(country.value).toBe("Nigeria");
    expect(state.value).toBe("Lagos");
    await waitFor(() => expect((screen.getByRole("combobox", { name: "City" }) as HTMLSelectElement).value).toBe("Ikeja"));

    fireEvent.change(country, { target: { value: "Ghana" } });
    expect(screen.getByTestId("values").textContent).toContain('"companyCountry":"Ghana"');
    expect(screen.getByTestId("values").textContent).toContain('"companyState":""');
    expect(screen.getByTestId("values").textContent).toContain('"companyCity":""');
  });
});
