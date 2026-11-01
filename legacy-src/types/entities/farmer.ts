import { BaseEntity, FullLocation } from './location';

export interface IdentityCardType extends BaseEntity {
    name: string;
}

export interface SchoolLevel extends BaseEntity {
    name: string;
}

export interface Farmer extends BaseEntity {
    farmerNo?: string;
    firstName: string;
    middleName?: string;
    surname: string;
    phone1?: string;
    phone2?: string;
    email?: string;
    physicalAddress?: string;
    farmerOrganizationMembership?: string;
    dateOfBirth?: string;
    gender: 'male' | 'female';
    identityCardTypeId?: number;
    identityNumber?: string;
    streetId?: number;
    schoolLevelId?: number;
    villageId?: number;
    wardId?: number;
    districtId?: number;
    regionId?: number;
    countryId?: number;
    farmerType?: string;
    createdBy?: number;
    status: 'active' | 'inactive';

    // Relationships (when loaded)
    identityCardType?: IdentityCardType;
    schoolLevel?: SchoolLevel;

    // Computed fields
    farmCount?: number;
    livestockCount?: number;
}

// Extended farmer with location names
export interface FarmerWithLocation extends Farmer, FullLocation {
    fullName?: string;
}

// Form data for creating/editing farmers
export interface FarmerFormData {
    farmerNo?: string;
    firstName: string;
    middleName?: string;
    surname: string;
    phone1?: string;
    phone2?: string;
    email?: string;
    physicalAddress?: string;
    farmerOrganizationMembership?: string;
    dateOfBirth?: string;
    gender: 'male' | 'female';
    identityCardTypeId?: number;
    identityNumber?: string;
    streetId?: number;
    schoolLevelId?: number;
    villageId?: number;
    wardId?: number;
    districtId?: number;
    regionId?: number;
    countryId?: number;
    farmerType?: string;
    status?: string;
}

// Helper to get full name
export function getFarmerFullName(farmer: Farmer): string {
    const parts = [farmer.firstName, farmer.middleName, farmer.surname].filter(Boolean);
    return parts.join(' ');
}
