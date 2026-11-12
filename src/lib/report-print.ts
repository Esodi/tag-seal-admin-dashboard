/** Consistent Tanzania dates for report screens and printed documents. */
export function reportDate(value?: string | null, time = false) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const showTime = time && !/^\d{4}-\d{2}-\d{2}$/.test(value);
  // ICU versions differ in punctuation (", " vs " at "). Compose the text
  // explicitly so server rendering and browser hydration always agree.
  const parts = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit", month: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
    hourCycle: "h23", numberingSystem: "latn", calendar: "gregory", timeZone: "Africa/Dar_es_Salaam",
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find(value => value.type === type)!.value;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const day = `${part("day").padStart(2, "0")} ${months[Number(part("month")) - 1]} ${part("year")}`;
  return day + (showTime ? `, ${part("hour").padStart(2, "0")}:${part("minute").padStart(2, "0")} EAT` : "");
}
export const escapeReportText = (value: unknown) => String(value ?? "—").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
export type PrintSection = { title: string; columns: string[]; rows: unknown[][] };
export function reportHtml(title: string, description: string, sections: PrintSection[]) {
  const escape = escapeReportText;
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escape(title)}</title><style>
  @page{size:A4 landscape;margin:14mm}*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#173c2d;font-size:10px;margin:0}header{border-bottom:2px solid #24543d;padding-bottom:14px;margin-bottom:20px}h1{font-size:24px;margin:6px 0}h2{font-size:15px;margin:22px 0 10px}p{line-height:1.6;color:#596a60;white-space:pre-line}table{width:100%;border-collapse:collapse;table-layout:fixed;margin-bottom:18px}thead{display:table-header-group}tr{break-inside:avoid}th,td{text-align:left;border-bottom:1px solid #dce4dd;padding:8px 6px;overflow-wrap:anywhere;vertical-align:top}th{background:#edf3ee;font-size:9px}td{color:#263d31}footer{border-top:1px solid #dce4dd;padding-top:10px;color:#596a60}button{margin:12px 0;padding:8px 16px}@media print{button{display:none}h2{break-after:avoid}} </style></head><body><button onclick="window.print()">Print / Save PDF</button><header><strong>TAG &amp; SEAL</strong><h1>${escape(title)}</h1><p>${escape(description)}</p><p>Generated ${escape(reportDate(new Date().toISOString(), true))}</p></header>${sections.map(s => `<section><h2>${escape(s.title)}</h2><table><thead><tr>${s.columns.map(c => `<th>${escape(c)}</th>`).join("")}</tr></thead><tbody>${s.rows.length ? s.rows.map(row => `<tr>${row.map(cell => `<td>${escape(cell)}</td>`).join("")}</tr>`).join("") : `<tr><td colspan="${s.columns.length}">No records in this selection.</td></tr>`}</tbody></table></section>`).join("")}<footer>Tag &amp; Seal • All times shown in East Africa Time (UTC+03:00).</footer></body></html>`;
}
export function printReport(title: string, description: string, sections: PrintSection[]) {
  const popup = window.open("", "_blank", "width=1100,height=800");
  if (!popup) { window.alert("Please allow pop-ups to open the print preview."); return; }
  popup.onload = () => { popup.focus(); popup.print(); };
  popup.document.write(reportHtml(title, description, sections));
  popup.document.close();
}
