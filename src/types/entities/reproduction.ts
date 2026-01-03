import { BaseEntity } from './location';
import { Livestock } from './livestock';

// Reproduction reference data
export interface BirthType extends BaseEntity {
    name: string;
}

export interface BirthProblem extends BaseEntity {
    name: string;
}

export interface CalvingType extends BaseEntity {
    name: string;
}

export interface CalvingProblem extends BaseEntity {
    name: string;
}

export interface HeatType extends BaseEntity {
    name: string;
}

export interface SemenStrawType extends BaseEntity {
    name: string;
}

export interface InseminationService extends BaseEntity {
    name: string;
}

export interface ReproductiveProblem extends BaseEntity {
    name: string;
}

// Reproduction event logs
export interface Pregnancy extends BaseEntity {
    livestockId: number;
    livestockUuid?: string;
    conceptionDate?: string;
    expectedDeliveryDate?: string;
    actualDeliveryDate?: string;
    status: 'confirmed' | 'suspected' | 'delivered' | 'aborted';
    fatherUuid?: string;
    inseminationId?: number;
    notes?: string;
    createdBy?: number;

    livestock?: Livestock;
    father?: Livestock;
}

export interface BirthEvent extends BaseEntity {
    livestockId: number;  // Mother
    livestockUuid?: string;
    birthDate: string;
    birthTypeId?: number;
    birthProblemId?: number;
    offspringCount: number;
    maleCount?: number;
    femaleCount?: number;
    stillbornCount?: number;
    assistanceRequired: boolean;
    notes?: string;
    createdBy?: number;

    livestock?: Livestock;  // Mother
    birthType?: BirthType;
    birthProblem?: BirthProblem;
}

export interface Calving extends BaseEntity {
    livestockId: number;  // Mother cow
    livestockUuid?: string;
    calvingDate: string;
    calvingTypeId?: number;
    calvingProblemId?: number;
    calfCount: number;
    maleCalfCount?: number;
    femaleCalfCount?: number;
    stillbornCount?: number;
    assistanceRequired: boolean;
    notes?: string;
    createdBy?: number;

    livestock?: Livestock;
    calvingType?: CalvingType;
    calvingProblem?: CalvingProblem;
}

export interface Insemination extends BaseEntity {
    livestockId: number;
    livestockUuid?: string;
    inseminationDate: string;
    inseminationServiceId?: number;
    semenStrawTypeId?: number;
    sireId?: string;  // Sire identifier/name
    technicianId?: number;
    heatTypeId?: number;
    successful?: boolean;
    notes?: string;
    createdBy?: number;

    livestock?: Livestock;
    inseminationService?: InseminationService;
    semenStrawType?: SemenStrawType;
    heatType?: HeatType;
}

export interface AbortedPregnancy extends BaseEntity {
    pregnancyId?: number;
    livestockId: number;
    livestockUuid?: string;
    abortionDate: string;
    reason?: string;
    gestationStage?: string;
    reproductiveProblemId?: number;
    notes?: string;
    createdBy?: number;

    pregnancy?: Pregnancy;
    livestock?: Livestock;
    reproductiveProblem?: ReproductiveProblem;
}

export interface Dryoff extends BaseEntity {
    livestockId: number;
    livestockUuid?: string;
    dryoffDate: string;
    reason?: string;
    expectedCalvingDate?: string;
    notes?: string;
    createdBy?: number;

    livestock?: Livestock;
}

// Form data types
export interface PregnancyFormData {
    livestockId: number;
    conceptionDate?: string;
    expectedDeliveryDate?: string;
    status?: string;
    fatherUuid?: string;
    inseminationId?: number;
    notes?: string;
}

export interface BirthEventFormData {
    livestockId: number;
    birthDate: string;
    birthTypeId?: number;
    birthProblemId?: number;
    offspringCount: number;
    maleCount?: number;
    femaleCount?: number;
    stillbornCount?: number;
    assistanceRequired?: boolean;
    notes?: string;
}

export interface InseminationFormData {
    livestockId: number;
    inseminationDate: string;
    inseminationServiceId?: number;
    semenStrawTypeId?: number;
    sireId?: string;
    technicianId?: number;
    heatTypeId?: number;
    notes?: string;
}
