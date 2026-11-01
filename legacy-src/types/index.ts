// Type definitions for Tag & Seal Government Admin Dashboard

// Geographic types
export interface Region {
    id: number;
    name: string;
    countryId: number;
    livestock: number;
    farms: number;
    farmers: number;
    vaccinationRate: number;
}

export interface District {
    id: number;
    name: string;
    regionId: number;
    livestock: number;
    farms: number;
}

// Livestock types
export interface Livestock {
    id: number;
    uuid: string;
    identificationNumber: string;
    name: string;
    species: string;
    breed: string;
    livestockType: string;
    gender: 'male' | 'female';
    status: 'active' | 'sold' | 'dead' | 'transferred';
    farmName: string;
    regionName: string;
    districtName: string;
    dateOfBirth: string;
    registeredAt: string;
}

// Farm types
export interface Farm {
    id: number;
    uuid: string;
    name: string;
    referenceNo: string;
    farmerName: string;
    regionName: string;
    districtName: string;
    wardName: string;
    status: 'active' | 'inactive';
    livestockCount: number;
    size: number;
    sizeUnit: string;
    registeredAt: string;
}

// Farmer types
export interface Farmer {
    id: number;
    farmerNo: string;
    firstName: string;
    middleName?: string;
    surname: string;
    phone: string;
    email?: string;
    gender: 'male' | 'female';
    regionName: string;
    districtName: string;
    wardName: string;
    farmCount: number;
    livestockCount: number;
    registeredAt: string;
}

// Dashboard statistics
export interface DashboardStats {
    totalLivestock: number;
    totalFarms: number;
    totalFarmers: number;
    vaccinationCoverage: number;
    activeLivestock: number;
    activeFarms: number;
}

export interface TrendData {
    month: string;
    cattle: number;
    goats: number;
    sheep: number;
    pigs: number;
    poultry: number;
    [key: string]: string | number; // Index signature for CSV export compatibility
}

export interface SpeciesDistribution {
    name: string;
    value: number;
    color: string;
    [key: string]: string | number; // Index signature for Recharts compatibility
}

export interface RegionalComparison {
    region: string;
    livestock: number;
    farms: number;
    vaccinationRate: number;
}

// Alert types
export interface Alert {
    id: number;
    type: 'warning' | 'danger' | 'info';
    title: string;
    message: string;
    region?: string;
    createdAt: string;
}

// Vaccination types
export interface VaccinationStats {
    region: string;
    totalLivestock: number;
    vaccinated: number;
    overdue: number;
    rate: number;
}

// Navigation types
export interface NavItem {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    children?: NavItem[];
}
