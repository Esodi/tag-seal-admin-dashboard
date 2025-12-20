// Mock data for Tag & Seal Government Admin Dashboard
import type {
    DashboardStats,
    Region,
    TrendData,
    SpeciesDistribution,
    RegionalComparison,
    Alert,
    Livestock,
    Farm,
    Farmer,
    VaccinationStats
} from '../types';

// Dashboard Statistics
export const mockDashboardStats: DashboardStats = {
    totalLivestock: 1_245_678,
    totalFarms: 45_234,
    totalFarmers: 38_567,
    vaccinationCoverage: 78.5,
    activeLivestock: 1_198_432,
    activeFarms: 42_891,
};

// Tanzania Regions with livestock data
export const mockRegions: Region[] = [
    { id: 1, name: 'Dar es Salaam', countryId: 1, livestock: 45000, farms: 1200, farmers: 980, vaccinationRate: 85 },
    { id: 2, name: 'Arusha', countryId: 1, livestock: 125000, farms: 4500, farmers: 3800, vaccinationRate: 72 },
    { id: 3, name: 'Dodoma', countryId: 1, livestock: 98000, farms: 3200, farmers: 2900, vaccinationRate: 68 },
    { id: 4, name: 'Iringa', countryId: 1, livestock: 87000, farms: 2800, farmers: 2400, vaccinationRate: 75 },
    { id: 5, name: 'Kagera', countryId: 1, livestock: 112000, farms: 3900, farmers: 3500, vaccinationRate: 70 },
    { id: 6, name: 'Kigoma', countryId: 1, livestock: 65000, farms: 2100, farmers: 1800, vaccinationRate: 62 },
    { id: 7, name: 'Kilimanjaro', countryId: 1, livestock: 78000, farms: 2600, farmers: 2200, vaccinationRate: 82 },
    { id: 8, name: 'Lindi', countryId: 1, livestock: 42000, farms: 1400, farmers: 1200, vaccinationRate: 58 },
    { id: 9, name: 'Manyara', countryId: 1, livestock: 145000, farms: 5200, farmers: 4600, vaccinationRate: 65 },
    { id: 10, name: 'Mara', countryId: 1, livestock: 89000, farms: 3100, farmers: 2700, vaccinationRate: 71 },
    { id: 11, name: 'Mbeya', countryId: 1, livestock: 95000, farms: 3300, farmers: 2900, vaccinationRate: 77 },
    { id: 12, name: 'Morogoro', countryId: 1, livestock: 82000, farms: 2700, farmers: 2300, vaccinationRate: 73 },
    { id: 13, name: 'Mtwara', countryId: 1, livestock: 38000, farms: 1300, farmers: 1100, vaccinationRate: 55 },
    { id: 14, name: 'Mwanza', countryId: 1, livestock: 132000, farms: 4800, farmers: 4200, vaccinationRate: 69 },
    { id: 15, name: 'Pwani', countryId: 1, livestock: 52000, farms: 1700, farmers: 1500, vaccinationRate: 74 },
    { id: 16, name: 'Rukwa', countryId: 1, livestock: 76000, farms: 2500, farmers: 2100, vaccinationRate: 63 },
    { id: 17, name: 'Ruvuma', countryId: 1, livestock: 68000, farms: 2200, farmers: 1900, vaccinationRate: 66 },
    { id: 18, name: 'Shinyanga', countryId: 1, livestock: 118000, farms: 4100, farmers: 3600, vaccinationRate: 64 },
    { id: 19, name: 'Singida', countryId: 1, livestock: 92000, farms: 3000, farmers: 2600, vaccinationRate: 61 },
    { id: 20, name: 'Tabora', countryId: 1, livestock: 105000, farms: 3600, farmers: 3100, vaccinationRate: 59 },
    { id: 21, name: 'Tanga', countryId: 1, livestock: 72000, farms: 2400, farmers: 2000, vaccinationRate: 76 },
];

