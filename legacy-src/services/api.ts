// API Service with generic CRUD factory
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Token management
let authToken: string | null = localStorage.getItem('auth_token');

export function setAuthToken(token: string): void {
    authToken = token;
    localStorage.setItem('auth_token', token);
}

export function getAuthToken(): string | null {
    return authToken;
}

export function clearAuthToken(): void {
    authToken = null;
    localStorage.removeItem('auth_token');
}

export function isAuthenticated(): boolean {
    return !!authToken;
}

// List parameters for pagination/filtering
export interface ListParams {
    page?: number;
    per_page?: number;
    search?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    [key: string]: string | number | boolean | undefined;
}

// Paginated response from API
export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
}

// API Error class
export class ApiError extends Error {
    status: number;
    data?: Record<string, unknown>;

    constructor(message: string, status: number, data?: Record<string, unknown>) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}

// Build query string from params
function buildQueryString(params?: ListParams): string {
    if (!params) return '';
    const filtered = Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== null && v !== '')
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
    return filtered.length > 0 ? `?${filtered.join('&')}` : '';
}

// Generic fetch wrapper with error handling
async function fetchAPI<T>(
    endpoint: string,
    options: RequestInit & { params?: ListParams } = {}
): Promise<T> {
    const { params, ...fetchOptions } = options;
    const queryString = buildQueryString(params);
    const url = `${API_BASE_URL}${endpoint}${queryString}`;

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...fetchOptions.headers,
    };

    try {
        const response = await fetch(url, {
            ...fetchOptions,
            headers,
        });

        // Handle 401 Unauthorized
        if (response.status === 401) {
            clearAuthToken();
            window.location.href = '/login';
            throw new ApiError('Unauthorized', 401);
        }

        // Handle error responses
        if (!response.ok) {
            let errorData: Record<string, unknown> = {};
            try {
                errorData = await response.json();
            } catch {
                // Response might not be JSON
            }
            const message =
                (errorData.message as string) ||
                (errorData.error as string) ||
                `API Error: ${response.status}`;
            throw new ApiError(message, response.status, errorData);
        }

        // Handle 204 No Content
        if (response.status === 204) {
            return undefined as T;
        }

        const result = await response.json();

        // Unwrap data property if it exists (Laravel standard)
        if (result && typeof result === 'object' && 'data' in result && result.data !== null && result.data !== undefined) {
            return result.data as T;
        }

        return result as T;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        // Network or other error
        throw new ApiError(
            error instanceof Error ? error.message : 'Network error',
            0
        );
    }
}

// Generic CRUD endpoints factory
export interface CrudEndpoints<T, CreateDTO = Partial<T>, UpdateDTO = Partial<T>> {
    list: (params?: ListParams) => Promise<T[]>;
    listPaginated: (params?: ListParams) => Promise<PaginatedResponse<T>>;
    get: (id: number | string) => Promise<T>;
    create: (data: CreateDTO) => Promise<T>;
    update: (id: number | string, data: UpdateDTO) => Promise<T>;
    delete: (id: number | string) => Promise<void>;
}

