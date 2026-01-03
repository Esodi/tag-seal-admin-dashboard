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
    livestockId: number;
    livestockUuid?: string;
    sourceFarmId?: number;
    sourceFarmUuid?: string;
    destinationFarmId?: number;
    destinationFarmUuid?: string;
    transferDate: string;
    reason?: string;
    transportMethod?: string;
    notes?: string;
    createdBy?: number;

    livestock?: Livestock;
    sourceFarm?: Farm;
    destinationFarm?: Farm;
}

export interface Disposal extends BaseEntity {
    livestockId: number;
    livestockUuid?: string;
    disposalDate: string;
    disposalTypeId?: number;
    reason?: string;
    salePrice?: number;
    buyerName?: string;
    buyerContact?: string;
    slaughterLocation?: string;
    notes?: string;
    createdBy?: number;

    livestock?: Livestock;
    disposalType?: DisposalType;
}

export interface WeightChange extends BaseEntity {
    livestockId: number;
    livestockUuid?: string;
    recordDate: string;
    weight: number;
    weightUnit?: string;
    notes?: string;
    createdBy?: number;

    livestock?: Livestock;
}

export interface Feeding extends BaseEntity {
    livestockId: number;
    livestockUuid?: string;
    feedingDate: string;
    feedingTypeId?: number;
    feedName?: string;
    quantity?: number;
    quantityUnit?: string;
    cost?: number;
    notes?: string;
    createdBy?: number;

    livestock?: Livestock;
    feedingType?: FeedingType;
}

export interface Milking extends BaseEntity {
    livestockId: number;
    livestockUuid?: string;
    milkingDate: string;
    milkingTime?: 'morning' | 'afternoon' | 'evening';
    quantity: number;
    quantityUnit?: string;
    milkingMethodId?: number;
    quality?: string;
    notes?: string;
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
