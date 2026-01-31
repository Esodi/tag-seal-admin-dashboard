import { BaseEntity } from './location';

// User roles enum matching backend
export type UserRole = 'systemUser' | 'farmer' | 'extensionOfficer' | 'vet' | 'farmInvitedUser';

// User status enum matching backend
export type UserStatus = 'active' | 'notActive';

export interface User extends BaseEntity {
    username: string;
    email: string;
    role: UserRole;
    roleId?: number;
    status: UserStatus;
    createdBy?: number;
    updatedBy?: number;
    email_verified_at?: string;

    // Profile (based on role - systemUser, farmer, etc.)
    profile?: SystemUser | import('./farmer').Farmer | ExtensionOfficer | Vet;
}

export interface SystemUser extends BaseEntity {
    firstName: string;
    middleName?: string;
    lastName: string;
    phone?: string;
    address?: string;
    createdBy?: number;

    // Relationship
    user?: User;
}

export interface ExtensionOfficer extends BaseEntity {
    firstName: string;
    middleName?: string;
    lastName: string;
    officerNo?: string;
    phone?: string;
    email?: string;
    address?: string;
    regionId?: number;
    districtId?: number;
    wardId?: number;
    status: string;
    createdBy?: number;

    // Relationships
    region?: import('./location').Region;
    district?: import('./location').District;
    ward?: import('./location').Ward;
}

export interface Vet extends BaseEntity {
    firstName: string;
    middleName?: string;
    lastName: string;
    fullName?: string;
    phoneNumber?: string;
    email?: string;
    referenceNo?: string;
    medicalLicenseNo?: string;
    specialization?: string;
    gender?: 'male' | 'female';
    dateOfBirth?: string;
    countryId?: number;
    regionId?: number;
    districtId?: number;
    status: string;
    createdBy?: number;
}

// Extension officer farm invite
export interface ExtensionOfficerFarmInvite extends BaseEntity {
    extensionOfficerId: number;
    farmerId: number;
    farmId?: number;
    accessCode: string;
    status: 'pending' | 'accepted' | 'rejected' | 'expired';
    expiresAt?: string;
    acceptedAt?: string;

    // Relationships
    extensionOfficer?: ExtensionOfficer;
    farmer?: import('./farmer').Farmer;
    farm?: import('./farm').Farm;
}

// OTP Verification
export interface OtpVerification extends BaseEntity {
    userId?: number;
    phone?: string;
    email?: string;
    otp: string;
    purpose: string;
    expiresAt: string;
    verifiedAt?: string;
    attempts: number;

    user?: User;
}

// Form data for user creation
export interface UserFormData {
    username: string;
    email: string;
    password?: string;
    role: UserRole;
    status?: UserStatus;
}

// Form data for system user profile
export interface SystemUserFormData {
    firstName: string;
    middleName?: string;
    lastName: string;
    phone?: string;
    address?: string;
}

// Helper to get user full name based on role
export function getUserDisplayName(user: User): string {
    if (!user.profile) return user.username;

    if ('firstName' in user.profile) {
        const profile = user.profile as SystemUser | ExtensionOfficer | Vet;
        const lastName = 'lastName' in profile ? profile.lastName : '';
        return `${profile.firstName} ${lastName}`.trim() || user.username;
    }

    return user.username;
}
