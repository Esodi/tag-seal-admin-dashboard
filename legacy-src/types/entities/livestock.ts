import { BaseEntity } from './location';

// Livestock reference data
export interface Specie extends BaseEntity {
    name: string;
}

export interface Breed extends BaseEntity {
    name: string;
    speciesId?: number;
    species?: Specie;
}

export interface LivestockType extends BaseEntity {
    name: string;
}

export interface LivestockObtainedMethod extends BaseEntity {
    name: string;
}

export interface Stage extends BaseEntity {
    name: string;
}

// Main livestock entity
export interface Livestock extends BaseEntity {
    uuid: string;
    farmUuid: string;
    identificationNumber?: string;
    dummyTagId?: string;
    barcodeTagId?: string;
    rfidTagId?: string;
    name?: string;
    dateOfBirth?: string;
    motherUuid?: string;
    fatherUuid?: string;
    gender: 'male' | 'female';
    breedId?: number;
    speciesId?: number;
    livestockTypeId?: number;
    livestockObtainedMethodId?: number;
    status: 'Alive' | 'Active' | 'Dead' | 'Sold' | 'Transferred' | 'Slaughtered';
    dateFirstEnteredToFarm?: string;
    weightAsOnRegistration?: number;
    primaryColor?: string;
    secondaryColor?: string;

    // Relationships (when loaded)
    farm?: import('./farm').Farm;
    breed?: Breed;
    species?: Specie;
    livestockType?: LivestockType;
    livestockObtainedMethod?: LivestockObtainedMethod;
    mother?: Livestock;
    father?: Livestock;
}

// Form data for creating/editing livestock
export interface LivestockFormData {
    farmUuid: string;
    identificationNumber?: string;
    dummyTagId?: string;
    barcodeTagId?: string;
    rfidTagId?: string;
    name?: string;
    dateOfBirth?: string;
    motherUuid?: string;
    fatherUuid?: string;
    gender: 'male' | 'female';
    breedId?: number;
    speciesId?: number;
    livestockTypeId?: number;
    livestockObtainedMethodId?: number;
    status?: string;
    dateFirstEnteredToFarm?: string;
    weightAsOnRegistration?: number;
    primaryColor?: string;
    secondaryColor?: string;
}
