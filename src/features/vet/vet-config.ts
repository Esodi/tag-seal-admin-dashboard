import type { RegistryConfig } from "@/features/registry/types";
import type { VetResource } from "./types";

export const vetEndpoint = (resource: VetResource) => `/api/admin/vet/${resource}`;

export const vetConfig = {
  vets: {
    title: "Veterinarians", singular: "vet",
    description: "Vets who applied from the app or were added here. Approve them before farmers can request their services.",
    searchPlaceholder: "Search name, phone, email or licence number…",
    emptyTitle: "No veterinarians yet", emptyDescription: "Vets who apply from the app, or that you add here, will appear here.",
    statuses: ["pending", "verified", "rejected"],
    stats: [
      { key: "total_vets", label: "Total vets", note: "All vet profiles" },
      { key: "pending_vets", label: "Awaiting approval", note: "Applications to review" },
      { key: "verified_vets", label: "Approved vets", note: "Visible to farmers" },
      { key: "rejected_vets", label: "Rejected", note: "Applications not approved" },
    ],
  },
  requests: {
    title: "Service Requests", singular: "request",
    description: "Visits farmers requested from vets, from the first request to treatment.",
    searchPlaceholder: "Search problem, description, location or phone…",
    emptyTitle: "No service requests yet", emptyDescription: "Requests that farmers send to vets from the app will appear here.",
    statuses: ["pending", "accepted", "travelling", "arrived", "in_progress", "completed", "cancelled", "expired"],
    stats: [
      { key: "total_requests", label: "Total requests", note: "All service requests" },
      { key: "open_requests", label: "In progress", note: "Accepted and not finished" },
      { key: "completed_requests", label: "Completed", note: "Visits finished" },
      { key: "cancelled_requests", label: "Cancelled or expired", note: "Not served" },
    ],
  },
} satisfies Record<VetResource, RegistryConfig>;
