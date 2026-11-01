import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Beef,
    Building2,
    Users,
    Syringe,
    Heart,
    Scale,
    ArrowRightLeft,
    Droplets,
    Wheat,
    Baby,
    Bug,
    Filter,
    X,
    ScrollText,
    Loader2,
    AlertCircle,
    FileText,
    FileSpreadsheet,
    FileDown,
    ChevronRight,
    RefreshCw,
    Archive,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { DataTable, DataTableColumn } from '../components/crud/DataTable';
import {
    livestockApi,
    farmApi,
    userApi,
    healthLogApi,
    reproductionLogApi,
    lifecycleLogApi,
    referenceApi,
    vaccineEntityApi,
    syncApi,
} from '../services/api';
import { formatDate, formatNumber, cn } from '../lib/utils';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface RefMaps {
    speciesMap: Map<number | string, string>;
    breedsMap: Map<number | string, string>;
    diseaseMap: Map<number | string, string>;
    vaccineMap: Map<number | string, string>;
    medicineMap: Map<number | string, string>;
    disposalTypeMap: Map<number | string, string>;
    feedingTypeMap: Map<number | string, string>;
    administrationRouteMap: Map<number | string, string>;
}

type ReportCategory = 'Livestock' | 'Health' | 'Reproduction' | 'Production' | 'Finance' | 'Users';

interface SummaryStat {
    label: string;
    value: string;
    accent?: string; // tailwind text color class e.g. 'text-green-600'
}

