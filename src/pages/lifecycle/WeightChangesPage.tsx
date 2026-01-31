import { useState, useEffect, useCallback } from 'react';
import { CrudPage, DataTableColumn, FormField, SelectOption } from '../../components/crud';
import { weightChangeApi, livestockApi, farmApi } from '../../services/api';
import { WeightChange, Livestock, Farm } from '../../types/entities';
import { formatDate } from '../../lib/utils';

// Extended type for display
interface WeightChangeDisplay extends WeightChange {
    livestockName?: string;
    farmName?: string;
}

export function WeightChangesPage() {
    const [data, setData] = useState<WeightChangeDisplay[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    const [livestock, setLivestock] = useState<SelectOption[]>([]);
    const [farms, setFarms] = useState<SelectOption[]>([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const [weightsData, livestockData, farmsData] = await Promise.all([
                weightChangeApi.list(),
                livestockApi.list(),
                farmApi.list(),
            ]);

            const livestockMap = new Map(livestockData.map((l: Livestock) => [l.uuid, `${l.name || 'Unnamed'} (${l.identificationNumber || l.dummyTagId || 'No Tag'})`]));
            const farmMap = new Map(farmsData.map((f: Farm) => [f.uuid, f.name]));

            const enrichedData = weightsData.map((w: WeightChange) => ({
                ...w,
                livestockName: w.livestockUuid ? livestockMap.get(w.livestockUuid) : '-',
                farmName: w.farmUuid ? farmMap.get(w.farmUuid) : '-',
            }));

            setData(enrichedData);

            setLivestock(livestockData.map((l: Livestock) => ({
                value: l.uuid,
                label: `${l.name || 'Unnamed'} (${l.identificationNumber || l.dummyTagId || 'No Tag'})`
            })));

            setFarms(farmsData.map((f: Farm) => ({ value: f.uuid, label: f.name })));

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load weight records');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const columns: DataTableColumn<WeightChangeDisplay>[] = [
        { id: 'uuid', header: 'UUID', accessorKey: 'uuid', size: 100 },
        { id: 'livestockName', header: 'Livestock', accessorKey: 'livestockName' },
        { id: 'farmName', header: 'Farm', accessorKey: 'farmName' },
        {
            id: 'eventDate',
            header: 'Date',
            accessorFn: (row) => row.eventDate ? formatDate(row.eventDate) : (row.created_at ? formatDate(row.created_at) : '-'),
        },
        {
            id: 'weight',
            header: 'Weight',
            accessorFn: (row) => `${row.weight} ${row.weightUnit || 'kg'}`,
        },
    ];

    const formFields: FormField<WeightChange>[] = [
        {
            name: 'farmUuid' as keyof WeightChange,
            label: 'Farm',
            type: 'select',
            required: true,
            options: farms,
            placeholder: 'Select farm',
        },
        {
            name: 'livestockUuid' as keyof WeightChange,
            label: 'Livestock',
            type: 'select',
            required: true,
            options: livestock,
            placeholder: 'Select livestock',
        },
        {
            name: 'eventDate' as keyof WeightChange,
            label: 'Date',
            type: 'date',
            required: true,
        },
        {
            name: 'weight' as keyof WeightChange,
            label: 'Weight',
            type: 'number',
            required: true,
            min: 0,
        },
        {
            name: 'weightUnit' as keyof WeightChange,
            label: 'Unit',
            type: 'select',
            options: [
                { value: 'kg', label: 'kg' },
                { value: 'lbs', label: 'lbs' },
            ],
            defaultValue: 'kg',
        },
        {
            name: 'remarks' as keyof WeightChange,
            label: 'Remarks',
            type: 'textarea',
            placeholder: 'Comments',
        },
    ];

    const detailFields = [
        { key: 'uuid' as keyof WeightChangeDisplay, label: 'UUID' },
        { key: 'livestockName' as keyof WeightChangeDisplay, label: 'Livestock' },
        { key: 'farmName' as keyof WeightChangeDisplay, label: 'Farm' },
        { key: 'eventDate' as keyof WeightChangeDisplay, label: 'Date', render: (val: unknown) => val ? formatDate(String(val)) : '-' },
        { key: 'weight' as keyof WeightChangeDisplay, label: 'Weight' },
        { key: 'weightUnit' as keyof WeightChangeDisplay, label: 'Unit' },
        { key: 'remarks' as keyof WeightChangeDisplay, label: 'Remarks' },
        { key: 'created_at' as keyof WeightChangeDisplay, label: 'Created At', render: (val: unknown) => formatDate(String(val)) },
    ];

    const handleCreate = async (item: Partial<WeightChange>) => {
        await weightChangeApi.create(item as WeightChange);
    };

    const handleUpdate = async (id: number | string, item: Partial<WeightChange>) => {
        await weightChangeApi.update(Number(id), item as WeightChange);
    };

    const handleDelete = async (id: number | string) => {
        await weightChangeApi.delete(Number(id));
    };

    return (
        <CrudPage
            title="Weight Records"
            description="Track growth and weight changes"
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
            createLabel="Record Weight"
            createModalSize="lg"
            editModalSize="lg"
        />
    );
}

export default WeightChangesPage;
