export const commerceResources = ["listings", "reservations", "orders"] as const;
export type CommerceResource = (typeof commerceResources)[number];

export type MarketplaceListingRecord = {
  id: number;
  uuid: string;
  seller_user_id: number;
  farm_uuid: string;
  listing_title: string;
  listing_type: "individual" | "group_lot";
  total_asking_price: string;
  is_negotiable: boolean;
  minimum_acceptable_price?: string | null;
  currency: string;
  status: "draft" | "active" | "under_negotiation" | "reserved" | "sold" | "withdrawn" | "expired";
  share_health_records: boolean;
  approved_health_categories?: string[] | null;
  photos?: string[] | null;
  description?: string | null;
  expires_at?: string | null;
  published_at?: string | null;
  seller?: { id: number; name?: string; email?: string; username?: string };
  farm?: { id: number; uuid: string; name: string };
  items?: Array<{ id: number; uuid: string; livestock_uuid: string; allocated_asking_price: string }>;
  created_at: string;
};

export type AnimalReservationRecord = {
  id: number;
  uuid: string;
  livestock_uuid: string;
  reservation_type: "marketplace_listing" | "offer_hold" | "order_commitment";
  reference_uuid: string;
  status: "active" | "fulfilled" | "released" | "expired";
  held_by_user_id: number;
  expires_at?: string | null;
  released_at?: string | null;
  release_reason?: string | null;
  held_by?: { id: number; name?: string; email?: string; username?: string };
  livestock?: { id: number; uuid: string; identificationNumber?: string; name?: string };
  created_at: string;
};

export type PurchaseOrderRecord = {
  id: number;
  uuid: string;
  order_code: string;
  seller_user_id: number;
  buyer_user_id: number;
  origin_farm_uuid: string;
  total_amount: string;
  currency: string;
  source_type: "marketplace_direct" | "marketplace_negotiated";
  status: "pending_settlement" | "ready_for_handover" | "handed_over" | "transferred" | "cancelled" | "disputed";
  settlement_method: "cash_on_delivery" | "direct_mobile_money" | "bank_transfer" | "escrow";
  settlement_verified_at?: string | null;
  handover_verified_at?: string | null;
  ownership_transferred_at?: string | null;
  seller?: { id: number; name?: string; email?: string };
  buyer?: { id: number; name?: string; email?: string };
  origin_farm?: { id: number; uuid: string; name: string };
  items?: Array<{ id: number; uuid: string; livestock_uuid: string; agreed_price: string }>;
  created_at: string;
};

export type CommerceResponse = {
  data: Array<MarketplaceListingRecord | AnimalReservationRecord | PurchaseOrderRecord>;
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  meta?: Record<string, number>;
};

