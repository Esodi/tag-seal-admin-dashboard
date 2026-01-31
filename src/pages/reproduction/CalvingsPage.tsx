import { useState, useEffect, useCallback } from 'react';
import { CrudPage, DataTableColumn, FormField, SelectOption } from '../../components/crud';
import { calvingApi, livestockApi, farmApi } from '../../services/api';
import { Calving, Livestock, Farm } from '../../types/entities';
import { formatDate } from '../../lib/utils';

// Extended type for display
interface CalvingDisplay extends Calving {
    livestockName?: string;
    farmName?: string;
}

export function CalvingsPage() {
    const [data, setData] = useState<CalvingDisplay[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    const [livestock, setLivestock] = useState<SelectOption[]>([]);
    const [farms, setFarms] = useState<SelectOption[]>([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const [calvingData, livestockData, farmsData] = await Promise.all([
                calvingApi.list(),
                livestockApi.list(),
                farmApi.list(),
            ]);

            const livestockMap = new Map(livestockData.map((l: Livestock) => [l.uuid, `${l.name || 'Unnamed'} (${l.identificationNumber || l.dummyTagId || 'No Tag'})`]));
            const farmMap = new Map(farmsData.map((f: Farm) => [f.uuid, f.name]));

            const enrichedData = calvingData.map((c: Calving) => ({
                ...c,
                livestockName: c.livestockUuid ? livestockMap.get(c.livestockUuid) : '-',
                farmName: c.farmUuid ? farmMap.get(c.farmUuid) : '-',
            }));

            setData(enrichedData);

            setLivestock(livestockData
                .filter((l: Livestock) => {
                    const g = l.gender?.toLowerCase();
                    return g === 'female';
                })
                .map((l: Livestock) => ({
                    value: l.uuid,
                    label: `${l.name || 'Unnamed'} (${l.identificationNumber || l.dummyTagId || 'No Tag'})`
                })));

            setFarms(farmsData.map((f: Farm) => ({ value: f.uuid, label: f.name })));

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load calving records');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const columns: DataTableColumn<CalvingDisplay>[] = [
        { id: 'uuid', header: 'UUID', accessorKey: 'uuid', size: 100 },
        { id: 'livestockName', header: 'Cow', accessorKey: 'livestockName' },
        { id: 'farmName', header: 'Farm', accessorKey: 'farmName' },
        {
            id: 'eventDate',
            header: 'Date',
            accessorFn: (row) => row.eventDate ? formatDate(row.eventDate) : (row.created_at ? formatDate(row.created_at) : '-'),
        },
        { id: 'calfCount', header: 'Calves', accessorKey: 'calfCount', size: 100 },
        {
            id: 'assistanceRequired',
            header: 'Assisted',
            accessorFn: (row) => row.assistanceRequired ? 'Yes' : 'No',
            size: 100
        },
    ];

    const formFields: FormField<Calving>[] = [
        {
            name: 'farmUuid' as keyof Calving,
            label: 'Farm',
            type: 'select',
            required: true,
            options: farms,
            placeholder: 'Select farm',
        },
        {
            name: 'livestockUuid' as keyof Calving,
            label: 'Cow',
            type: 'select',
            required: true,
            options: livestock,
            placeholder: 'Select cow',
        },
        {
            name: 'eventDate' as keyof Calving,
            label: 'Calving Date',
            type: 'date',
            required: true,
        },
        {
            name: 'calfCount' as keyof Calving,
            label: 'Total Calves',
            type: 'number',
            required: true,
            min: 1,
        },
        {
            name: 'maleCalfCount' as keyof Calving,
            label: 'Males',
            type: 'number',
            min: 0,
        },
        {
            name: 'femaleCalfCount' as keyof Calving,
            label: 'Females',
            type: 'number',
            min: 0,
        },
        {
            name: 'stillbornCount' as keyof Calving,
            label: 'Stillborn',
            type: 'number',
            min: 0,
        },
        {
            name: 'assistanceRequired' as keyof Calving,
            label: 'Assistance Required?',
            type: 'checkbox',
        },
        {
            name: 'remarks' as keyof Calving,
            label: 'Remarks',
            type: 'textarea',
            placeholder: 'Comments',
        },
    ];

    const detailFields = [
        { key: 'uuid' as keyof CalvingDisplay, label: 'UUID' },
        { key: 'livestockName' as keyof CalvingDisplay, label: 'Cow' },
        { key: 'farmName' as keyof CalvingDisplay, label: 'Farm' },
        { key: 'eventDate' as keyof CalvingDisplay, label: 'Date', render: (val: unknown) => val ? formatDate(String(val)) : '-' },
        { key: 'calfCount' as keyof CalvingDisplay, label: 'Total Calves' },
        { key: 'maleCalfCount' as keyof CalvingDisplay, label: 'Males' },
        { key: 'femaleCalfCount' as keyof CalvingDisplay, label: 'Females' },
        { key: 'stillbornCount' as keyof CalvingDisplay, label: 'Stillborn' },
        { key: 'assistanceRequired' as keyof CalvingDisplay, label: 'Assisted', render: (val: unknown) => val ? 'Yes' : 'No' },
        { key: 'remarks' as keyof CalvingDisplay, label: 'Remarks' },
        { key: 'created_at' as keyof CalvingDisplay, label: 'Created At', render: (val: unknown) => formatDate(String(val)) },
    ];

    const handleCreate = async (item: Partial<Calving>) => {
        await calvingApi.create(item as Calving);
    };

    const handleUpdate = async (id: number | string, item: Partial<Calving>) => {
        await calvingApi.update(Number(id), item as Calving);
    };

    const handleDelete = async (id: number | string) => {
        await calvingApi.delete(Number(id));
    };

    return (
        <CrudPage
            title="Calving Records"
            description="Record cattle calving events"
            data={data}
            loading={loading}
            error={error}
            columns={columns}
            formFields={formFields as any}
            detailFields={detailFields}
            formColumns={2}
            onCreate={handleCreate}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onRefresh={fetchData}
            createLabel="Record Calving"
            createModalSize="lg"
            editModalSize="lg"
        />
    );
}

export default CalvingsPage;

