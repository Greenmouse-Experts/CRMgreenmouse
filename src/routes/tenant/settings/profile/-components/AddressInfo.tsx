import { useEffect, useMemo, useState } from "react";
import { Country, State, type ICity } from "country-state-city";
import { useFormContext, useWatch } from "react-hook-form";
import type { TenantProfileUpdate } from "@/api/tenantApi";

const countries = Country.getAllCountries();

export default function AddressInfo({ disabled }: { disabled: boolean }) {
  const { control, register, setValue } = useFormContext<TenantProfileUpdate>();
  const countryName = useWatch({ control, name: "companyCountry" }) ?? "";
  const stateName = useWatch({ control, name: "companyState" }) ?? "";
  const cityName = useWatch({ control, name: "companyCity" }) ?? "";

  const country = countries.find(
    (item) =>
      item.name.toLowerCase() === countryName.toLowerCase() ||
      item.isoCode.toLowerCase() === countryName.toLowerCase(),
  );
  const states = useMemo(
    () => (country ? State.getStatesOfCountry(country.isoCode) : []),
    [country?.isoCode],
  );
  const state = states.find(
    (item) =>
      item.name.toLowerCase() === stateName.toLowerCase() ||
      item.isoCode.toLowerCase() === stateName.toLowerCase(),
  );
  const [cities, setCities] = useState<ICity[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(false);

  useEffect(() => {
    setCities([]);
    if (!country || (states.length > 0 && !state)) {
      setCitiesLoading(false);
      return;
    }
    let active = true;
    setCitiesLoading(true);
    import("country-state-city").then(({ City }) => {
      if (!active) return;
      setCities(state
        ? City.getCitiesOfState(country.isoCode, state.isoCode)
        : (City.getCitiesOfCountry(country.isoCode) ?? []));
    }).catch(() => {
      if (active) setCities([]);
    }).finally(() => {
      if (active) setCitiesLoading(false);
    });
    return () => { active = false; };
  }, [country?.isoCode, state?.isoCode, states.length]);

  return (
    <section
      className="space-y-5 rounded-box bg-base-100 p-5 shadow-sm"
      aria-labelledby="profile-address-title"
    >
      <div>
        <h2 id="profile-address-title" className="text-lg font-semibold">
          Company address
        </h2>
        <p className="text-sm text-base-content/70">
          Keep your business location current.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-1.5 md:col-span-2">
          <span className="text-sm font-medium">Street address</span>
          <input
            className="input input-bordered w-full"
            autoComplete="street-address"
            disabled={disabled}
            {...register("companyAddress")}
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Country</span>
          <select
            className="select select-bordered w-full"
            autoComplete="country-name"
            disabled={disabled}
            {...register("companyCountry", {
              onChange: () => {
                setValue("companyState", "", { shouldDirty: true });
                setValue("companyCity", "", { shouldDirty: true });
              },
            })}
          >
            <option value="">Select a country</option>
            {countryName && !country && <option value={countryName}>{countryName}</option>}
            {countries.map((item) => (
              <option key={item.isoCode} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">State or region</span>
          {states.length > 0 ? (
            <select
              className="select select-bordered w-full"
              autoComplete="address-level1"
              disabled={disabled || !countryName}
              {...register("companyState", {
                onChange: () =>
                  setValue("companyCity", "", { shouldDirty: true }),
              })}
            >
              <option value="">Select a state or region</option>
              {stateName && !state && <option value={stateName}>{stateName}</option>}
              {states.map((item) => (
                <option key={item.isoCode} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              className="input input-bordered w-full"
              autoComplete="address-level1"
              placeholder={countryName ? "Enter state or region" : "Select a country first"}
              disabled={disabled || !countryName}
              {...register("companyState")}
            />
          )}
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">City</span>
          {citiesLoading || cities.length > 0 ? (
            <select
              className="select select-bordered w-full"
              autoComplete="address-level2"
              disabled={disabled || citiesLoading}
              {...register("companyCity")}
            >
              <option value="">{citiesLoading ? "Loading cities..." : "Select a city"}</option>
              {cityName && !cities.some((item) => item.name === cityName) && (
                <option value={cityName}>{cityName}</option>
              )}
              {cities.map((item, index) => (
                <option key={`${item.name}-${index}`} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              className="input input-bordered w-full"
              autoComplete="address-level2"
              placeholder={countryName ? "Enter city" : "Select a country first"}
              disabled={disabled || !countryName}
              {...register("companyCity")}
            />
          )}
        </label>
      </div>
    </section>
  );
}
