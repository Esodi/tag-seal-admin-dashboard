export const vetResources = ["vets", "requests"] as const;
export type VetResource = (typeof vetResources)[number];

export type VetDocument = { uuid: string; type: string; originalName: string; mime?: string | null; size?: number | null; updated_at?: string | null };

export type VetRecord = {
  id: number; uuid?: string | null; userId?: number | null; referenceNo?: string | null; fullName: string; clinicName?: string | null;
  phoneNumber?: string | null; email?: string | null; address?: string | null; bio?: string | null; specializations?: string[]; yearsOfExperience?: number | null;
  medicalLicenseNo?: string | null; licenseAuthority?: string | null; licenseExpiryDate?: string | null; schoolLevel?: string | null; schoolLevelId?: number | null;
  gender?: string | null; dateOfBirth?: string | null; identityCardTypeId?: number | null; identityNo?: string | null; hasLicenseDocument?: boolean;
  countryId?: number | null; regionId?: number | null; districtId?: number | null;
  country?: { name?: string | null } | null; region?: { name?: string | null } | null; district?: { name?: string | null } | null;
  serviceRadiusKm?: number | null; latitude?: number | null; longitude?: number | null;
  ratingAverage?: number | null; ratingCount?: number | null; completedRequestsCount?: number | null;
  verificationStatus: string; verificationNotes?: string | null; verifiedAt?: string | null; status: string; createdAt?: string | null;
  documents?: VetDocument[];
};

export type VetServiceBillRecord = {
  id: number;
  uuid: string;
  billNo?: string | null;
  subjectType?: string | null;
  quantity?: number | null;
  amount: string | number;
  status: string;
  paymentMethod?: string | null;
  paymentReference?: string | null;
  paidAt?: string | null;
  notes?: string | null;
  createdAt?: string | null;
};

export type VetServiceRequestRecord = {
  id: number; uuid: string; status: string; farmerUserId?: number | null; farmUuid?: string | null;
  problemCategory?: string | null; description?: string | null; urgency?: string | null;
  symptoms?: string[]; latitude?: number | null; longitude?: number | null; locationAddress?: string | null; contactPhone?: string | null;
  searchRadiusKm?: number | null; offersCount?: number | null;
  livestock?: { identificationNumber?: string | null; name?: string | null; species?: string | null; speciesName?: string | null } | null;
  animals?: Array<{ uuid?: string | null; identificationNumber?: string | null; name?: string | null; species?: string | null; speciesName?: string | null }>;
  livestockUuid?: string | null;
  livestockUuids?: string[];
  vet?: { fullName?: string | null; phoneNumber?: string | null; clinicName?: string | null } | null;
  farmer?: { name?: string | null; phone?: string | null } | null;
  timeline?: Record<string, string | null>;
  cancelReason?: string | null; treatmentSummary?: string | null; farmerRating?: number | null; farmerReview?: string | null;
  createdAt?: string | null;
  bills?: VetServiceBillRecord[];
  billingSummary?: {
    count: number;
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    latestStatus?: string | null;
  } | null;
};

/** Prefer human address; fall back to GPS so portal never looks empty when the app sent coords. */
export function requestLocationLabel(row: Pick<VetServiceRequestRecord, "locationAddress" | "latitude" | "longitude">) {
  const address = row.locationAddress?.trim();
  if (address) return address;
  return requestCoordinatesLabel(row) ?? "—";
}

/** Formatted lat, long when both coordinates are present. */
export function requestCoordinatesLabel(row: Pick<VetServiceRequestRecord, "latitude" | "longitude">) {
  if (row.latitude == null || row.longitude == null) return null;
  if (!Number.isFinite(row.latitude) || !Number.isFinite(row.longitude)) return null;
  return `${Number(row.latitude).toFixed(5)}, ${Number(row.longitude).toFixed(5)}`;
}

/** Google Maps pin URL opened at medium zoom (`z=13`) with a marker (`q`) centered at `ll`. */
export function requestMapsHref(row: Pick<VetServiceRequestRecord | VetRecord, "latitude" | "longitude">) {
  const coords = requestCoordinatesLabel(row);
  if (!coords || row.latitude == null || row.longitude == null) return null;
  const point = `${row.latitude},${row.longitude}`;
  return `https://www.google.com/maps?q=${encodeURIComponent(point)}&ll=${encodeURIComponent(point)}&z=13`;
}

export const requestCancellable = (status?: string | null) =>
  status === "pending" || status === "accepted" || status === "travelling";

export type VetAnyRecord = VetRecord | VetServiceRequestRecord;