interface ReportDefinition {
    id: string;
    name: string;
    category: ReportCategory;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    fetchData: () => Promise<any[]>;
    buildColumns: (refMaps: RefMaps) => DataTableColumn<any>[];
    /** Primary date field name (camelCase) used for range filtering */
    dateField?: string;
    /** Compute summary stat badges from filtered data */
    summaryFn?: (data: any[], refMaps: RefMaps) => SummaryStat[];
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const EMPTY_REFS: RefMaps = {
    speciesMap: new Map(),
    breedsMap: new Map(),
    diseaseMap: new Map(),
    vaccineMap: new Map(),
    medicineMap: new Map(),
    disposalTypeMap: new Map(),
    feedingTypeMap: new Map(),
    administrationRouteMap: new Map(),
};

const CATEGORY_STYLE: Record<ReportCategory, {
    border: string;
    iconBg: string;
    iconText: string;
    badge: string;
    tabActive: string;
}> = {
    Livestock:    { border: 'border-l-blue-500',    iconBg: 'bg-blue-50 dark:bg-blue-900/20',    iconText: 'text-blue-600 dark:text-blue-400',    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',    tabActive: 'bg-blue-600 text-white' },
    Health:       { border: 'border-l-emerald-500', iconBg: 'bg-emerald-50 dark:bg-emerald-900/20', iconText: 'text-emerald-600 dark:text-emerald-400', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300', tabActive: 'bg-emerald-600 text-white' },
    Reproduction: { border: 'border-l-rose-500',    iconBg: 'bg-rose-50 dark:bg-rose-900/20',    iconText: 'text-rose-600 dark:text-rose-400',    badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',    tabActive: 'bg-rose-600 text-white' },
    Production:   { border: 'border-l-amber-500',   iconBg: 'bg-amber-50 dark:bg-amber-900/20',   iconText: 'text-amber-600 dark:text-amber-400',   badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',   tabActive: 'bg-amber-600 text-white' },
    Finance:      { border: 'border-l-teal-500',    iconBg: 'bg-teal-50 dark:bg-teal-900/20',    iconText: 'text-teal-600 dark:text-teal-400',    badge: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',    tabActive: 'bg-teal-600 text-white' },
    Users:        { border: 'border-l-violet-500',  iconBg: 'bg-violet-50 dark:bg-violet-900/20',  iconText: 'text-violet-600 dark:text-violet-400',  badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',  tabActive: 'bg-violet-600 text-white' },
};

const ALL_CATEGORIES: Array<'all' | ReportCategory> = [
    'all', 'Livestock', 'Health', 'Reproduction', 'Production', 'Finance', 'Users',
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Safely read a date value from multiple possible field names, return formatted string */
function safeDate(row: any, ...fields: string[]): string {
    for (const f of fields) {
        const val = row[f] ?? row[f.replace(/([A-Z])/g, '_$1').toLowerCase()];
        if (val) {
            try { return formatDate(val); } catch { /* continue */ }
        }
    }
    return '—';
}

/** Truncate a UUID/long string for display */
function truncUuid(val: string | undefined | null): string {
    if (!val) return '—';
    const s = String(val);
    return s.length > 10 ? s.slice(0, 8) + '…' : s;
}

/** Resolve an ID to a name from a reference map, with fallback to nested relationship */
function lookupName(
    row: any,
    map: Map<number | string, string>,
    idField: string,
    nestedField?: string,
): string {
    if (nestedField) {
        const parts = nestedField.split('.');
        let obj: any = row;
        for (const p of parts) { obj = obj?.[p]; }
        if (typeof obj === 'string' && obj) return obj;
    }
    const rawId = row[idField] ?? row[idField.replace(/([A-Z])/g, '_$1').toLowerCase()];
    if (rawId != null) {
        const found = map.get(Number(rawId)) ?? map.get(String(rawId));
        if (found) return found;
    }
    return '—';
}

/** Extract a comparable Date from a row for range filtering */
function getRowDate(row: any, dateField: string): Date | null {
    const snake = dateField.replace(/([A-Z])/g, '_$1').toLowerCase();
    const val = row[dateField] ?? row[snake] ?? row.created_at;
    if (!val) return null;
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
}

// ─── Report Definitions ────────────────────────────────────────────────────────

const REPORTS: ReportDefinition[] = [
    // ── 1. Livestock Inventory ──────────────────────────────────────────────
    {
        id: 'livestock',
        name: 'Livestock Inventory',
        category: 'Livestock',
        description: 'Full registry of all animals with species, breed, gender, and current status.',
        icon: Beef,
        fetchData: () => livestockApi.list(),
        dateField: 'created_at',
        buildColumns: ({ speciesMap, breedsMap }) => [
            {
                id: 'tag', header: 'Tag ID',
                accessorFn: (r: any) =>
                    r.identificationNumber ?? r.identification_number ?? r.barcodeTagId ?? r.barcode_tag_id ?? '—',
            },
            { id: 'name', header: 'Name', accessorFn: (r: any) => r.name || '—' },
            {
                id: 'species', header: 'Species',
                accessorFn: (r: any) =>
                    r.species?.name ?? speciesMap.get(Number(r.speciesId ?? r.species_id)) ?? '—',
            },
            {
                id: 'breed', header: 'Breed',
                accessorFn: (r: any) =>
                    r.breed?.name ?? breedsMap.get(Number(r.breedId ?? r.breed_id)) ?? '—',
            },
            { id: 'gender', header: 'Gender', accessorFn: (r: any) => r.gender || '—' },
            { id: 'status', header: 'Status', accessorFn: (r: any) => r.status || '—' },
            {
                id: 'dob', header: 'Date of Birth',
                accessorFn: (r: any) => safeDate(r, 'dateOfBirth', 'date_of_birth'),
            },
            {
                id: 'farm', header: 'Farm UUID',
                accessorFn: (r: any) => truncUuid(r.farmUuid ?? r.farm_uuid),
            },
            {
                id: 'registered', header: 'Registered',
                accessorFn: (r: any) => safeDate(r, 'created_at'),
            },
        ],
        summaryFn: (data) => {
            const alive = data.filter((r: any) => ['alive', 'active'].includes((r.status ?? '').toLowerCase())).length;
            const dead = data.filter((r: any) => (r.status ?? '').toLowerCase() === 'dead').length;
            const gone = data.filter((r: any) => ['sold', 'transferred', 'slaughtered'].includes((r.status ?? '').toLowerCase())).length;
            return [
                { label: 'Total Animals', value: formatNumber(data.length) },
                { label: 'Alive / Active', value: formatNumber(alive), accent: 'text-emerald-600 dark:text-emerald-400' },
                { label: 'Deceased', value: formatNumber(dead), accent: 'text-red-600 dark:text-red-400' },
                { label: 'Sold / Transferred', value: formatNumber(gone), accent: 'text-amber-600 dark:text-amber-400' },
            ];
        },
    },

    // ── 2. Farm Directory ───────────────────────────────────────────────────
    {
        id: 'farms',
        name: 'Farm Directory',
        category: 'Livestock',
        description: 'All registered farms with size, type, and registration details.',
        icon: Building2,
        fetchData: () => farmApi.list(),
        dateField: 'created_at',
        buildColumns: () => [
            { id: 'name', header: 'Farm Name', accessorFn: (r: any) => r.name || '—' },
            {
                id: 'ref', header: 'Reference No',
                accessorFn: (r: any) => r.referenceNo ?? r.reference_no ?? '—',
            },
            {
                id: 'type', header: 'Farm Type',
                accessorFn: (r: any) => r.farmType ?? r.farm_type ?? '—',
            },
            {
                id: 'size', header: 'Size',
                accessorFn: (r: any) => {
                    const s = r.size ?? r.totalArea ?? r.total_area;
                    const u = r.sizeUnit ?? r.size_unit ?? '';
                    return s ? `${s} ${u}`.trim() : '—';
                },
            },
            { id: 'status', header: 'Status', accessorFn: (r: any) => r.status || '—' },
            {
                id: 'registered', header: 'Registered',
                accessorFn: (r: any) => safeDate(r, 'created_at'),
            },
        ],
        summaryFn: (data) => [
            { label: 'Total Farms', value: formatNumber(data.length) },
            {
                label: 'Active',
                value: formatNumber(data.filter((r: any) => (r.status ?? '').toLowerCase() === 'active').length),
                accent: 'text-emerald-600 dark:text-emerald-400',
            },
            {
                label: 'Inactive',
                value: formatNumber(data.filter((r: any) => (r.status ?? '').toLowerCase() !== 'active').length),
                accent: 'text-slate-500',
            },
        ],
    },

    // ── 3. System User Audit ────────────────────────────────────────────────
    {
        id: 'users',
        name: 'System User Audit',
        category: 'Users',
        description: 'All administrative and field users with roles, status, and registration date.',
        icon: Users,
        fetchData: () => userApi.list(),
        dateField: 'created_at',
        buildColumns: () => [
            { id: 'username', header: 'Username', accessorFn: (r: any) => r.username || '—' },
            {
                id: 'name', header: 'Full Name',
                accessorFn: (r: any) => {
                    const parts = [
                        r.firstName ?? r.first_name,
                        r.surname ?? r.lastName ?? r.last_name,
                    ].filter(Boolean);
                    return parts.join(' ') || r.username || '—';
                },
            },
            { id: 'email', header: 'Email', accessorFn: (r: any) => r.email || '—' },
            { id: 'role', header: 'Role', accessorFn: (r: any) => r.role || '—' },
            { id: 'status', header: 'Status', accessorFn: (r: any) => r.status || '—' },
            { id: 'created', header: 'Created', accessorFn: (r: any) => safeDate(r, 'created_at') },
        ],
        summaryFn: (data) => {
            const roles: Record<string, number> = {};
            data.forEach((r: any) => { roles[r.role ?? 'unknown'] = (roles[r.role ?? 'unknown'] ?? 0) + 1; });
            return [
                { label: 'Total Users', value: formatNumber(data.length) },
                {
                    label: 'Active',
                    value: formatNumber(data.filter((r: any) => (r.status ?? '').toLowerCase() === 'active').length),
                    accent: 'text-emerald-600 dark:text-emerald-400',
                },
                {
                    label: 'Inactive',
                    value: formatNumber(data.filter((r: any) => (r.status ?? '').toLowerCase() !== 'active').length),
                    accent: 'text-red-600 dark:text-red-400',
                },
            ];
        },
    },

    // ── 4. Vaccination History ──────────────────────────────────────────────
    {
        id: 'vaccinations',
        name: 'Vaccination History',
        category: 'Health',
        description: 'All vaccination events with resolved vaccine and disease names.',
        icon: Syringe,
        fetchData: () => healthLogApi.vaccinations.list(),
        dateField: 'eventDate',
        buildColumns: ({ diseaseMap, vaccineMap }) => [
            {
                id: 'date', header: 'Date',
                accessorFn: (r: any) => safeDate(r, 'eventDate', 'vaccinationDate', 'vaccination_date', 'created_at'),
            },
            {
                id: 'vacc_no', header: 'Vaccination No',
                accessorFn: (r: any) => r.vaccinationNo ?? r.vaccination_no ?? '—',
            },
            {
                id: 'livestock', header: 'Livestock UUID',
                accessorFn: (r: any) => truncUuid(r.livestockUuid ?? r.livestock_uuid),
            },
            {
                id: 'vaccine', header: 'Vaccine',
                accessorFn: (r: any) => lookupName(r, vaccineMap, 'vaccineId', 'vaccine.name'),
            },
            {
                id: 'disease', header: 'Disease',
                accessorFn: (r: any) => lookupName(r, diseaseMap, 'diseaseId', 'disease.name'),
            },
            {
                id: 'batch', header: 'Batch No',
                accessorFn: (r: any) => r.batchNumber ?? r.batch_number ?? '—',
            },
            {
                id: 'dose', header: 'Dose',
                accessorFn: (r: any) => r.dose ?? r.dosage ?? '—',
            },
            { id: 'status', header: 'Status', accessorFn: (r: any) => r.status || '—' },
        ],
        summaryFn: (data) => {
            const uniqueAnimals = new Set(
                data.map((r: any) => r.livestockUuid ?? r.livestock_uuid).filter(Boolean)
            ).size;
            const uniqueVaccines = new Set(
                data.map((r: any) => r.vaccineId ?? r.vaccine_id).filter(Boolean)
            ).size;
            return [
                { label: 'Total Events', value: formatNumber(data.length) },
                { label: 'Animals Vaccinated', value: formatNumber(uniqueAnimals), accent: 'text-emerald-600 dark:text-emerald-400' },
                { label: 'Vaccine Types Used', value: formatNumber(uniqueVaccines) },
            ];
        },
    },

    // ── 5. Treatment Log ────────────────────────────────────────────────────
    {
        id: 'treatments',
        name: 'Treatment Log',
        category: 'Health',
        description: 'Medical treatment records with resolved disease and medicine names, including severity.',
        icon: Heart,
        fetchData: () => healthLogApi.treatments.list(),
        dateField: 'medicationDate',
        buildColumns: ({ diseaseMap, medicineMap }) => [
            {
                id: 'date', header: 'Date',
                accessorFn: (r: any) => safeDate(r, 'medicationDate', 'medication_date', 'created_at'),
            },
            {
                id: 'livestock', header: 'Livestock UUID',
                accessorFn: (r: any) => truncUuid(r.livestockUuid ?? r.livestock_uuid),
            },
            {
                id: 'disease', header: 'Disease',
                accessorFn: (r: any) => lookupName(r, diseaseMap, 'diseaseId', 'disease.name'),
            },
            {
                id: 'medicine', header: 'Medicine',
                accessorFn: (r: any) => lookupName(r, medicineMap, 'medicineId', 'medicine.name'),
            },
            { id: 'severity', header: 'Severity', accessorFn: (r: any) => r.severity || '—' },
            {
                id: 'farm', header: 'Farm UUID',
                accessorFn: (r: any) => truncUuid(r.farmUuid ?? r.farm_uuid),
            },
        ],
        summaryFn: (data) => {
            const critical = data.filter((r: any) =>
                ['critical', 'high'].includes((r.severity ?? '').toLowerCase())
            ).length;
            return [
                { label: 'Total Treatments', value: formatNumber(data.length) },
                {
                    label: 'Unique Animals',
                    value: formatNumber(
                        new Set(data.map((r: any) => r.livestockUuid ?? r.livestock_uuid).filter(Boolean)).size
                    ),
                },
                { label: 'Critical / High', value: formatNumber(critical), accent: critical > 0 ? 'text-red-600 dark:text-red-400' : undefined },
            ];
        },
    },

    // ── 6. Deworming Records ────────────────────────────────────────────────
    {
        id: 'dewormings',
        name: 'Deworming Records',
        category: 'Health',
        description: 'All deworming events with medicine, dosage, and administration route.',
        icon: Bug,
        fetchData: () => healthLogApi.dewormings.list(),
        dateField: 'eventDate',
        buildColumns: ({ medicineMap, administrationRouteMap }) => [
            {
                id: 'date', header: 'Date',
                accessorFn: (r: any) => safeDate(r, 'eventDate', 'created_at'),
            },
            {
                id: 'livestock', header: 'Livestock UUID',
                accessorFn: (r: any) => truncUuid(r.livestockUuid ?? r.livestock_uuid),
            },
            {
                id: 'medicine', header: 'Medicine',
                accessorFn: (r: any) => lookupName(r, medicineMap, 'medicineId', 'medicine.name'),
            },
            { id: 'dose', header: 'Dose', accessorFn: (r: any) => r.dose ?? r.dosage ?? '—' },
            { id: 'qty', header: 'Quantity', accessorFn: (r: any) => r.quantity ?? '—' },
            {
                id: 'route', header: 'Admin. Route',
                accessorFn: (r: any) =>
                    lookupName(r, administrationRouteMap, 'administrationRouteId', 'administrationRoute.name'),
            },
            {
                id: 'farm', header: 'Farm UUID',
                accessorFn: (r: any) => truncUuid(r.farmUuid ?? r.farm_uuid),
            },
        ],
        summaryFn: (data) => [
            { label: 'Total Events', value: formatNumber(data.length) },
            {
                label: 'Unique Animals',
                value: formatNumber(
                    new Set(data.map((r: any) => r.livestockUuid ?? r.livestock_uuid).filter(Boolean)).size
                ),
            },
        ],
    },

    // ── 7. Milk Production Log ──────────────────────────────────────────────
    {
        id: 'milkings',
        name: 'Milk Production Log',
        category: 'Production',
        description: 'Daily milking records showing total yield per animal and session.',
        icon: Droplets,
        fetchData: () => lifecycleLogApi.milkings.list(),
        dateField: 'milkingDate',
        buildColumns: () => [
            {
                id: 'date', header: 'Date',
                accessorFn: (r: any) => safeDate(r, 'milkingDate', 'milking_date', 'eventDate', 'created_at'),
            },
            {
                id: 'livestock', header: 'Livestock UUID',
                accessorFn: (r: any) => truncUuid(r.livestockUuid ?? r.livestock_uuid),
            },
            {
                id: 'quantity', header: 'Quantity (L)',
                accessorFn: (r: any) =>
                    r.quantityInLitres ?? r.quantity_in_litres ?? r.quantity ?? '—',
            },
            {
                id: 'farm', header: 'Farm UUID',
                accessorFn: (r: any) => truncUuid(r.farmUuid ?? r.farm_uuid),
            },
        ],
        summaryFn: (data) => {
            const total = data.reduce(
                (sum: number, r: any) =>
                    sum + Number(r.quantityInLitres ?? r.quantity_in_litres ?? r.quantity ?? 0),
                0
            );
            const avg = data.length > 0 ? total / data.length : 0;
            return [
                { label: 'Total Sessions', value: formatNumber(data.length) },
                { label: 'Total Yield', value: `${formatNumber(Math.round(total))} L`, accent: 'text-blue-600 dark:text-blue-400' },
                { label: 'Avg per Session', value: avg > 0 ? `${avg.toFixed(1)} L` : '—' },
            ];
        },
    },

    // ── 8. Weight Tracking ──────────────────────────────────────────────────
    {
        id: 'weight-changes',
        name: 'Weight Tracking',
        category: 'Production',
        description: 'Per-animal weight measurements over time to monitor growth performance.',
        icon: Scale,
        fetchData: () => lifecycleLogApi.weightChanges.list(),
        dateField: 'weightDate',
        buildColumns: () => [
            {
                id: 'date', header: 'Date',
                accessorFn: (r: any) => safeDate(r, 'weightDate', 'weight_date', 'created_at'),
            },
            {
                id: 'livestock', header: 'Livestock UUID',
                accessorFn: (r: any) => truncUuid(r.livestockUuid ?? r.livestock_uuid),
            },
            { id: 'weight', header: 'Weight', accessorFn: (r: any) => r.weight ?? '—' },
            {
                id: 'unit', header: 'Unit',
                accessorFn: (r: any) => r.weightUnit ?? r.weight_unit ?? r.unit ?? 'kg',
            },
            {
                id: 'farm', header: 'Farm UUID',
                accessorFn: (r: any) => truncUuid(r.farmUuid ?? r.farm_uuid),
            },
        ],
        summaryFn: (data) => {
            const weights = data
                .map((r: any) => Number(r.weight))
                .filter((w) => !isNaN(w) && w > 0);
            const avg = weights.length > 0 ? weights.reduce((a, b) => a + b, 0) / weights.length : 0;
            const max = weights.length > 0 ? Math.max(...weights) : 0;
            return [
                { label: 'Total Records', value: formatNumber(data.length) },
                { label: 'Avg Weight', value: avg > 0 ? `${avg.toFixed(1)} kg` : '—' },
                { label: 'Max Recorded', value: max > 0 ? `${max} kg` : '—', accent: 'text-emerald-600 dark:text-emerald-400' },
            ];
        },
    },

    // ── 9. Livestock Disposals ──────────────────────────────────────────────
    {
        id: 'disposals',
        name: 'Livestock Disposals',
        category: 'Production',
        description: 'Sold, slaughtered, or deceased livestock with disposal type and amount.',
        icon: Archive,
        fetchData: () => lifecycleLogApi.disposals.list(),
        dateField: 'disposalDate',
        buildColumns: ({ disposalTypeMap }) => [
            {
                id: 'date', header: 'Date',
                accessorFn: (r: any) => safeDate(r, 'disposalDate', 'disposal_date', 'created_at'),
            },
            {
                id: 'livestock', header: 'Livestock UUID',
                accessorFn: (r: any) => truncUuid(r.livestockUuid ?? r.livestock_uuid),
            },
            {
                id: 'type', header: 'Disposal Type',
                accessorFn: (r: any) => lookupName(r, disposalTypeMap, 'disposalTypeId', 'disposalType.name'),
            },
            { id: 'amount', header: 'Amount', accessorFn: (r: any) => r.amount ?? r.price ?? '—' },
            { id: 'notes', header: 'Notes', accessorFn: (r: any) => r.notes || '—' },
            {
                id: 'farm', header: 'Farm UUID',
                accessorFn: (r: any) => truncUuid(r.farmUuid ?? r.farm_uuid),
            },
        ],
        summaryFn: (data) => [
            { label: 'Total Disposals', value: formatNumber(data.length) },
            {
                label: 'Unique Animals',
                value: formatNumber(
                    new Set(data.map((r: any) => r.livestockUuid ?? r.livestock_uuid).filter(Boolean)).size
                ),
            },
        ],
    },

    // ── 10. Transfer History ────────────────────────────────────────────────
    {
        id: 'transfers',
        name: 'Transfer History',
        category: 'Production',
        description: 'All livestock movements between farms with source and destination.',
        icon: ArrowRightLeft,
        fetchData: () => lifecycleLogApi.transfers.list(),
        dateField: 'transferDate',
        buildColumns: () => [
            {
                id: 'date', header: 'Date',
                accessorFn: (r: any) => safeDate(r, 'transferDate', 'transfer_date', 'created_at'),
            },
            {
                id: 'livestock', header: 'Livestock UUID',
                accessorFn: (r: any) => truncUuid(r.livestockUuid ?? r.livestock_uuid),
            },
            {
                id: 'from', header: 'From Farm',
                accessorFn: (r: any) =>
                    truncUuid(r.sourceFarmUuid ?? r.source_farm_uuid ?? r.fromFarmUuid ?? r.from_farm_uuid),
            },
            {
                id: 'to', header: 'To Farm',
                accessorFn: (r: any) =>
                    truncUuid(r.destinationFarmUuid ?? r.destination_farm_uuid ?? r.toFarmUuid ?? r.to_farm_uuid),
            },
            { id: 'status', header: 'Status', accessorFn: (r: any) => r.status || '—' },
        ],
        summaryFn: (data) => [
            { label: 'Total Transfers', value: formatNumber(data.length) },
            {
                label: 'Unique Animals',
                value: formatNumber(
                    new Set(data.map((r: any) => r.livestockUuid ?? r.livestock_uuid).filter(Boolean)).size
                ),
            },
        ],
    },

    // ── 11. Feed Consumption Log ────────────────────────────────────────────
    {
        id: 'feedings',
        name: 'Feed Consumption Log',
        category: 'Production',
        description: 'Feeding events per animal with feed type, quantity, and frequency.',
        icon: Wheat,
        fetchData: () => lifecycleLogApi.feedings.list(),
        dateField: 'feedingDate',
        buildColumns: ({ feedingTypeMap }) => [
            {
                id: 'date', header: 'Date',
                accessorFn: (r: any) => safeDate(r, 'feedingDate', 'feeding_date', 'created_at'),
            },
            {
                id: 'livestock', header: 'Livestock UUID',
                accessorFn: (r: any) => truncUuid(r.livestockUuid ?? r.livestock_uuid),
            },
            {
                id: 'type', header: 'Feed Type',
                accessorFn: (r: any) => lookupName(r, feedingTypeMap, 'feedingTypeId', 'feedingType.name'),
            },
            { id: 'quantity', header: 'Quantity', accessorFn: (r: any) => r.quantity ?? '—' },
            { id: 'unit', header: 'Unit', accessorFn: (r: any) => r.unit || '—' },
            {
                id: 'farm', header: 'Farm UUID',
                accessorFn: (r: any) => truncUuid(r.farmUuid ?? r.farm_uuid),
            },
        ],
        summaryFn: (data) => [
            { label: 'Total Events', value: formatNumber(data.length) },
            {
                label: 'Unique Animals',
                value: formatNumber(
                    new Set(data.map((r: any) => r.livestockUuid ?? r.livestock_uuid).filter(Boolean)).size
                ),
            },
        ],
    },

    // ── 12. Birth Events Log ────────────────────────────────────────────────
    {
        id: 'births',
        name: 'Birth Events Log',
        category: 'Reproduction',
        description: 'Recorded births with mother, live births, and stillbirth counts.',
        icon: Baby,
        fetchData: () => reproductionLogApi.birthEvents.list(),
        dateField: 'birthDate',
        buildColumns: () => [
            {
                id: 'date', header: 'Date',
                accessorFn: (r: any) => safeDate(r, 'birthDate', 'birth_date', 'eventDate', 'created_at'),
            },
            {
                id: 'mother', header: 'Mother UUID',
                accessorFn: (r: any) =>
                    truncUuid(r.motherUuid ?? r.livestockUuid ?? r.livestock_uuid),
            },
            {
                id: 'birth_type', header: 'Birth Type',
                accessorFn: (r: any) =>
                    r.birthType?.name ?? r.birth_type?.name ?? '—',
            },
            {
                id: 'live', header: 'Live Births',
                accessorFn: (r: any) => r.liveBirths ?? r.live_births ?? '—',
            },
            {
                id: 'still', header: 'Stillbirths',
                accessorFn: (r: any) => r.stillBirths ?? r.still_births ?? '—',
            },
            {
                id: 'farm', header: 'Farm UUID',
                accessorFn: (r: any) => truncUuid(r.farmUuid ?? r.farm_uuid),
            },
        ],
        summaryFn: (data) => {
            const totalLive = data.reduce(
                (sum: number, r: any) => sum + Number(r.liveBirths ?? r.live_births ?? 0), 0
            );
            const totalStill = data.reduce(
                (sum: number, r: any) => sum + Number(r.stillBirths ?? r.still_births ?? 0), 0
            );
            return [
                { label: 'Total Events', value: formatNumber(data.length) },
                { label: 'Live Births', value: formatNumber(totalLive), accent: 'text-emerald-600 dark:text-emerald-400' },
                { label: 'Stillbirths', value: formatNumber(totalStill), accent: totalStill > 0 ? 'text-red-600 dark:text-red-400' : undefined },
            ];
        },
    },
];

function buildFinanceReports(userId: number | null): ReportDefinition[] {
    const fetchUserSpecificData = async (key: 'bills' | 'financeExpenses') => {
        if (!userId) return [];

        const response = await syncApi.splashSync(userId);
        const userSpecificData = response?.userSpecificData ?? {};
        const directValue = response?.[key];

        if (Array.isArray(directValue)) {
            return directValue;
        }

        const nestedValue = userSpecificData[key];
        return Array.isArray(nestedValue) ? nestedValue : [];
    };

    return [
        {
            id: 'income-expenditure',
            name: 'Income & Expenditure',
            category: 'Finance',
            description: 'Finance records sourced from the backend sync payload, including manual expenses and bill-linked entries.',
            icon: FileSpreadsheet,
            fetchData: () => fetchUserSpecificData('financeExpenses'),
            dateField: 'expenseDate',
            buildColumns: () => [
                { id: 'date', header: 'Date', accessorFn: (r: any) => safeDate(r, 'expenseDate', 'expense_date', 'createdAt', 'created_at') },
                { id: 'source', header: 'Source', accessorFn: (r: any) => r.sourceType ?? r.source_type ?? '—' },
                { id: 'bill', header: 'Bill No', accessorFn: (r: any) => r.billNo ?? r.bill_no ?? '—' },
                { id: 'farm', header: 'Farm UUID', accessorFn: (r: any) => truncUuid(r.farmUuid ?? r.farm_uuid) },
                { id: 'subject', header: 'Subject', accessorFn: (r: any) => r.subjectType ?? r.subject_type ?? '—' },
                { id: 'quantity', header: 'Quantity', accessorFn: (r: any) => r.quantity ?? '—' },
                { id: 'unit_cost', header: 'Unit Cost', accessorFn: (r: any) => r.unitCost ?? r.unit_cost ?? '—' },
                { id: 'total_cost', header: 'Total Cost', accessorFn: (r: any) => r.totalCost ?? r.total_cost ?? '—' },
                { id: 'status', header: 'Status', accessorFn: (r: any) => r.status || '—' },
                { id: 'notes', header: 'Notes', accessorFn: (r: any) => r.notes || '—' },
            ],
            summaryFn: (data) => {
                const total = data.reduce(
                    (sum: number, row: any) => sum + Number(row.totalCost ?? row.total_cost ?? 0),
                    0
                );
                const manualCount = data.filter((row: any) => (row.sourceType ?? row.source_type ?? '') === 'manual').length;
                const billCount = data.filter((row: any) => (row.sourceType ?? row.source_type ?? '') === 'bill').length;
                return [
                    { label: 'Total Records', value: formatNumber(data.length) },
                    { label: 'Total Cost', value: `${formatNumber(Math.round(total))} TZS`, accent: 'text-teal-600 dark:text-teal-400' },
                    { label: 'Manual Entries', value: formatNumber(manualCount) },
                    { label: 'Bill Linked', value: formatNumber(billCount) },
                ];
            },
        },
        {
            id: 'bills',
            name: 'Bills',
            category: 'Finance',
            description: 'Bills returned by the backend sync payload for the authenticated user’s accessible farms.',
            icon: ScrollText,
            fetchData: () => fetchUserSpecificData('bills'),
            dateField: 'createdAt',
            buildColumns: () => [
                { id: 'date', header: 'Date', accessorFn: (r: any) => safeDate(r, 'createdAt', 'created_at', 'updatedAt', 'updated_at') },
                { id: 'bill', header: 'Bill No', accessorFn: (r: any) => r.billNo ?? r.bill_no ?? '—' },
                { id: 'farm', header: 'Farm UUID', accessorFn: (r: any) => truncUuid(r.farmUuid ?? r.farm_uuid) },
                { id: 'subject', header: 'Subject', accessorFn: (r: any) => r.subjectType ?? r.subject_type ?? '—' },
                { id: 'quantity', header: 'Quantity', accessorFn: (r: any) => r.quantity ?? '—' },
                { id: 'amount', header: 'Amount', accessorFn: (r: any) => r.amount ?? '—' },
                { id: 'status', header: 'Status', accessorFn: (r: any) => r.status || '—' },
                { id: 'notes', header: 'Notes', accessorFn: (r: any) => r.notes || '—' },
            ],
            summaryFn: (data) => {
                const total = data.reduce(
                    (sum: number, row: any) => sum + Number(row.amount ?? 0),
                    0
                );
                const pending = data.filter((row: any) => (row.status ?? '').toLowerCase() === 'pending').length;
                const paid = data.filter((row: any) => (row.status ?? '').toLowerCase() === 'paid').length;
                return [
                    { label: 'Total Bills', value: formatNumber(data.length) },
                    { label: 'Total Amount', value: `${formatNumber(Math.round(total))} TZS`, accent: 'text-teal-600 dark:text-teal-400' },
                    { label: 'Pending', value: formatNumber(pending) },
                    { label: 'Paid', value: formatNumber(paid) },
                ];
            },
        },
    ];
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function SummaryStatsBar({ stats }: { stats: SummaryStat[] }) {
    if (!stats.length) return null;
    return (
        <div className="flex flex-wrap gap-3">
            {stats.map((s) => (
                <div
                    key={s.label}
                    className="flex flex-col px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm min-w-[100px]"
                >
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{s.label}</span>
                    <span className={cn('text-xl font-bold mt-0.5 text-slate-900 dark:text-white', s.accent)}>
                        {s.value}
                    </span>
                </div>
            ))}
        </div>
    );
}

function DateRangeFilter({
    dateFrom,
    dateTo,
    onFromChange,
    onToChange,
    onClear,
    hasFilter,
}: {
    dateFrom: string;
    dateTo: string;
    onFromChange: (v: string) => void;
    onToChange: (v: string) => void;
    onClear: () => void;
    hasFilter: boolean;
}) {
    return (
        <div className="flex flex-wrap items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl">
            <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300">
                <Filter className="w-3.5 h-3.5" />
                Date Range
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5">
                    <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">From</label>
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => onFromChange(e.target.value)}
                        className="px-2 py-1 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>
                <div className="flex items-center gap-1.5">
                    <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">To</label>
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => onToChange(e.target.value)}
                        className="px-2 py-1 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>
                {hasFilter && (
                    <button
                        onClick={onClear}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                    >
                        <X className="w-3 h-3" />
                        Clear
                    </button>
                )}
            </div>
            {hasFilter && (
                <span className="text-xs text-primary-600 dark:text-primary-400 font-medium">
                    Filter active — showing date-matched records only
                </span>
            )}
        </div>
    );
}

function ReportCard({
    report,
    onSelect,
}: {
    report: ReportDefinition;
    onSelect: (id: string) => void;
}) {
    const style = CATEGORY_STYLE[report.category];
    const Icon = report.icon;
    return (
        <div
            onClick={() => onSelect(report.id)}
            className={cn(
                'group relative p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700',
                'border-l-4 rounded-xl cursor-pointer transition-all duration-200',
                'hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600',
                style.border
            )}
        >
            {/* Category badge */}
            <span className={cn('absolute top-4 right-4 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider', style.badge)}>
                {report.category}
            </span>

            {/* Icon */}
            <div className={cn('inline-flex p-3 rounded-xl mb-4', style.iconBg)}>
                <Icon className={cn('w-5 h-5', style.iconText)} />
            </div>

            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1.5 pr-16">
                {report.name}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
                {report.description}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between">
                <span className={cn('flex items-center gap-1 text-sm font-medium transition-colors', style.iconText)}>
                    Generate Report
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
                <div className="flex items-center gap-1.5 text-slate-300 dark:text-slate-600">
                    <FileDown className="w-3.5 h-3.5" aria-label="CSV" />
                    <FileSpreadsheet className="w-3.5 h-3.5" aria-label="Excel" />
                    <FileText className="w-3.5 h-3.5" aria-label="PDF" />
                </div>
            </div>
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function ReportsPage() {
    const navigate = useNavigate();
    const { reportId } = useParams<{ reportId?: string }>();
    const { user, isLoading: authLoading } = useAuth();

    // ── Reference data maps ────────────────────────────────────────────────
    const [refMaps, setRefMaps] = useState<RefMaps>(EMPTY_REFS);
    const [refLoading, setRefLoading] = useState(true);

    const loadRefMaps = useCallback(async () => {
        setRefLoading(true);
        try {
            const results = await Promise.allSettled([
                referenceApi.species.list(),
                referenceApi.breeds.list(),
                referenceApi.diseases.list(),
                vaccineEntityApi.list(),
                referenceApi.medicines.list(),
                referenceApi.disposalTypes.list(),
                referenceApi.feedingTypes.list(),
                referenceApi.administrationRoutes.list(),
            ]);

            const toMap = (r: PromiseSettledResult<any[]>): Map<number | string, string> => {
                if (r.status === 'fulfilled') {
                    return new Map(r.value.map((i: any) => [i.id, i.name]));
                }
                return new Map();
            };

            setRefMaps({
                speciesMap:           toMap(results[0]),
                breedsMap:            toMap(results[1]),
                diseaseMap:           toMap(results[2]),
                vaccineMap:           toMap(results[3]),
                medicineMap:          toMap(results[4]),
                disposalTypeMap:      toMap(results[5]),
                feedingTypeMap:       toMap(results[6]),
                administrationRouteMap: toMap(results[7]),
            });
        } finally {
            setRefLoading(false);
        }
    }, []);

    useEffect(() => { loadRefMaps(); }, [loadRefMaps]);

    // ── Report state ───────────────────────────────────────────────────────
    const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
    const [rawData, setRawData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ── Filters ────────────────────────────────────────────────────────────
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<'all' | ReportCategory>('all');

    const reports = useMemo(
        () => [...REPORTS, ...buildFinanceReports(user?.id ?? null)],
        [user?.id]
    );

    // ── Derived ────────────────────────────────────────────────────────────
    const selectedReport = useMemo(
        () => reports.find((r) => r.id === selectedReportId) ?? null,
        [reports, selectedReportId]
    );

    const visibleReports = useMemo(() =>
        categoryFilter === 'all' ? reports : reports.filter((r) => r.category === categoryFilter),
        [categoryFilter, reports]
    );

    /** Client-side date range filter applied to rawData */
    const filteredData = useMemo(() => {
        if (!rawData.length || (!dateFrom && !dateTo) || !selectedReport?.dateField) {
            return rawData;
        }
        const from = dateFrom ? new Date(dateFrom) : null;
        const to = dateTo ? new Date(dateTo + 'T23:59:59') : null;

        return rawData.filter((row) => {
            const d = getRowDate(row, selectedReport.dateField!);
            if (!d) return true;
            if (from && d < from) return false;
            if (to && d > to) return false;
            return true;
        });
    }, [rawData, dateFrom, dateTo, selectedReport]);

    /** Columns built from the selected report definition + live ref maps */
    const columns = useMemo(
        () => (selectedReport ? selectedReport.buildColumns(refMaps) : []),
        [selectedReport, refMaps]
    );

    /** Summary stats computed from filtered data */
    const summaryStats = useMemo((): SummaryStat[] => {
        if (!selectedReport?.summaryFn || !filteredData.length) return [];
        try { return selectedReport.summaryFn(filteredData, refMaps); } catch { return []; }
    }, [filteredData, selectedReport, refMaps]);

    // ── Handlers ───────────────────────────────────────────────────────────
    const handleSelectReport = useCallback(async (reportId: string, updateRoute = true) => {
        const report = reports.find((r) => r.id === reportId);
        if (!report) return;

        if (updateRoute) {
            navigate(`/reports/${reportId}`);
        }

        setSelectedReportId(reportId);
        setRawData([]);
        setError(null);
        setLoading(true);

        try {
            const result = await report.fetchData();
            setRawData(Array.isArray(result) ? result : []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load report data.');
        } finally {
            setLoading(false);
        }
    }, [navigate, reports]);

    const handleBack = useCallback(() => {
        navigate('/reports');
        setSelectedReportId(null);
        setRawData([]);
        setError(null);
        setDateFrom('');
        setDateTo('');
    }, [navigate]);

    const handleRetry = useCallback(() => {
        if (selectedReportId) handleSelectReport(selectedReportId);
    }, [selectedReportId, handleSelectReport]);

    const hasDateFilter = Boolean(dateFrom || dateTo);

    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = { all: reports.length };
        reports.forEach((r) => { counts[r.category] = (counts[r.category] ?? 0) + 1; });
        return counts;
    }, [reports]);

    useEffect(() => {
        if (!reportId) {
            return;
        }

        if (authLoading) {
            return;
        }

        const exists = reports.some((r) => r.id === reportId);
        if (!exists) {
            navigate('/reports', { replace: true });
            return;
        }

        if (selectedReportId !== reportId) {
            void handleSelectReport(reportId, false);
        }
    }, [reportId, selectedReportId, handleSelectReport, navigate, reports, authLoading]);

    // ── Render: Detail View ────────────────────────────────────────────────
    if (selectedReport) {
        const catStyle = CATEGORY_STYLE[selectedReport.category];
        const Icon = selectedReport.icon;

        return (
            <div className="space-y-5">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <button
                        onClick={handleBack}
                        className="self-start flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                        ← Back to Reports
                    </button>
                    <div className="flex items-center gap-3 min-w-0">
                        <div className={cn('p-2 rounded-lg flex-shrink-0', catStyle.iconBg)}>
                            <Icon className={cn('w-5 h-5', catStyle.iconText)} />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white truncate">
                                {selectedReport.name}
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                                {selectedReport.description}
                            </p>
                        </div>
                        <span className={cn('hidden sm:inline-flex flex-shrink-0 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider', catStyle.badge)}>
                            {selectedReport.category}
                        </span>
                    </div>
                </div>

                {/* Date Range Filter */}
                {selectedReport.dateField && (
                    <DateRangeFilter
                        dateFrom={dateFrom}
                        dateTo={dateTo}
                        onFromChange={setDateFrom}
                        onToChange={setDateTo}
                        onClear={() => { setDateFrom(''); setDateTo(''); }}
                        hasFilter={hasDateFilter}
                    />
                )}

                {/* Content Area */}
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
                            <p className="text-slate-500 dark:text-slate-400 font-medium">
                                Fetching report data…
                            </p>
                            {refLoading && (
                                <p className="text-xs text-slate-400 dark:text-slate-500">
                                    Loading reference data in background…
                                </p>
                            )}
                        </div>
                    ) : error ? (
                        <div className="py-8 px-6">
                            <div className="flex flex-col items-center justify-center gap-4 text-center">
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-full">
                                    <AlertCircle className="w-10 h-10 text-red-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                        Failed to Load Report
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mt-1">
                                        {error}
                                    </p>
                                </div>
                                <button
                                    onClick={handleRetry}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Retry
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-5 space-y-5">
                            {/* Summary + record count */}
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                <SummaryStatsBar stats={summaryStats} />
                                <div className="flex-shrink-0 self-start px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-900/30 rounded-lg">
                                    <span className="text-sm font-semibold text-primary-700 dark:text-primary-300">
                                        {formatNumber(filteredData.length)} record{filteredData.length !== 1 ? 's' : ''}
                                    </span>
                                    {hasDateFilter && rawData.length !== filteredData.length && (
                                        <span className="text-xs text-primary-500 dark:text-primary-400 ml-1.5">
                                            (of {formatNumber(rawData.length)} total)
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Table */}
                            <DataTable
                                data={filteredData}
                                columns={columns}
                                exportFilename={selectedReport.id + '_report'}
                                enableExport
                                pageSize={25}
                                pageSizeOptions={[10, 25, 50, 100]}
                                emptyMessage={
                                    hasDateFilter
                                        ? 'No records match the selected date range.'
                                        : 'No records found for this report.'
                                }
                                searchPlaceholder={`Search ${selectedReport.name.toLowerCase()}…`}
                            />
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ── Render: Report Selection Grid ──────────────────────────────────────
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Reports
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                        Generate, filter, and export live data reports across all modules.
                    </p>
                </div>
                <div className="flex items-center gap-2 self-start">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-full text-sm font-medium border border-emerald-200 dark:border-emerald-800">
                        <ScrollText className="w-3.5 h-3.5" />
                        {reports.length} Reports Available
                    </div>
                    {refLoading && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-full text-xs font-medium border border-amber-200 dark:border-amber-800">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Loading refs…
                        </div>
                    )}
                </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap gap-2">
                {ALL_CATEGORIES.map((cat) => {
                    const isActive = categoryFilter === cat;
                    const count = categoryCounts[cat] ?? 0;
                    const activeStyle = cat !== 'all' ? CATEGORY_STYLE[cat as ReportCategory].tabActive : 'bg-slate-700 text-white';
                    return (
                        <button
                            key={cat}
                            onClick={() => setCategoryFilter(cat as 'all' | ReportCategory)}
                            className={cn(
                                'flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all border',
                                isActive
                                    ? cn(activeStyle, 'border-transparent shadow-sm')
                                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                            )}
                        >
                            {cat === 'all' ? 'All Reports' : cat}
                            <span className={cn(
                                'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                                isActive ? 'bg-white/25 text-inherit' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                            )}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Report Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {visibleReports.map((report) => (
                    <ReportCard
                        key={report.id}
                        report={report}
                        onSelect={handleSelectReport}
                    />
                ))}
            </div>
        </div>
    );
}

export default ReportsPage;
