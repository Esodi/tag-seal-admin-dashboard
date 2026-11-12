export type ApprovalFarmer = {
  farmer_number: string;
  first_name: string;
  middle_name: string | null;
  surname: string;
  gender: string;
  date_of_birth: string | null;
  farmer_type: string;
  status: string;
};

export type CooperativeApplication = {
  uuid: string;
  amcos_uuid: string;
  amcos_name: string;
  applicant_name: string | null;
  applicant_gender: string | null;
  applicant_date_of_birth: string | null;
  phone: string | null;
  display_name: string | null;
  username: string;
  created_at: string | null;
  farmer_details: ApprovalFarmer | null;
};

export type ApprovalCentre = { uuid: string; name: string; amcos_uuid: string };
export type ApprovalsResponse = { data: CooperativeApplication[]; centres: ApprovalCentre[] };

export function applicantName(item: CooperativeApplication) {
  return item.applicant_name || item.display_name || item.username;
}

export function applicationDate(value: string | null) {
  if (!value) return "—";
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00`) : new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-TZ", { day: "numeric", month: "short", year: "numeric" });
}
