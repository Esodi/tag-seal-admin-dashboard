import { BaseEntity, FullLocation } from './location';
import { Farmer } from './farmer';

export interface LegalStatus extends BaseEntity {
    name: string;
}

export interface Farm extends BaseEntity {
    uuid: string;
    farmerId: number;
    referenceNo?: string;
    regionalRegNo?: string;
    name: string;
    size?: number;
    sizeUnit?: string;
    latitudes?: string;
    longitudes?: string;
    physicalAddress?: string;
    villageId?: number;
    wardId?: number;
    districtId?: number;
    regionId?: number;
    countryId?: number;
    legalStatusId?: number;
    status: 'Active' | 'Inactive' | 'active' | 'not-active';

    // Relationships (when loaded)
    farmer?: Farmer;
    legalStatus?: LegalStatus;

    // Computed/joined fields
    livestockCount?: number;
}

// Extended farm with location names (commonly returned by API)
export interface FarmWithLocation extends Farm, FullLocation {
    farmerName?: string;
}

// Form data for creating/editing farms
export interface FarmFormData {
    farmerId: number;
    name: string;
    referenceNo?: string;
    regionalRegNo?: string;
    size?: number;
    sizeUnit?: string;
    latitudes?: string;
    longitudes?: string;
    physicalAddress?: string;
    villageId?: number;
    wardId?: number;
    districtId?: number;
    regionId?: number;
    countryId?: number;
    legalStatusId?: number;
    status?: string;
}

// Farm user (permission to access farm)
export interface FarmUser extends BaseEntity {
    farmId: number;
    userId: number;
    role: string;
    status: string;
    farm?: Farm;
    user?: import('./user').User;
}
