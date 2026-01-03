import { useState, useEffect, useCallback } from 'react';
import { CrudPage, DataTableColumn, FormField, SelectOption } from '../components/crud';
import { dewormingApi, referenceApi, livestockApi, vetApi } from '../services/api';
import { Deworming, Medicine, Livestock, Vet, AdministrationRoute } from '../types/entities';
import { formatDate } from '../lib/utils';

// Extended type for display
interface DewormingDisplay extends Deworming {
    livestockName?: string;
    medicineName?: string;
    vetName?: string;
    routeName?: string;
}

export function DewormingsPage() {
    const [data, setData] = useState<DewormingDisplay[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    const [medicines, setMedicines] = useState<SelectOption[]>([]);
    const [livestock, setLivestock] = useState<SelectOption[]>([]);
    const [vets, setVets] = useState<SelectOption[]>([]);
    const [routes, setRoutes] = useState<SelectOption[]>([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const [dewormingsData, medicinesData, livestockData, vetsData, routesData] = await Promise.all([
                dewormingApi.list(),
                referenceApi.medicines.list(),
                livestockApi.list(),
                vetApi.list(),
                referenceApi.administrationRoutes.list(),
            ]);

            const medicineMap = new Map(medicinesData.map((m: Medicine) => [m.id, m.name]));
            const livestockMap = new Map(livestockData.map((l: Livestock) => [l.id, `${l.name || 'Unnamed'} (${l.identificationNumber || l.dummyTagId || 'No Tag'})`]));
            const vetMap = new Map(vetsData.map((v: Vet) => [v.id, `${v.firstName} ${v.lastName}`]));
            const routeMap = new Map(routesData.map((r: AdministrationRoute) => [r.id, r.name]));

            const enrichedData = dewormingsData.map((d: Deworming) => ({
                ...d,
                medicineName: d.medicineId ? medicineMap.get(d.medicineId) : '-',
                livestockName: livestockMap.get(d.livestockId) || 'Unknown Livestock',
                vetName: d.veterinarianId ? vetMap.get(d.veterinarianId) : '-',
                routeName: d.administrationRouteId ? routeMap.get(d.administrationRouteId) : '-',
            }));

            setData(enrichedData);
            setMedicines(medicinesData.map((m: Medicine) => ({ value: m.id, label: m.name })));
            setLivestock(livestockData.map((l: Livestock) => ({
                value: l.id,
                label: `${l.name || 'Unnamed'} (${l.identificationNumber || l.dummyTagId || 'No Tag'})`
            })));
            setVets(vetsData.map((v: Vet) => ({ value: v.id, label: `${v.firstName} ${v.lastName}` })));
            setRoutes(routesData.map((r: AdministrationRoute) => ({ value: r.id, label: r.name })));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load deworming records');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const columns: DataTableColumn<DewormingDisplay>[] = [
        { id: 'id', header: 'ID', accessorKey: 'id', size: 80 },
        { id: 'livestockName', header: 'Livestock', accessorKey: 'livestockName' },
        { id: 'medicineName', header: 'Dewormer', accessorKey: 'medicineName' },
        {
            id: 'dewormingDate',
            header: 'Date',
            accessorFn: (row) => formatDate(row.dewormingDate),
        },
        {
            id: 'nextDueDate',
            header: 'Next Due',
            accessorFn: (row) => row.nextDueDate ? formatDate(row.nextDueDate) : '-',
        },
    ];

    const formFields: FormField<Partial<Deworming>>[] = [
        {
            name: 'livestockId',
            label: 'Livestock',
            type: 'select',
            required: true,
            options: livestock,
            placeholder: 'Select livestock',
        },
        {
            name: 'medicineId',
            label: 'Dewormer (Medicine)',
            type: 'select',
            options: medicines,
            placeholder: 'Select dewormer',
        },
        {
            name: 'dewormingDate',
            label: 'Date',
            type: 'date',
            required: true,
        },
        {
            name: 'dosage',
            label: 'Dosage',
            type: 'text',
            placeholder: 'e.g. 50ml',
        },
        {
            name: 'administrationRouteId',
            label: 'Route',
            type: 'select',
            options: routes,
            placeholder: 'Select route',
        },
        {
            name: 'veterinarianId',
            label: 'Veterinarian',
            type: 'select',
            options: vets,
            placeholder: 'Select vet',
        },
        {
            name: 'nextDueDate',
            label: 'Next Due Date',
            type: 'date',
        },
        {
            name: 'notes',
            label: 'Notes',
            type: 'textarea',
            placeholder: 'Comments',
        },
    ];

    const detailFields = [
        { key: 'id' as keyof DewormingDisplay, label: 'ID' },
        { key: 'livestockName' as keyof DewormingDisplay, label: 'Livestock' },
        { key: 'medicineName' as keyof DewormingDisplay, label: 'Dewormer' },
        { key: 'dewormingDate' as keyof DewormingDisplay, label: 'Date', render: (val: unknown) => formatDate(String(val)) },
        { key: 'dosage' as keyof DewormingDisplay, label: 'Dosage' },
        { key: 'routeName' as keyof DewormingDisplay, label: 'Route' },
        { key: 'vetName' as keyof DewormingDisplay, label: 'Vet' },
        { key: 'nextDueDate' as keyof DewormingDisplay, label: 'Next Due', render: (val: unknown) => val ? formatDate(String(val)) : '-' },
        { key: 'notes' as keyof DewormingDisplay, label: 'Notes' },
        { key: 'created_at' as keyof DewormingDisplay, label: 'Created At', render: (val: unknown) => formatDate(String(val)) },
    ];

    const handleCreate = async (item: Partial<Deworming>) => {
        await dewormingApi.create(item as Deworming);
    };

    const handleUpdate = async (id: number | string, item: Partial<Deworming>) => {
        await dewormingApi.update(Number(id), item as Deworming);
    };

    const handleDelete = async (id: number | string) => {
        await dewormingApi.delete(Number(id));
    };

    return (
        <CrudPage
            title="Deworming Records"
            description={`Manage parasite control records - ${data.length} records`}
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
            createLabel="Record Deworming"
            createModalSize="lg"
            editModalSize="lg"
        />
    );
}

export default DewormingsPage;
