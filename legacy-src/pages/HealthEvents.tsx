import { useState, useEffect, useCallback } from 'react';
import { CrudPage, DataTableColumn, FormField, SelectOption } from '../components/crud';
import { treatmentApi, referenceApi, livestockApi, vetApi, farmApi } from '../services/api';
import { Medication, Medicine, Disease, Livestock, Vet, AdministrationRoute, Farm } from '../types/entities';
import { formatDate } from '../lib/utils';

// Extended type for display
interface MedicationDisplay extends Medication {
    livestockName?: string;
    medicineName?: string;
    diseaseName?: string;
    vetName?: string;
    routeName?: string;
    farmName?: string;
}

export function HealthEvents() {
    const [data, setData] = useState<MedicationDisplay[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    const [medicines, setMedicines] = useState<SelectOption[]>([]);
    const [diseases, setDiseases] = useState<SelectOption[]>([]);
    const [livestock, setLivestock] = useState<SelectOption[]>([]);
    const [farms, setFarms] = useState<SelectOption[]>([]);
    const [vets, setVets] = useState<SelectOption[]>([]);
    const [routes, setRoutes] = useState<SelectOption[]>([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const [medicationsData, medicinesData, diseasesData, livestockData, vetsData, routesData, farmsData] = await Promise.all([
                treatmentApi.list(),
                referenceApi.medicines.list(),
                referenceApi.diseases.list(),
                livestockApi.list(),
                vetApi.list(),
                referenceApi.administrationRoutes.list(),
                farmApi.list(),
            ]);

            const medicineMap = new Map(medicinesData.map((m: Medicine) => [m.id, m.name]));
            const diseaseMap = new Map(diseasesData.map((d: Disease) => [d.id, d.name]));
            const livestockMap = new Map(livestockData.map((l: Livestock) => [l.uuid, `${l.name || 'Unnamed'} (${l.identificationNumber || l.dummyTagId || 'No Tag'})`]));
            const vetMap = new Map(vetsData.map((v: Vet) => [v.id, `${v.firstName} ${v.lastName}`]));
            const routeMap = new Map(routesData.map((r: AdministrationRoute) => [r.id, r.name]));
            const farmMap = new Map(farmsData.map((f: Farm) => [f.uuid, f.name]));

            const enrichedData = medicationsData.map((m: Medication) => ({
                ...m,
                medicineName: m.medicineId ? medicineMap.get(m.medicineId) : '-',
                diseaseName: m.diseaseId ? diseaseMap.get(m.diseaseId) : 'General/Unknown',
                livestockName: livestockMap.get(m.livestockUuid) || 'Unknown Livestock',
                vetName: m.vetId ? vetMap.get(Number(m.vetId)) : '-',
                routeName: m.administrationRouteId ? routeMap.get(m.administrationRouteId) : '-',
                farmName: m.farmUuid ? farmMap.get(m.farmUuid) : '-',
            }));

            setData(enrichedData);
            setMedicines(medicinesData.map((m: Medicine) => ({ value: m.id, label: m.name })));
            setDiseases(diseasesData.map((d: Disease) => ({ value: d.id, label: d.name })));
            setLivestock(livestockData.map((l: Livestock) => ({
                value: l.uuid,
                label: `${l.name || 'Unnamed'} (${l.identificationNumber || l.dummyTagId || 'No Tag'})`
            })));
            setFarms(farmsData.map((f: Farm) => ({ value: f.uuid, label: f.name })));
            setVets(vetsData.map((v: Vet) => ({ value: v.id, label: `${v.firstName} ${v.lastName}` })));
            setRoutes(routesData.map((r: AdministrationRoute) => ({ value: r.id, label: r.name })));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load health events');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const columns: DataTableColumn<MedicationDisplay>[] = [
        { id: 'id', header: 'ID', accessorKey: 'id', size: 80 },
        { id: 'livestockName', header: 'Livestock', accessorKey: 'livestockName' },
        { id: 'diseaseName', header: 'Condition/Disease', accessorKey: 'diseaseName' },
        { id: 'medicineName', header: 'Treatment', accessorKey: 'medicineName' },
        {
            id: 'medicationDate',
            header: 'Date',
            accessorFn: (row) => row.medicationDate ? formatDate(row.medicationDate) : '-',
        },
        {
            id: 'severity',
            header: 'Severity',
            accessorKey: 'severity',
            cell: ({ getValue }) => {
                const val = String(getValue() || '').toLowerCase();
                const colors: Record<string, string> = {
                    critical: 'badge-danger',
                    high: 'badge-warning',
                    medium: 'badge-info',
                    low: 'badge-success',
                };
                return <span className={`badge ${colors[val] || 'badge-secondary'}`}>{val || '-'}</span>;
            },
        },
    ];

    const formFields: FormField<Partial<Medication>>[] = [
        {
            name: 'farmUuid' as keyof Medication,
            label: 'Farm',
            type: 'select',
            required: true,
            options: farms,
            placeholder: 'Select farm',
        },
        {
            name: 'livestockUuid' as keyof Medication,
            label: 'Livestock',
            type: 'select',
            required: true,
            options: livestock,
            placeholder: 'Select livestock',
        },
        {
            name: 'diseaseId',
            label: 'Disease/Condition',
            type: 'select',
            options: diseases,
            placeholder: 'Select disease (if applicable)',
        },
        {
            name: 'severity',
            label: 'Severity',
            type: 'select',
            options: [
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'critical', label: 'Critical' },
            ],
            defaultValue: 'low',
        },
        {
            name: 'medicineId',
            label: 'Medicine/Treatment',
            type: 'select',
            options: medicines,
            placeholder: 'Select medicine',
        },
        {
            name: 'medicationDate',
            label: 'Date',
            type: 'date',
            required: true,
        },
        {
            name: 'quantity' as keyof Medication,
            label: 'Quantity',
            type: 'text',
            placeholder: 'e.g. 10ml',
        },
        {
            name: 'withdrawalPeriod' as keyof Medication,
            label: 'Withdrawal Period (Days)',
            type: 'text',
            placeholder: 'e.g. 7',
        },
        {
            name: 'frequency',
            label: 'Frequency',
            type: 'text',
            placeholder: 'e.g. Twice daily',
        },
        {
            name: 'duration',
            label: 'Duration',
            type: 'text',
            placeholder: 'e.g. 5 days',
        },
        {
            name: 'administrationRouteId',
            label: 'Route',
            type: 'select',
            options: routes,
            placeholder: 'Select route',
        },
        {
            name: 'vetId' as keyof Medication,
            label: 'Veterinarian',
            type: 'select',
            options: vets,
            placeholder: 'Select vet',
        },
        {
            name: 'notes',
            label: 'Notes',
            type: 'textarea',
            placeholder: 'Clinical signs, response to treatment',
        },
    ];

    const detailFields = [
        { key: 'id' as keyof MedicationDisplay, label: 'ID' },
        { key: 'livestockName' as keyof MedicationDisplay, label: 'Livestock' },
        { key: 'diseaseName' as keyof MedicationDisplay, label: 'Disease' },
        { key: 'severity' as keyof MedicationDisplay, label: 'Severity' },
        { key: 'medicineName' as keyof MedicationDisplay, label: 'Treatment' },
        { key: 'medicationDate' as keyof MedicationDisplay, label: 'Date', render: (val: unknown) => formatDate(String(val)) },
        { key: 'dosage' as keyof MedicationDisplay, label: 'Dosage' },
        { key: 'frequency' as keyof MedicationDisplay, label: 'Frequency' },
        { key: 'duration' as keyof MedicationDisplay, label: 'Duration' },
        { key: 'routeName' as keyof MedicationDisplay, label: 'Route' },
        { key: 'vetName' as keyof MedicationDisplay, label: 'Vet' },
        { key: 'notes' as keyof MedicationDisplay, label: 'Notes' },
        { key: 'created_at' as keyof MedicationDisplay, label: 'Created At', render: (val: unknown) => formatDate(String(val)) },
    ];

    const handleCreate = async (item: Partial<Medication>) => {
        await treatmentApi.create(item as Medication);
    };

    const handleUpdate = async (id: number | string, item: Partial<Medication>) => {
        await treatmentApi.update(Number(id), item as Medication);
    };

    const handleDelete = async (id: number | string) => {
        await treatmentApi.delete(Number(id));
    };

    return (
        <CrudPage
            title="Health Events & Treatments"
            description={`Manage disease reports and treatments - ${data.length} records`}
            data={data}
            loading={loading}
            error={error}
            columns={columns}
            formFields={formFields}
            detailFields={detailFields}
            formColumns={2}
            onCreate={handleCreate}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onRefresh={fetchData}
            createLabel="Report Event"
            createModalSize="lg"
            editModalSize="lg"
        />
    );
}

export default HealthEvents;