// Livestock population trend (12 months)
export const mockLivestockTrend: TrendData[] = [
    { month: 'Jan', cattle: 450000, goats: 380000, sheep: 120000, pigs: 85000, poultry: 210000 },
    { month: 'Feb', cattle: 455000, goats: 385000, sheep: 122000, pigs: 86000, poultry: 215000 },
    { month: 'Mar', cattle: 462000, goats: 392000, sheep: 125000, pigs: 88000, poultry: 220000 },
    { month: 'Apr', cattle: 470000, goats: 398000, sheep: 128000, pigs: 90000, poultry: 225000 },
    { month: 'May', cattle: 478000, goats: 405000, sheep: 130000, pigs: 92000, poultry: 232000 },
    { month: 'Jun', cattle: 485000, goats: 412000, sheep: 133000, pigs: 94000, poultry: 238000 },
    { month: 'Jul', cattle: 492000, goats: 418000, sheep: 135000, pigs: 95000, poultry: 245000 },
    { month: 'Aug', cattle: 498000, goats: 425000, sheep: 138000, pigs: 97000, poultry: 250000 },
    { month: 'Sep', cattle: 505000, goats: 432000, sheep: 140000, pigs: 98000, poultry: 255000 },
    { month: 'Oct', cattle: 512000, goats: 438000, sheep: 142000, pigs: 99000, poultry: 260000 },
    { month: 'Nov', cattle: 518000, goats: 445000, sheep: 145000, pigs: 100000, poultry: 265000 },
    { month: 'Dec', cattle: 525000, goats: 452000, sheep: 148000, pigs: 101000, poultry: 270000 },
];

// Species distribution
export const mockSpeciesDistribution: SpeciesDistribution[] = [
    { name: 'Cattle', value: 525000, color: '#3b82f6' },
    { name: 'Goats', value: 452000, color: '#10b981' },
    { name: 'Poultry', value: 270000, color: '#f59e0b' },
    { name: 'Sheep', value: 148000, color: '#ef4444' },
    { name: 'Pigs', value: 101000, color: '#8b5cf6' },
];

// Regional comparison (top 10)
export const mockRegionalComparison: RegionalComparison[] = [
    { region: 'Manyara', livestock: 145000, farms: 5200, vaccinationRate: 65 },
    { region: 'Mwanza', livestock: 132000, farms: 4800, vaccinationRate: 69 },
    { region: 'Arusha', livestock: 125000, farms: 4500, vaccinationRate: 72 },
    { region: 'Shinyanga', livestock: 118000, farms: 4100, vaccinationRate: 64 },
    { region: 'Kagera', livestock: 112000, farms: 3900, vaccinationRate: 70 },
    { region: 'Tabora', livestock: 105000, farms: 3600, vaccinationRate: 59 },
    { region: 'Dodoma', livestock: 98000, farms: 3200, vaccinationRate: 68 },
    { region: 'Mbeya', livestock: 95000, farms: 3300, vaccinationRate: 77 },
    { region: 'Singida', livestock: 92000, farms: 3000, vaccinationRate: 61 },
    { region: 'Mara', livestock: 89000, farms: 3100, vaccinationRate: 71 },
];

// System alerts
export const mockAlerts: Alert[] = [
    {
        id: 1,
        type: 'danger',
        title: 'Disease Outbreak Alert',
        message: 'Foot-and-mouth disease detected in Manyara region. Immediate action required.',
        region: 'Manyara',
        createdAt: '2025-12-19T08:30:00Z',
    },
    {
        id: 2,
        type: 'warning',
        title: 'Low Vaccination Coverage',
        message: 'Mtwara region has vaccination rate below 60%. Campaign recommended.',
        region: 'Mtwara',
        createdAt: '2025-12-18T14:15:00Z',
    },
    {
        id: 3,
        type: 'warning',
        title: 'Overdue Vaccinations',
        message: '12,450 livestock in Tabora region have overdue vaccinations.',
        region: 'Tabora',
        createdAt: '2025-12-17T10:00:00Z',
    },
    {
        id: 4,
        type: 'info',
        title: 'New Registration Milestone',
        message: 'National livestock registration has exceeded 1.2 million animals.',
        createdAt: '2025-12-16T09:00:00Z',
    },
];

