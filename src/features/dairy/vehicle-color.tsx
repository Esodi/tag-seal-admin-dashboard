import { findVehicleColor } from "./vehicle-colors";

export function ColorSwatch({ hex }: { hex: string }) {
  return <span aria-hidden className="inline-block size-4 shrink-0 rounded-full border border-border" style={{ backgroundColor: hex }} />;
}

export function VehicleColor({ code }: { code?: string | null }) {
  const color = findVehicleColor(code);
  if (!color) return <>{code || "—"}</>;
  return <span className="inline-flex items-center gap-2"><ColorSwatch hex={color.hex} />{color.name}</span>;
}
