import type { CommercePerson, CommerceRecord, CommerceResource, MarketplaceListingRecord, PurchaseOrderRecord } from "./types";

export const commerceConfig = {
  listings: {
    title: "Marketplace Listings", singular: "listing",
    description: "Review livestock listings, sellers, asking prices and availability.",
    searchPlaceholder: "Search title, reference, farm or seller username…",
    emptyTitle: "No listings yet", emptyDescription: "Livestock listings published by sellers will appear here.",
    statuses: ["draft", "active", "under_negotiation", "reserved", "sold", "withdrawn", "expired"],
    stats: [
      { key: "total_listings", label: "Total listings", note: "All marketplace listings" },
      { key: "active_listings", label: "Active listings", note: "Currently listed for sale" },
      { key: "sold_listings", label: "Sold listings", note: "Listings marked as sold" },
    ],
  },
  reservations: {
    title: "Commercial Holds", singular: "hold",
    description: "Track animal reservations, who holds them and when they expire.",
    searchPlaceholder: "Search animal, tag, reference or holder username…",
    emptyTitle: "No commercial holds yet", emptyDescription: "Reservations created during livestock sales will appear here.",
    statuses: ["active", "fulfilled", "released", "expired"],
    stats: [
      { key: "total_reservations", label: "Total holds", note: "All recorded reservations" },
      { key: "active_reservations", label: "Active holds", note: "Reservations currently marked active" },
      { key: "fulfilled_reservations", label: "Fulfilled holds", note: "Reservations completed by a sale" },
    ],
  },
  orders: {
    title: "Purchase Orders", singular: "order",
    description: "Review buyers, sellers, payment settlement and livestock handover.",
    searchPlaceholder: "Search order code, reference or account username…",
    emptyTitle: "No purchase orders yet", emptyDescription: "Purchase orders will appear here when buyers complete checkout.",
    statuses: ["pending_settlement", "ready_for_handover", "handed_over", "transferred", "cancelled", "disputed"],
    stats: [
      { key: "total_orders", label: "Total orders", note: "All purchase orders" },
      { key: "pending_orders", label: "Awaiting settlement", note: "Payment verification still pending" },
      { key: "transferred_orders", label: "Ownership transferred", note: "Orders with a completed transfer" },
    ],
  },
} satisfies Record<CommerceResource, { title: string; singular: string; description: string; searchPlaceholder: string; emptyTitle: string; emptyDescription: string; statuses: string[]; stats: Array<{ key: string; label: string; note: string }> }>;

export const commerceAddLabel = { listings: "Add listing", reservations: "Add hold", orders: "Add order" } as const;
export const isListing = (record: CommerceRecord): record is MarketplaceListingRecord => "listing_title" in record;
export const isOrder = (record: CommerceRecord): record is PurchaseOrderRecord => "order_code" in record;
export const personName = (person?: CommercePerson) => person?.name?.trim() || person?.username || person?.email || "—";
export const commerceLabel = (value?: string | null) => value ? value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) : "—";
export const recordTitle = (record: CommerceRecord) => isListing(record) ? record.listing_title : isOrder(record) ? record.order_code : record.livestock?.name || record.livestock?.identificationNumber || "Animal reservation";

export function commerceMoney(value?: string | number | null, currency = "TZS") {
  if (value === null || value === undefined || value === "" || !Number.isFinite(Number(value))) return "—";
  return `${currency || "TZS"} ${Number(value).toLocaleString("en-TZ", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function commerceDateTime(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Dar_es_Salaam" }).format(date);
}

/** Spreadsheet-safe CSV values, including seller-provided titles and account names. */
export function commerceCsv(rows: string[][]) {
  return "\uFEFF" + rows.map((row) => row.map((value) => {
    const safe = /^[\s]*[=+@-]/.test(value) ? `'${value}` : value;
    return `"${safe.replace(/"/g, '""')}"`;
  }).join(",")).join("\r\n");
}
