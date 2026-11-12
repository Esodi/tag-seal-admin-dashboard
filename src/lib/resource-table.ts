/** Keep the creation timestamp immediately before the separately rendered actions column. */
export function withCreatedColumn<T extends { key: string; label: string }>(
  columns: readonly T[],
  createdColumn: T,
): T[] {
  return [
    ...columns.filter((column) => column.key !== createdColumn.key),
    { ...createdColumn, label: "Created at" },
  ];
}

export function formatRecordDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit", month: "short", year: "numeric", timeZone: "Africa/Dar_es_Salaam",
  }).format(date);
}
