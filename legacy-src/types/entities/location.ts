// Base entity interface - all entities extend this
export interface BaseEntity {
    id: number;
    created_at?: string;
    updated_at?: string;
}

// Location entities
export interface Country extends BaseEntity {
    name: string;
}

export interface Region extends BaseEntity {
    name: string;
    countryId: number;
    country?: Country;
}

export interface District extends BaseEntity {
    name: string;
    regionId: number;
    region?: Region;
}

export interface Ward extends BaseEntity {
    name: string;
    districtId: number;
    district?: District;
}

export interface Village extends BaseEntity {
    name: string;
    wardId: number;
    ward?: Ward;
}

export interface Street extends BaseEntity {
    name: string;
    villageId: number;
    village?: Village;
}

export interface Division extends BaseEntity {
    name: string;
    districtId: number;
    district?: District;
}

// Full location with all levels (commonly used for display)
export interface FullLocation {
    countryId?: number;
    countryName?: string;
    regionId?: number;
    regionName?: string;
    districtId?: number;
    districtName?: string;
    wardId?: number;
    wardName?: string;
    villageId?: number;
    villageName?: string;
    streetId?: number;
    streetName?: string;
}
