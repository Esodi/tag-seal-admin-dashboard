"use client";

import { Field, FieldLabel } from "@/components/ui/field";
import { FormSelect } from "@/components/ui/form-select";
import { useRegionDistrictOptions } from "./auction-hooks";

type Props = {
  prefix: string;
  open: boolean;
  regionId: string;
  districtId: string;
  onChange: (value: { regionId: string; districtId: string }) => void;
};

/** Region then district; choosing a region clears a district outside it. */
export function RegionDistrictFields({ prefix, open, regionId, districtId, onChange }: Props) {
  const { data, error, loading } = useRegionDistrictOptions(open);
  const districts = data.districts.filter((d) => d.parent === regionId);
  return <>
    <Field><FieldLabel htmlFor={`${prefix}-region`}>Region</FieldLabel>
      <FormSelect id={`${prefix}-region`} value={regionId} searchable disabled={loading || !!error}
        placeholder={loading ? "Loading regions…" : "Choose a region"} options={data.regions.map((r) => ({ value: r.value, label: r.label }))}
        onValueChange={(value) => onChange({ regionId: value, districtId: data.districts.some((d) => d.value === districtId && d.parent === value) ? districtId : "" })} />
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    </Field>
    <Field><FieldLabel htmlFor={`${prefix}-district`}>District</FieldLabel>
      <FormSelect id={`${prefix}-district`} value={districtId} searchable disabled={!regionId || loading}
        placeholder={regionId ? "Choose a district" : "Choose a region first"} options={districts.map((d) => ({ value: d.value, label: d.label }))}
        onValueChange={(value) => onChange({ regionId, districtId: value })} />
    </Field>
  </>;
}
