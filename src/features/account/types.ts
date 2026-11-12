export type AccountProfile = {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  phoneReadOnly: boolean;
  role: string;
  platformRole: "admin" | "superAdmin";
  status: string;
  permissions: string[];
  createdAt: string | null;
};

export type ProfileValues = Pick<AccountProfile, "firstName" | "lastName" | "email" | "phone">;
export type DeletionCheck = { canDelete: boolean; code?: string; message?: string };

export function profileValues(profile: AccountProfile): ProfileValues {
  return { firstName: profile.firstName, lastName: profile.lastName, email: profile.email, phone: profile.phone };
}

export function validateProfile(values: ProfileValues): Partial<Record<keyof ProfileValues, string>> {
  const errors: Partial<Record<keyof ProfileValues, string>> = {};
  if (!values.firstName.trim()) errors.firstName = "First name is required.";
  if (!values.lastName.trim()) errors.lastName = "Last name is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = "Enter a valid email address.";
  if (!/^\+?[\d\s().-]+$/.test(values.phone.trim()) || values.phone.replace(/\D/g, "").length < 8 || values.phone.replace(/\D/g, "").length > 15) errors.phone = "Enter a valid phone number, including the country code.";
  return errors;
}