export function createCrudEndpoints<T, CreateDTO = Partial<T>, UpdateDTO = Partial<T>>(
    basePath: string
): CrudEndpoints<T, CreateDTO, UpdateDTO> {
    return {
        list: (params?: ListParams) =>
            fetchAPI<T[]>(basePath, { params }),

        listPaginated: (params?: ListParams) =>
            fetchAPI<PaginatedResponse<T>>(basePath, { params }),

        get: (id: number | string) =>
            fetchAPI<T>(`${basePath}/${id}`),

        create: (data: CreateDTO) =>
            fetchAPI<T>(basePath, {
                method: 'POST',
                body: JSON.stringify(data),
            }),

        update: (id: number | string, data: UpdateDTO) =>
            fetchAPI<T>(`${basePath}/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            }),

        delete: (id: number | string) =>
            fetchAPI<void>(`${basePath}/${id}`, {
                method: 'DELETE',
            }),
    };
}

// Auth types
export interface LoginCredentials {
    login: string;
    password: string;
}

export interface AuthResponse {
    token?: string;
    access_token?: string;
    accessToken?: string;
    user: {
        id: number;
        email: string;
        username: string;
        role: string;
        [key: string]: any;
    };
    [key: string]: any;
}

export interface CurrentUser {
    id: number;
    username: string;
    email: string;
    role: string;
    status: string;
    firstName?: string;
    surname?: string;
    phone?: string;
    profile?: Record<string, any>;
    [key: string]: any;
}

export interface SplashSyncData {
    user: CurrentUser;
    userSpecificData: {
        bills?: any[];
        financeExpenses?: any[];
        [key: string]: any;
    };
    [key: string]: any;
}

// ============================================
// API Endpoints organized by domain
// ============================================

// Authentication
export const authApi = {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const response = await fetchAPI<AuthResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ ...credentials, device_name: 'Admin Dashboard' }),
        });

        // The response is already unwrapped by fetchAPI if it was in 'data'
        // Check all common token locations
        const token = response.access_token || response.accessToken || response.token;

        if (token) {
            setAuthToken(token);
        }
        return response;
    },

    logout: () => {
        const promise = fetchAPI('/auth/logout-all', { method: 'POST' });
        clearAuthToken();
        return promise;
    },

    profile: async () => {
        const response = await fetchAPI<any>('/auth/profile');
        // Handle Laravel structure where it might return {user, profile} under data
        if (response.user) {
            return {
                ...response.user,
                profile: response.profile || {}
            } as CurrentUser;
        }
        return response as CurrentUser;
    },

    updateProfile: (data: Partial<CurrentUser>) =>
        fetchAPI<CurrentUser>('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    changePassword: (data: { current_password: string; password: string; password_confirmation: string }) =>
        fetchAPI<void>('/auth/change-password', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
};

// Import types for type safety
import type {
    Country,
    Region,
    District,
    Ward,
    Village,
    Street,
    Division,
} from '../types/entities/location';
import type {
    Livestock,
    Specie,
    Breed,
    LivestockType,
    LivestockObtainedMethod,
    LivestockFormData,
    Stage,
} from '../types/entities/livestock';
import type { Farm, FarmFormData, LegalStatus } from '../types/entities/farm';
import type { Farmer, FarmerFormData, IdentityCardType, SchoolLevel } from '../types/entities/farmer';
import type {
    User,
    SystemUser,
    ExtensionOfficer,
    Vet,
    ExtensionOfficerFarmInvite,
} from '../types/entities/user';
import type {
    Disease,
    Vaccine,
    VaccineType,
    Medicine,
    MedicineType,
    AdministrationRoute,
    Vaccination,
    Medication,
    Deworming,
    VaccinationFormData,
    MedicationFormData,
    DewormingFormData,
} from '../types/entities/health';
import type {
    BirthType,
    BirthProblem,
    HeatType,
    SemenStrawType,
    InseminationService,
    ReproductiveProblem,
    Pregnancy,
    BirthEvent,
    Calving,
    Insemination,
    AbortedPregnancy,
    Dryoff,
} from '../types/entities/reproduction';
import type {
    DisposalType,
    FeedingType,
    MilkingMethod,
    TestResult,
    Transfer,
    Disposal,
    WeightChange,
    Feeding,
    Milking,
} from '../types/entities/lifecycle';

// ============================================
// Location Endpoints
// ============================================
export const locationApi = {
    countries: createCrudEndpoints<Country>('/v1/admin/locations/countries'),
    regions: createCrudEndpoints<Region>('/v1/admin/locations/regions'),
    districts: createCrudEndpoints<District>('/v1/admin/locations/districts'),
    wards: createCrudEndpoints<Ward>('/v1/admin/locations/wards'),
    villages: createCrudEndpoints<Village>('/v1/admin/locations/villages'),
    streets: createCrudEndpoints<Street>('/v1/admin/locations/streets'),
    divisions: createCrudEndpoints<Division>('/v1/admin/locations/divisions'),
};

// ============================================
// Core Entity Endpoints
// ============================================
export const livestockApi = createCrudEndpoints<Livestock, LivestockFormData>('/v1/admin/entities/livestock');

export const farmApi = createCrudEndpoints<Farm, FarmFormData>('/v1/admin/entities/farms');

export const farmerApi = createCrudEndpoints<Farmer, FarmerFormData>('/v1/admin/entities/farmers');

// ============================================
// User Endpoints
// ============================================
export const userApi = {
    ...createCrudEndpoints<User>('/v1/admin/users'),
    statistics: () => fetchAPI<Record<string, number>>('/v1/admin/users/statistics'),
};

// System users are just users with role=systemUser - using the same users endpoint
export const systemUserApi = createCrudEndpoints<SystemUser>('/v1/admin/users');
export const extensionOfficerApi = createCrudEndpoints<ExtensionOfficer>('/v1/admin/entities/extension-officers');
export const vetApi = createCrudEndpoints<Vet>('/v1/admin/entities/vets');
export const extensionOfficerFarmInviteApi = createCrudEndpoints<ExtensionOfficerFarmInvite>('/v1/admin/entities/extension-officer-farm-invites');
export const vaccineEntityApi = createCrudEndpoints<Vaccine>('/v1/admin/entities/vaccines');

// ============================================
// Reference Data Endpoints
// ============================================
export const referenceApi = {
    // Livestock reference
    species: createCrudEndpoints<Specie>('/v1/admin/reference/species'),
    breeds: createCrudEndpoints<Breed>('/v1/admin/reference/breeds'),
    livestockTypes: createCrudEndpoints<LivestockType>('/v1/admin/reference/livestock-types'),
    livestockObtainedMethods: createCrudEndpoints<LivestockObtainedMethod>('/v1/admin/reference/livestock-obtained-methods'),
    legalStatuses: createCrudEndpoints<LegalStatus>('/v1/admin/reference/legal-statuses'),

    // User reference
    identityCardTypes: createCrudEndpoints<IdentityCardType>('/v1/admin/reference/identity-card-types'),
    schoolLevels: createCrudEndpoints<SchoolLevel>('/v1/admin/reference/school-levels'),

    // Health reference
    diseases: createCrudEndpoints<Disease>('/v1/admin/reference/diseases'),
    vaccineTypes: createCrudEndpoints<VaccineType>('/v1/admin/reference/vaccine-types'),
    medicines: createCrudEndpoints<Medicine>('/v1/admin/reference/medicines'),
    medicineTypes: createCrudEndpoints<MedicineType>('/v1/admin/reference/medicine-types'),
    administrationRoutes: createCrudEndpoints<AdministrationRoute>('/v1/admin/reference/administration-routes'),

    // Reproduction reference
    birthTypes: createCrudEndpoints<BirthType>('/v1/admin/reference/birth-types'),
    birthProblems: createCrudEndpoints<BirthProblem>('/v1/admin/reference/birth-problems'),
    heatTypes: createCrudEndpoints<HeatType>('/v1/admin/reference/heat-types'),
    semenStrawTypes: createCrudEndpoints<SemenStrawType>('/v1/admin/reference/semen-straw-types'),
    inseminationServices: createCrudEndpoints<InseminationService>('/v1/admin/reference/insemination-services'),
    reproductiveProblems: createCrudEndpoints<ReproductiveProblem>('/v1/admin/reference/reproductive-problems'),

    // Lifecycle reference
    disposalTypes: createCrudEndpoints<DisposalType>('/v1/admin/reference/disposal-types'),
    feedingTypes: createCrudEndpoints<FeedingType>('/v1/admin/reference/feeding-types'),
    milkingMethods: createCrudEndpoints<MilkingMethod>('/v1/admin/reference/milking-methods'),
    stages: createCrudEndpoints<Stage>('/v1/admin/reference/stages'),
    testResults: createCrudEndpoints<TestResult>('/v1/admin/reference/test-results'),
};

// ============================================
// Event Log Endpoints
// ============================================
export const healthLogApi = {
    vaccinations: createCrudEndpoints<Vaccination, VaccinationFormData>('/v1/admin/logs/vaccinations'),
    treatments: createCrudEndpoints<Medication, MedicationFormData>('/v1/admin/logs/treatments'),
    dewormings: createCrudEndpoints<Deworming, DewormingFormData>('/v1/admin/logs/dewormings'),
};

export const reproductionLogApi = {
    pregnancies: createCrudEndpoints<Pregnancy>('/v1/admin/logs/pregnancies'),
    birthEvents: createCrudEndpoints<BirthEvent>('/v1/admin/logs/birth-events'),
    calvings: createCrudEndpoints<Calving>('/v1/admin/logs/calvings'),
    inseminations: createCrudEndpoints<Insemination>('/v1/admin/logs/inseminations'),
    abortedPregnancies: createCrudEndpoints<AbortedPregnancy>('/v1/admin/logs/aborted-pregnancies'),
    dryoffs: createCrudEndpoints<Dryoff>('/v1/admin/logs/dryoffs'),
};

export const lifecycleLogApi = {
    transfers: createCrudEndpoints<Transfer>('/v1/admin/logs/transfers'),
    disposals: createCrudEndpoints<Disposal>('/v1/admin/logs/disposals'),
    weightChanges: createCrudEndpoints<WeightChange>('/v1/admin/logs/weight-changes'),
    feedings: createCrudEndpoints<Feeding>('/v1/admin/logs/feedings'),
    milkings: createCrudEndpoints<Milking>('/v1/admin/logs/milkings'),
};

export const financeApi = {
    incomeExpenditure: createCrudEndpoints<any>('/v1/admin/reports/income-expenditure'),
    bills: createCrudEndpoints<any>('/v1/admin/reports/bills'),
};

// ============================================
// Sync Endpoints
// ============================================
export const syncApi = {
    splashSync: (userId: number | string) =>
        fetchAPI<SplashSyncData>(`/v1/sync/splash-sync-all/${userId}`),
};

// ============================================
// Legacy API object for backwards compatibility
// ============================================
// ============================================
// API Aliases for easier imports
// ============================================
export const vaccinationApi = healthLogApi.vaccinations;
export const treatmentApi = healthLogApi.treatments;
export const dewormingApi = healthLogApi.dewormings;

export const diseaseApi = referenceApi.diseases;
export const vaccineApi = vaccineEntityApi;
export const vaccineTypeApi = referenceApi.vaccineTypes;
export const medicineApi = referenceApi.medicines;
export const medicineTypeApi = referenceApi.medicineTypes;
export const administrationRouteApi = referenceApi.administrationRoutes;

// Reproduction Reference Aliases
export const birthTypeApi = referenceApi.birthTypes;
export const birthProblemApi = referenceApi.birthProblems;
export const heatTypeApi = referenceApi.heatTypes;
export const semenStrawTypeApi = referenceApi.semenStrawTypes;
export const inseminationServiceApi = referenceApi.inseminationServices;
export const reproductiveProblemApi = referenceApi.reproductiveProblems;

// Lifecycle Reference Aliases
export const disposalTypeApi = referenceApi.disposalTypes;
export const feedingTypeApi = referenceApi.feedingTypes;
export const milkingMethodApi = referenceApi.milkingMethods;
export const stageApi = referenceApi.stages;
export const testResultApi = referenceApi.testResults;

// Reproduction Logs Aliases
export const pregnancyApi = reproductionLogApi.pregnancies;
export const birthEventApi = reproductionLogApi.birthEvents;
export const calvingApi = reproductionLogApi.calvings;
export const inseminationApi = reproductionLogApi.inseminations;
export const abortedPregnancyApi = reproductionLogApi.abortedPregnancies;
export const dryoffApi = reproductionLogApi.dryoffs;

// Lifecycle Logs Aliases
export const transferApi = lifecycleLogApi.transfers;
export const disposalApi = lifecycleLogApi.disposals;
export const weightChangeApi = lifecycleLogApi.weightChanges;
export const feedingApi = lifecycleLogApi.feedings;
export const milkingApi = lifecycleLogApi.milkings;

// ============================================
// Legacy API object for backwards compatibility
// ============================================
export const api = {
    auth: authApi,
    livestock: livestockApi,
    farms: farmApi,
    farmers: farmerApi,
    users: userApi,
    regions: locationApi.regions,
    districts: locationApi.districts,
    wards: locationApi.wards,
    villages: locationApi.villages,
    vaccinations: healthLogApi.vaccinations,
    treatments: healthLogApi.treatments,
    transfers: lifecycleLogApi.transfers,
    sync: syncApi,
    // Add missing endpoints for Dashboard/Analytics
    birthEvents: reproductionLogApi.birthEvents,
    inseminations: reproductionLogApi.inseminations,
    vets: vetApi,
    extensionOfficers: extensionOfficerApi,
    reference: {
        livestockTypes: () => referenceApi.livestockTypes.list(),
        species: () => referenceApi.species.list(),
        breeds: () => referenceApi.breeds.list(),
        diseases: () => referenceApi.diseases.list(),
        vaccineTypes: () => referenceApi.vaccineTypes.list(),
        disposalTypes: () => referenceApi.disposalTypes.list(),
        medicineTypes: () => referenceApi.medicineTypes.list(),
        medicines: () => referenceApi.medicines.list(),
    },
};

export default api;
