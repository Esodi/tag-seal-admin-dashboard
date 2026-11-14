export const auctionResources = ["centres", "officers", "sessions"] as const;
export type AuctionResource = (typeof auctionResources)[number];

export const auctionCentreRoles = ["manager", "auctioneer", "clerk"] as const;

export type AuctionCentreRecord = {
  id: number; uuid: string; code: string; name: string; description?: string | null; address?: string | null;
  regionId?: number | null; districtId?: number | null; latitude?: number | null; longitude?: number | null;
  regionName?: string | null; districtName?: string | null; phone?: string | null; status: string;
  membersCount?: number; sessionsCount?: number; liveCount?: number; createdAt?: string | null;
};

export type AuctionCentreMemberRecord = {
  id: number; userId: number; name?: string | null; phone?: string | null; email?: string | null;
  role: string; status: string; createdAt?: string | null;
};

export type AuctionOfficerRecord = {
  id: number; uuid: string; userId?: number | null; officerNo: string; fullName: string; firstName: string;
  middleName?: string | null; lastName: string; phone?: string | null; email?: string | null; address?: string | null;
  nationalId?: string | null; licenceNo?: string | null; hasLicenceDocument?: boolean; licenceDocumentKey?: string | null; bio?: string | null; regionId?: number | null; districtId?: number | null;
  requestedCentre?: { uuid: string; code: string; name: string } | null;
  verificationStatus: string; verificationNotes?: string | null; verifiedAt?: string | null; status: string; createdAt?: string | null;
  centres?: Array<{ uuid: string | null; name: string | null; myRole?: string | null; myMembershipStatus?: string | null }>;
};

export type AuctionLotRecord = {
  uuid: string; lotNumber?: number | null; title?: string | null; status: string;
  livestock?: { identificationNumber?: string | null; name?: string | null } | null;
  startingPrice: number; currentPrice?: number | null;
};

export type AuctionSessionRecord = {
  id: number; uuid: string; title: string; description?: string | null; status: string; mode: string;
  centre?: { uuid: string; code: string; name: string } | null; host?: { name?: string | null } | null;
  officer?: { fullName?: string | null; officerNo?: string | null } | null;
  scheduledAt?: string | null; startedAt?: string | null; endedAt?: string | null; currency?: string | null;
  lotsCount?: number | null; soldCount?: number | null; grossSales?: number | null; paymentInstructions?: string | null;
  createdAt?: string | null; lots?: AuctionLotRecord[];
};

export type AuctionRecord = AuctionCentreRecord | AuctionOfficerRecord | AuctionSessionRecord;
