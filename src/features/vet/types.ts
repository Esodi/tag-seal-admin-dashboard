export const vetResources = ["vets", "requests"] as const;
export type VetResource = (typeof vetResources)[number];

export type VetDocument = { uuid: string; type: string; originalName: string; mime?: string | null; size?: number | null; updated_at?: string | null };

export type VetRecord = {
  id: number; uuid?: string | null; userId?: number | null; referenceNo?: string | null; fullName: string; clinicName?: string | null;
  phoneNumber?: string | null; email?: string | null; address?: string | null; specializations?: string[]; yearsOfExperience?: number | null;
  medicalLicenseNo?: string | null; licenseAuthority?: string | null; licenseExpiryDate?: string | null; schoolLevel?: string | null; gender?: string | null; dateOfBirth?: string | null; hasLicenseDocument?: boolean;
  region?: { name?: string | null } | null; district?: { name?: string | null } | null;
  ratingAverage?: number | null; ratingCount?: number | null; completedRequestsCount?: number | null;
  verificationStatus: string; verificationNotes?: string | null; verifiedAt?: string | null; status: string; createdAt?: string | null;
  documents?: VetDocument[];
};

export type VetServiceRequestRecord = {
  id: number; uuid: string; status: string; problemCategory?: string | null; description?: string | null; urgency?: string | null;
  symptoms?: string[]; locationAddress?: string | null; contactPhone?: string | null; offersCount?: number | null;
  livestock?: { identificationNumber?: string | null; name?: string | null; species?: string | null } | null;
  vet?: { fullName?: string | null; phoneNumber?: string | null; clinicName?: string | null } | null;
  farmer?: { name?: string | null; phone?: string | null } | null;
  timeline?: Record<string, string | null>;
  cancelReason?: string | null; treatmentSummary?: string | null; farmerRating?: number | null; farmerReview?: string | null;
};

export type VetAnyRecord = VetRecord | VetServiceRequestRecord;
