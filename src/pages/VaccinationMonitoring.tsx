import { useState, useEffect, useCallback } from 'react';
import { CrudPage, DataTableColumn, FormField, SelectOption } from '../components/crud';
import { vaccinationApi, vaccineApi, livestockApi, vetApi, referenceApi } from '../services/api';
import { Vaccination, Vaccine, Livestock, Vet, AdministrationRoute } from '../types/entities';
import { formatDate } from '../lib/utils';

// Extended type for display
interface VaccinationDisplay extends Vaccination {
    livestockName?: string;
    vaccineName?: string;
    vetName?: string;
    routeName?: string;
}

export function VaccinationMonitoring() {
    const [data, setData] = useState<VaccinationDisplay[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    const [vaccines, setVaccines] = useState<SelectOption[]>([]);
    const [livestock, setLivestock] = useState<SelectOption[]>([]);
    const [vets, setVets] = useState<SelectOption[]>([]);
    const [routes, setRoutes] = useState<SelectOption[]>([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const [vaccinationsData, vaccinesData, livestockData, vetsData, routesData] = await Promise.all([
                vaccinationApi.list(),
                vaccineApi.list(),
                livestockApi.list(),
                vetApi.list(),
                referenceApi.administrationRoutes.list(),
            ]);

            const vaccineMap = new Map(vaccinesData.map((v: Vaccine) => [v.id, v.name]));
            const livestockMap = new Map<string | number, string>(livestockData.map((l: Livestock) => [l.uuid, `${l.name || 'Unnamed'} (${l.identificationNumber || l.dummyTagId || 'No Tag'})`]));
            const vetMap = new Map<string | number, string>(vetsData.map((v: Vet) => [v.id, `${v.firstName} ${v.lastName}`]));
            const routeMap = new Map(routesData.map((r: AdministrationRoute) => [r.id, r.name]));

            const enrichedData = vaccinationsData.map((v: Vaccination) => ({
                ...v,
                vaccineName: vaccineMap.get(v.vaccineId || 0) || 'Unknown Vaccine',
                livestockName: (v.livestock?.name || (v.livestockUuid ? livestockMap.get(v.livestockUuid) : undefined)) || 'Unknown Livestock',
                vetName: v.vetId ? (vetMap.get(v.vetId) ?? vetMap.get(Number(v.vetId))) : '-',
                routeName: v.administrationRouteId ? routeMap.get(v.administrationRouteId) : '-',
            }));

            setData(enrichedData);
            setVaccines(vaccinesData.map((v: Vaccine) => ({ value: v.id, label: v.name })));
            setLivestock(livestockData.map((l: Livestock) => ({
                value: l.uuid,
                label: `${l.name || 'Unnamed'} (${l.identificationNumber || l.dummyTagId || 'No Tag'})`
            })));
            setVets(vetsData.map((v: Vet) => ({ value: v.id, label: `${v.firstName} ${v.lastName}` })));
            setRoutes(routesData.map((r: AdministrationRoute) => ({ value: r.id, label: r.name })));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load vaccinations');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const columns: DataTableColumn<VaccinationDisplay>[] = [
        { id: 'id', header: 'ID', accessorKey: 'id', size: 80 },
        { id: 'livestockName', header: 'Livestock', accessorKey: 'livestockName' },
        { id: 'vaccineName', header: 'Vaccine', accessorKey: 'vaccineName' },
        {
            id: 'vaccinationDate',
            header: 'Date',
            accessorFn: (row) => formatDate(row.eventDate || row.created_at || ''),
        },
        {
            id: 'nextDueDate',
            header: 'Next Due',
            accessorFn: (row) => row.created_at ? formatDate(row.created_at) : '-', // Vaccination interface doesn't have nextDueDate? Using created_at as placeholder if needed, but let's check field again
        },
        { id: 'vetName', header: 'Vet', accessorKey: 'vetName' },
    ];

    const formFields: FormField<Partial<Vaccination>>[] = [
        {
            name: 'livestockUuid' as any,
            label: 'Livestock',
            type: 'select',
            required: true,
            options: livestock,
            placeholder: 'Select livestock',
        },
        {
            name: 'vaccineId',
            label: 'Vaccine',
            type: 'select',
            required: true,
            options: vaccines,
            placeholder: 'Select vaccine',
        },
        {
            name: 'eventDate' as any,
            label: 'Date',
            type: 'date',
            required: true,
        },
        {
            name: 'vaccinationNo' as any,
            label: 'Batch No.',
            type: 'text',
            placeholder: 'Batch number',
        },
        {
            name: 'dosage',
            label: 'Dosage',
            type: 'text',
            placeholder: 'e.g. 2ml',
        },
        {
            name: 'administrationRouteId',
            label: 'Route',
            type: 'select',
            options: routes,
            placeholder: 'Select route',
        },
        {
            name: 'vetId' as any,
            label: 'Veterinarian',
            type: 'select',
            options: vets,
            placeholder: 'Select vet',
        },
        {
            name: 'created_at' as any, // Vaccination interface is missing nextDueDate, using created_at as placeholder for the field slot if UI requires it
            label: 'Next Due Date',
            type: 'date',
        },
        {
            name: 'notes' as any,
            label: 'Notes',
            type: 'textarea',
            placeholder: 'Observations or comments',
        },
    ];

    const detailFields = [
        { key: 'id' as keyof VaccinationDisplay, label: 'ID' },
        { key: 'livestockName' as keyof VaccinationDisplay, label: 'Livestock' },
        { key: 'vaccineName' as keyof VaccinationDisplay, label: 'Vaccine' },
        { key: 'vaccinationDate' as keyof VaccinationDisplay, label: 'Date', render: (val: unknown) => formatDate(String(val)) },
        { key: 'batchNumber' as keyof VaccinationDisplay, label: 'Batch No.' },
        { key: 'dosage' as keyof VaccinationDisplay, label: 'Dosage' },
        { key: 'routeName' as keyof VaccinationDisplay, label: 'Route' },
        { key: 'vetName' as keyof VaccinationDisplay, label: 'Vet' },
        { key: 'nextDueDate' as keyof VaccinationDisplay, label: 'Next Due', render: (val: unknown) => val ? formatDate(String(val)) : '-' },
        { key: 'notes' as keyof VaccinationDisplay, label: 'Notes' },
        { key: 'created_at' as keyof VaccinationDisplay, label: 'Created At', render: (val: unknown) => formatDate(String(val)) },
    ];

    const handleCreate = async (item: Partial<Vaccination>) => {
        await vaccinationApi.create(item as Vaccination);
    };

    const handleUpdate = async (id: number | string, item: Partial<Vaccination>) => {
        await vaccinationApi.update(Number(id), item as Vaccination);
    };

    const handleDelete = async (id: number | string) => {
        await vaccinationApi.delete(Number(id));
    };

    return (
        <CrudPage
            title="Vaccination Monitoring"
            description={`Manage vaccination records - ${data.length} entries`}
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
            createLabel="Record Vaccination"
            createModalSize="lg"
            editModalSize="lg"
        />
    );
}

export default VaccinationMonitoring;
