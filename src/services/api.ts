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

// Generic fetch wrapper with error handling
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
        ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        if (response.status === 401) {
            clearAuthToken();
            // Redirect to login if unauthorized
            window.location.href = '/login';
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    return response.json();
}

// API Response Types
export interface ApiResponse<T> {
    data: T;
    message?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
}

// Auth Types
export interface LoginCredentials {
    login: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    user: {
        id: number;
        email: string;
        username: string;
        role: string;
    };
}

// API methods organized by domain
export const api = {
    // Authentication
    auth: {
        login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
            const response = await fetchAPI<AuthResponse>('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ ...credentials, device_name: 'Admin Dashboard' }),
            });
            if (response.token) {
                setAuthToken(response.token);
            }
            return response;
        },
        logout: () => fetchAPI('/auth/logout', { method: 'POST' }),
        profile: () => fetchAPI('/auth/profile'),
    },

    // Entities - Livestock
    livestock: {
        list: () => fetchAPI<unknown[]>('/v1/admin/entities/livestock'),
        get: (id: number) => fetchAPI(`/v1/admin/entities/livestock/${id}`),
        create: (data: unknown) => fetchAPI('/v1/admin/entities/livestock', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
        update: (id: number, data: unknown) => fetchAPI(`/v1/admin/entities/livestock/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
        delete: (id: number) => fetchAPI(`/v1/admin/entities/livestock/${id}`, {
            method: 'DELETE',
        }),
    },

    // Entities - Farms
    farms: {
        list: () => fetchAPI<unknown[]>('/v1/admin/entities/farms'),
        get: (id: number) => fetchAPI(`/v1/admin/entities/farms/${id}`),
        create: (data: unknown) => fetchAPI('/v1/admin/entities/farms', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
        update: (id: number, data: unknown) => fetchAPI(`/v1/admin/entities/farms/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
        delete: (id: number) => fetchAPI(`/v1/admin/entities/farms/${id}`, {
            method: 'DELETE',
        }),
    },

    // Entities - Farmers
    farmers: {
        list: () => fetchAPI<unknown[]>('/v1/admin/entities/farmers'),
        get: (id: number) => fetchAPI(`/v1/admin/entities/farmers/${id}`),
        create: (data: unknown) => fetchAPI('/v1/admin/entities/farmers', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
        update: (id: number, data: unknown) => fetchAPI(`/v1/admin/entities/farmers/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
        delete: (id: number) => fetchAPI(`/v1/admin/entities/farmers/${id}`, {
            method: 'DELETE',
        }),
    },

    // Entities - Vets
    vets: {
        list: () => fetchAPI<unknown[]>('/v1/admin/entities/vets'),
        get: (id: number) => fetchAPI(`/v1/admin/entities/vets/${id}`),
    },

    // Locations - Regions
    regions: {
        list: () => fetchAPI<unknown[]>('/v1/admin/locations/regions'),
        get: (id: number) => fetchAPI(`/v1/admin/locations/regions/${id}`),
    },

    // Locations - Districts
    districts: {
        list: () => fetchAPI<unknown[]>('/v1/admin/locations/districts'),
        get: (id: number) => fetchAPI(`/v1/admin/locations/districts/${id}`),
    },

    // Locations - Wards
    wards: {
        list: () => fetchAPI<unknown[]>('/v1/admin/locations/wards'),
        get: (id: number) => fetchAPI(`/v1/admin/locations/wards/${id}`),
    },

    // Locations - Villages
    villages: {
        list: () => fetchAPI<unknown[]>('/v1/admin/locations/villages'),
        get: (id: number) => fetchAPI(`/v1/admin/locations/villages/${id}`),
    },

    // Logs - Vaccinations
    vaccinations: {
        list: () => fetchAPI<unknown[]>('/v1/admin/logs/vaccinations'),
        get: (id: number) => fetchAPI(`/v1/admin/logs/vaccinations/${id}`),
    },

    // Logs - Transfers (Movement Tracking)
    transfers: {
        list: () => fetchAPI<unknown[]>('/v1/admin/logs/transfers'),
        get: (id: number) => fetchAPI(`/v1/admin/logs/transfers/${id}`),
    },

    // Logs - Medications
    medications: {
        list: () => fetchAPI<unknown[]>('/v1/admin/logs/medications'),
        get: (id: number) => fetchAPI(`/v1/admin/logs/medications/${id}`),
    },

    // Logs - Dewormings
    dewormings: {
        list: () => fetchAPI<unknown[]>('/v1/admin/logs/dewormings'),
        get: (id: number) => fetchAPI(`/v1/admin/logs/dewormings/${id}`),
    },

    // Logs - Birth Events
    birthEvents: {
        list: () => fetchAPI<unknown[]>('/v1/admin/logs/birth-events'),
        get: (id: number) => fetchAPI(`/v1/admin/logs/birth-events/${id}`),
    },

    // Logs - Disposals
    disposals: {
        list: () => fetchAPI<unknown[]>('/v1/admin/logs/disposals'),
        get: (id: number) => fetchAPI(`/v1/admin/logs/disposals/${id}`),
    },

    // Reference Data
    reference: {
        livestockTypes: () => fetchAPI<unknown[]>('/v1/admin/reference/livestock-types'),
        species: () => fetchAPI<unknown[]>('/v1/admin/reference/species'),
        breeds: () => fetchAPI<unknown[]>('/v1/admin/reference/breeds'),
        diseases: () => fetchAPI<unknown[]>('/v1/admin/reference/diseases'),
        vaccineTypes: () => fetchAPI<unknown[]>('/v1/admin/reference/vaccine-types'),
        disposalTypes: () => fetchAPI<unknown[]>('/v1/admin/reference/disposal-types'),
        medicineTypes: () => fetchAPI<unknown[]>('/v1/admin/reference/medicine-types'),
        medicines: () => fetchAPI<unknown[]>('/v1/admin/reference/medicines'),
    },

    // Users (Admin)
    users: {
        list: () => fetchAPI<unknown[]>('/v1/admin/users'),
        get: (id: number) => fetchAPI(`/v1/admin/users/${id}`),
        statistics: () => fetchAPI('/v1/admin/users/statistics'),
    },
};

export default api;
