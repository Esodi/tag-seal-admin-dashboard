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
    livestockId: number;
    livestockUuid?: string;
    vaccineId: number;
    vaccinationDate: string;
    batchNumber?: string;
    dosage?: string;
    administrationRouteId?: number;
    nextDueDate?: string;
    veterinarianId?: number;
    notes?: string;
    createdBy?: number;

    // Relationships
    livestock?: Livestock;
    vaccine?: Vaccine;
    administrationRoute?: AdministrationRoute;
}

export interface Medication extends BaseEntity {
    livestockId: number;
    livestockUuid?: string;
    medicineId?: number;
    diseaseId?: number;
    medicationDate: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
    administrationRouteId?: number;
    veterinarianId?: number;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    notes?: string;
    createdBy?: number;

    // Relationships
    livestock?: Livestock;
    medicine?: Medicine;
    disease?: Disease;
    administrationRoute?: AdministrationRoute;
}

export interface Deworming extends BaseEntity {
    livestockId: number;
    livestockUuid?: string;
    medicineId?: number;
    dewormingDate: string;
    dosage?: string;
    administrationRouteId?: number;
    nextDueDate?: string;
    veterinarianId?: number;
    notes?: string;
    createdBy?: number;

    // Relationships
    livestock?: Livestock;
    medicine?: Medicine;
    administrationRoute?: AdministrationRoute;
}

// Form data types
export interface VaccinationFormData {
    livestockId: number;
    vaccineId: number;
    vaccinationDate: string;
    batchNumber?: string;
    dosage?: string;
    administrationRouteId?: number;
    nextDueDate?: string;
    veterinarianId?: number;
    notes?: string;
}

export interface MedicationFormData {
    livestockId: number;
    medicineId?: number;
    diseaseId?: number;
    medicationDate: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
    administrationRouteId?: number;
    veterinarianId?: number;
    severity?: string;
    notes?: string;
}

export interface DewormingFormData {
    livestockId: number;
    medicineId?: number;
    dewormingDate: string;
    dosage?: string;
    administrationRouteId?: number;
    nextDueDate?: string;
    veterinarianId?: number;
    notes?: string;
}