// Sample livestock data
export const mockLivestock: Livestock[] = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    uuid: `uuid-livestock-${i + 1}`,
    identificationNumber: `TZ-${String(i + 1).padStart(8, '0')}`,
    name: ['Bella', 'Moo', 'Daisy', 'Star', 'Luna', 'Max', 'Rocky', 'Coco'][i % 8],
    species: ['Cattle', 'Goat', 'Sheep', 'Pig', 'Poultry'][i % 5],
    breed: ['Friesian', 'Ayrshire', 'Boer', 'Dorper', 'Large White'][i % 5],
    livestockType: ['Dairy Cow', 'Beef Cattle', 'Breeding Goat', 'Meat Goat', 'Wool Sheep'][i % 5],
    gender: i % 2 === 0 ? 'female' : 'male',
    status: ['active', 'active', 'active', 'sold', 'dead'][i % 5] as Livestock['status'],
    farmName: `Farm ${Math.floor(i / 5) + 1}`,
    regionName: mockRegions[i % mockRegions.length].name,
    districtName: `District ${(i % 5) + 1}`,
    dateOfBirth: new Date(2020 + (i % 4), i % 12, (i % 28) + 1).toISOString().split('T')[0],
    registeredAt: new Date(2024, i % 12, (i % 28) + 1).toISOString(),
}));

// Sample farms data
export const mockFarms: Farm[] = Array.from({ length: 30 }, (_, i) => ({
    id: i + 1,
    uuid: `uuid-farm-${i + 1}`,
    name: `${['Green Pastures', 'Sunset Valley', 'Mountain View', 'River Side', 'Golden Fields'][i % 5]} Farm ${i + 1}`,
    referenceNo: `FRM-${String(i + 1).padStart(6, '0')}`,
    farmerName: `${['John', 'Mary', 'Peter', 'Grace', 'David'][i % 5]} ${['Mwamba', 'Njoroge', 'Kamau', 'Odhiambo', 'Mushi'][i % 5]}`,
    regionName: mockRegions[i % mockRegions.length].name,
    districtName: `District ${(i % 5) + 1}`,
    wardName: `Ward ${(i % 10) + 1}`,
    status: i % 10 === 0 ? 'inactive' : 'active',
    livestockCount: Math.floor(Math.random() * 200) + 10,
    size: Math.floor(Math.random() * 50) + 5,
    sizeUnit: 'hectares',
    registeredAt: new Date(2023, i % 12, (i % 28) + 1).toISOString(),
}));

// Sample farmers data
export const mockFarmers: Farmer[] = Array.from({ length: 30 }, (_, i) => ({
    id: i + 1,
    farmerNo: `FMR-${String(i + 1).padStart(6, '0')}`,
    firstName: ['John', 'Mary', 'Peter', 'Grace', 'David', 'Anna', 'James', 'Sarah'][i % 8],
    middleName: i % 3 === 0 ? ['Joseph', 'Elizabeth', 'Michael'][i % 3] : undefined,
    surname: ['Mwamba', 'Njoroge', 'Kamau', 'Odhiambo', 'Mushi', 'Kimani', 'Wangari', 'Juma'][i % 8],
    phone: `+255${String(700000000 + i).padStart(9, '0')}`,
    email: i % 2 === 0 ? `farmer${i}@example.com` : undefined,
    gender: i % 2 === 0 ? 'male' : 'female',
    regionName: mockRegions[i % mockRegions.length].name,
    districtName: `District ${(i % 5) + 1}`,
    wardName: `Ward ${(i % 10) + 1}`,
    farmCount: Math.floor(Math.random() * 3) + 1,
    livestockCount: Math.floor(Math.random() * 100) + 5,
    registeredAt: new Date(2022, i % 12, (i % 28) + 1).toISOString(),
}));

// Vaccination statistics by region
export const mockVaccinationStats: VaccinationStats[] = mockRegions.map(region => ({
    region: region.name,
    totalLivestock: region.livestock,
    vaccinated: Math.floor(region.livestock * (region.vaccinationRate / 100)),
    overdue: Math.floor(region.livestock * ((100 - region.vaccinationRate) / 100) * 0.3),
    rate: region.vaccinationRate,
}));
