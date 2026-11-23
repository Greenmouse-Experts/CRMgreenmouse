import apiClient, { type ApiResponse } from "@/client/api";
import { useQuery } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";

interface SimpleSelect<T> extends PropsWithChildren {
  route: string;
  value: any;
  onChange: (value: string) => void;
  label?: string;
  render: (item: T, index: number) => React.ReactNode;
  limit?: number;
}

export default function SimpleSelect<T>(props: SimpleSelect<T>) {
  const query = useQuery<ApiResponse>({
    queryKey: ["select", props.route],
    queryFn: async () => {
      const response = await apiClient.get<any>(props.route, {
        params: { limit: props.limit && props.limit },
      });
      return response.data;
    },
  });

  const label = props.label;

  if (query.isLoading)
    return (
      <div className="w-full">
        {label && <label className="mb-2 fieldset-label block">{label}</label>}
        <select disabled className="select w-full" value="">
          <option value="">Loading</option>
        </select>
      </div>
    );

  if (query.isError)
    return (
      <div className="w-full">
        {label && <label className="mb-2 fieldset-label block">{label}</label>}
        <select disabled className="select w-full" value="">
          <option value="">Error loading options</option>
        </select>
      </div>
    );

  // Backend envelopes vary: bare array, { payload }, or { data }.
  const raw = query.data as any;
  const items: T[] = Array.isArray(raw)
    ? raw
    : (raw?.payload ?? raw?.data ?? []);

  return (
    <div className="w-full">
      {label && <label className="mb-2 fieldset-label block">{label}</label>}
      <select
        value={props.value ?? ""}
        onChange={(e) => props.onChange(e.target.value)}
        className="select w-full"
      >
        {items.map((item, idx) => props.render(item, idx))}
      </select>
    </div>
  );
}
