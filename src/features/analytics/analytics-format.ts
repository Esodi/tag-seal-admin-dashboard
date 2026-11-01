export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-TZ", { maximumFractionDigits: 1 }).format(value);
}

export function humanize(value: string) {
  return value.replace(/([a-z])([A-Z])/g, "$1 $2").replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
