import { BaseEntity } from './location';
import { Livestock } from './livestock';

// Health reference data
export interface Disease extends BaseEntity {
    name: string;
    description?: string;
}

export interface VaccineType extends BaseEntity {
    name: string;
}

export interface Vaccine extends BaseEntity {
    name: string;
    vaccineTypeId?: number;
    manufacturer?: string;
    description?: string;

    vaccineType?: VaccineType;
}

export interface MedicineType extends BaseEntity {
    name: string;
}

export interface Medicine extends BaseEntity {
    name: string;
    medicineTypeId?: number;
    manufacturer?: string;
    description?: string;

    medicineType?: MedicineType;
}

export interface AdministrationRoute extends BaseEntity {
    name: string;
}

// Health event logs
export interface Vaccination extends BaseEntity {
    uuid: string;
    vaccinationNo?: string;
    farmUuid: string;
    livestockUuid: string;
    vaccineUuid?: string;
    vaccineId?: number;
    diseaseId: number;
    vetId?: string;
    extensionOfficerId?: string;
    status: 'pending' | 'completed' | 'failed';
    eventDate?: string;
    dosage?: string;
    administrationRouteId?: number;
    createdBy?: number;

    // Relationships
    livestock?: Livestock;
    vaccine?: Vaccine;
    administrationRoute?: AdministrationRoute;
    disease?: Disease;
}

export interface Medication extends BaseEntity {
    uuid: string;
    farmUuid: string;
    livestockUuid: string;
    diseaseId?: number;
    medicineId?: number;
    quantity?: string;
    withdrawalPeriod?: string;
    medicationDate?: string;
    nextMedicationDate?: string;
    remarks?: string;
    eventDate?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    administrationRouteId?: number;
    vetId?: string;
    notes?: string;
    createdBy?: number;

    // Relationships
    livestock?: Livestock;
    medicine?: Medicine;
    disease?: Disease;
    administrationRoute?: AdministrationRoute;
}

export interface Deworming extends BaseEntity {
    uuid: string;
    farmUuid: string;
    livestockUuid: string;
    administrationRouteId: number;
    medicineId: number;
    vetId?: string;
    extensionOfficerId?: string;
    quantity: string;
    dose?: string;
    nextAdministrationDate?: string;
    eventDate?: string;
    notes?: string;
    createdBy?: number;

    // Relationships
    livestock?: Livestock;
    medicine?: Medicine;
    administrationRoute?: AdministrationRoute;
}

// Form data types
export interface VaccinationFormData {
    uuid?: string;
    vaccinationNo?: string;
    farmUuid: string;
    livestockUuid: string;
    vaccineUuid?: string;
    vaccineId?: number;
    diseaseId: number;
    vetId?: string;
    extensionOfficerId?: string;
    status?: string;
    eventDate?: string;
    dosage?: string;
    administrationRouteId?: number;
}

export interface MedicationFormData {
    uuid?: string;
    farmUuid: string;
    livestockUuid: string;
    diseaseId?: number;
    medicineId?: number;
    quantity?: string;
    withdrawalPeriod?: string;
    medicationDate?: string;
    nextMedicationDate?: string;
    remarks?: string;
    eventDate?: string;
    severity?: string;
    administrationRouteId?: number;
    vetId?: string;
    notes?: string;
}

export interface DewormingFormData {
    uuid?: string;
    farmUuid: string;
    livestockUuid: string;
    administrationRouteId: number;
    medicineId: number;
    vetId?: string;
    extensionOfficerId?: string;
    quantity: string;
    dose?: string;
    nextAdministrationDate?: string;
    eventDate?: string;
    notes?: string;
}
