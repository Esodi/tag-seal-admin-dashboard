import { commerceLabel } from "@/features/commerce/commerce-config";
import type { RegistryConfig } from "@/features/registry/types";
import { auctionCentreRoles, type AuctionResource } from "./types";

export const auctionEndpoint = (resource: AuctionResource) => `/api/admin/auction/${resource}`;

export const auctionConfig = {
  centres: {
    title: "Auction Centres", singular: "centre",
    description: "Livestock markets where auctions are held, and the people who run them.",
    searchPlaceholder: "Search name, code, address or phone…",
    emptyTitle: "No auction centres yet", emptyDescription: "Add a livestock market so officers can be assigned and auctions scheduled there.",
    statuses: ["active", "inactive"],
    stats: [
      { key: "total_centres", label: "Total centres", note: "All registered markets" },
      { key: "active_centres", label: "Active centres", note: "Open for auctions" },
      { key: "inactive_centres", label: "Inactive centres", note: "Closed or deactivated" },
    ],
  },
  officers: {
    title: "Auction Officers", singular: "officer",
    description: "Auctioneers who applied from the app or were added here. Approve them before they can conduct auctions.",
    searchPlaceholder: "Search name, officer number, phone or email…",
    emptyTitle: "No auction officers yet", emptyDescription: "Officers who apply from the app, or that you add here, will appear here.",
    statuses: ["pending", "verified", "rejected"],
    stats: [
      { key: "total_officers", label: "Total officers", note: "All officer profiles" },
      { key: "pending_officers", label: "Awaiting approval", note: "Applications to review" },
      { key: "verified_officers", label: "Approved officers", note: "Allowed to conduct auctions" },
      { key: "rejected_officers", label: "Rejected", note: "Applications not approved" },
    ],
  },
  sessions: {
    title: "Auction Sessions", singular: "session",
    description: "Scheduled, live and past auctions with their lots and results.",
    searchPlaceholder: "Search auction title…",
    emptyTitle: "No auctions yet", emptyDescription: "Auctions that officers schedule will appear here.",
    statuses: ["scheduled", "live", "ended", "cancelled"],
    stats: [
      { key: "total_sessions", label: "Total auctions", note: "All auction sessions" },
      { key: "scheduled_sessions", label: "Scheduled", note: "Waiting to start" },
      { key: "live_sessions", label: "Live now", note: "Bidding in progress" },
      { key: "ended_sessions", label: "Ended", note: "Finished auctions" },
    ],
  },
  intakes: {
    title: "Linked Livestock", singular: "intake",
    description: "Livestock sent by farmers to auction centres, intake approvals, and return-to-farm requests.",
    searchPlaceholder: "Search animal, tag, farmer, farm or centre…",
    emptyTitle: "No linked livestock yet", emptyDescription: "Animals farmers send to auction centres will appear here.",
    statuses: ["pending", "approved", "return_requested", "rejected", "returned", "withdrawn"],
    stats: [
      { key: "total_intakes", label: "Total linked", note: "All centre livestock submissions" },
      { key: "pending_intakes", label: "Pending approval", note: "Waiting for centre review" },
      { key: "approved_intakes", label: "Approved", note: "Ready for auction listing" },
      { key: "return_requested_intakes", label: "Return requests", note: "Farmers requesting return" },
    ],
  },
  bids: {
    title: "Biddings", singular: "bid",
    description: "Every bid placed across live and scheduled auction lots.",
    searchPlaceholder: "Search bidder, bidder #, auction or lot…",
    emptyTitle: "No bids recorded yet", emptyDescription: "Bids placed during auction sessions will appear here.",
    statuses: ["accepted", "rejected"],
    stats: [
      { key: "total_bids", label: "Total bids", note: "All placed bids" },
      { key: "accepted_bids", label: "Accepted bids", note: "Valid bids recorded" },
      { key: "rejected_bids", label: "Rejected bids", note: "Invalid or rejected bids" },
      { key: "highest_bid", label: "Highest bid (TZS)", note: "Top accepted bid" },
    ],
  },
  sales: {
    title: "Purchases & Sales", singular: "sale",
    description: "Completed auction purchases, physical sales, receipts, and payment settlement status.",
    searchPlaceholder: "Search receipt #, buyer, auction or reference…",
    emptyTitle: "No auction purchases yet", emptyDescription: "Sold lots and recorded physical sales will appear here.",
    statuses: ["pending_payment", "paid", "defaulted", "cancelled"],
    stats: [
      { key: "total_sales", label: "Total sales", note: "All recorded purchases" },
      { key: "pending_payment_sales", label: "Pending payment", note: "Awaiting buyer settlement" },
      { key: "paid_sales", label: "Paid", note: "Confirmed payments" },
      { key: "gross_paid_amount", label: "Gross paid (TZS)", note: "Total settled revenue" },
    ],
  },
} satisfies Record<AuctionResource, RegistryConfig>;

export const auctionAddLabel: Partial<Record<AuctionResource, string>> = { centres: "Add centre", officers: "Add officer" };

export const roleOptions = auctionCentreRoles.map((value) => ({ value, label: commerceLabel(value) }));
