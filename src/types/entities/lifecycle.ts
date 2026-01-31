import { BaseEntity } from './location';
import { Livestock } from './livestock';
import { Farm } from './farm';

// Lifecycle reference data
export interface DisposalType extends BaseEntity {
    name: string;
}

export interface FeedingType extends BaseEntity {
    name: string;
}

export interface MilkingMethod extends BaseEntity {
    name: string;
}

export interface TestResult extends BaseEntity {
    name: string;
}

// Lifecycle event logs
export interface Transfer extends BaseEntity {
    uuid: string;
    farmUuid: string;
    livestockUuid: string;
    toFarmUuid: string;
    transporterId?: string;
    reason?: string;
    price?: number;
    transferDate: string;
    eventDate: string;
    remarks?: string;
    status: 'active' | 'pending' | 'completed' | 'cancelled';
    createdBy?: number;

    livestock?: Livestock;
    sourceFarm?: Farm;
    destinationFarm?: Farm;
}

export interface Disposal extends BaseEntity {
    uuid: string;
    farmUuid: string;
    livestockUuid: string;
    disposalTypeId: number;
    reasons: string;
    remarks: string;
    eventDate: string;
    status: 'pending' | 'completed' | 'failed';
    createdBy?: number;

    livestock?: Livestock;
    disposalType?: DisposalType;
}

export interface WeightChange extends BaseEntity {
    uuid: string;
    farmUuid: string;
    livestockUuid: string;
    eventDate: string;
    weight: number;
    weightUnit?: string;
    remarks?: string;
    createdBy?: number;

    livestock?: Livestock;
}

export interface Feeding extends BaseEntity {
    uuid: string;
    farmUuid: string;
    livestockUuid: string;
    feedingTypeId: number;
    nextFeedingTime: string;
    amount: string;
    remarks?: string;
    eventDate?: string;
    createdBy?: number;

    livestock?: Livestock;
    feedingType?: FeedingType;
}

export interface Milking extends BaseEntity {
    uuid: string;
    farmUuid: string;
    livestockUuid: string;
    milkingMethodId?: number;
    amount: string;
    lactometerReading?: string;
    solid?: string;
    solidNonFat?: string;
    protein?: string;
    correctedLactometerReading?: string;
    totalSolids?: string;
    colonyFormingUnits?: string;
    acidity?: string;
    session: 'morning' | 'evening' | 'night' | 'midnight';
    status: 'pending' | 'not-active' | 'active';
    eventDate?: string;
    createdBy?: number;

    livestock?: Livestock;
    milkingMethod?: MilkingMethod;
}

// Form data types
export interface TransferFormData {
    livestockId: number;
    sourceFarmUuid?: string;
    destinationFarmUuid: string;
    transferDate: string;
    reason?: string;
    transportMethod?: string;
    notes?: string;
}

export interface DisposalFormData {
    livestockId: number;
    disposalDate: string;
    disposalTypeId?: number;
    reason?: string;
    salePrice?: number;
    buyerName?: string;
    buyerContact?: string;
    slaughterLocation?: string;
    notes?: string;
}

export interface WeightChangeFormData {
    livestockId: number;
    recordDate: string;
    weight: number;
    weightUnit?: string;
    notes?: string;
}

export interface FeedingFormData {
    livestockId: number;
    feedingDate: string;
    feedingTypeId?: number;
    feedName?: string;
    quantity?: number;
    quantityUnit?: string;
    cost?: number;
    notes?: string;
}

export interface MilkingFormData {
    livestockId: number;
    milkingDate: string;
    milkingTime?: string;
    quantity: number;
    quantityUnit?: string;
    milkingMethodId?: number;
    quality?: string;
    notes?: string;
}
