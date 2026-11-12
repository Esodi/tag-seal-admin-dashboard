/** Vehicle paint colours. The code is saved; people see a swatch and the name. Same codes as the app. */
export const VEHICLE_COLORS = [
  { code: "white", name: "White", hex: "#FFFFFF" },
  { code: "silver", name: "Silver", hex: "#C0C0C0" },
  { code: "gray", name: "Gray", hex: "#808080" },
  { code: "black", name: "Black", hex: "#212121" },
  { code: "red", name: "Red", hex: "#D32F2F" },
  { code: "blue", name: "Blue", hex: "#1E5AA8" },
  { code: "green", name: "Green", hex: "#2E7D32" },
  { code: "yellow", name: "Yellow", hex: "#FBC02D" },
  { code: "orange", name: "Orange", hex: "#F57C00" },
  { code: "brown", name: "Brown", hex: "#6D4C41" },
  { code: "beige", name: "Beige", hex: "#D8C8A8" },
  { code: "gold", name: "Gold", hex: "#C9A227" },
] as const;

export function findVehicleColor(code?: string | null) {
  const key = (code ?? "").trim().toLowerCase();
  return VEHICLE_COLORS.find((color) => color.code === (key === "grey" ? "gray" : key));
}

/** The colour's name, or what was typed for vehicles saved before colours had codes. */
export function vehicleColorName(code?: string | null) {
  return findVehicleColor(code)?.name ?? (code || "");
}
