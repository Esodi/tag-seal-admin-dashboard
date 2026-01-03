import { useState, useEffect, useCallback } from 'react';
import { CrudPage, DataTableColumn, FormField, SelectOption } from '../../components/crud';
import { weightChangeApi, livestockApi } from '../../services/api';
import { WeightChange, Livestock } from '../../types/entities';
import { formatDate } from '../../lib/utils';

// Extended type for display
interface WeightChangeDisplay extends WeightChange {
    livestockName?: string;
}

export function WeightChangesPage() {
    const [data, setData] = useState<WeightChangeDisplay[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    const [livestock, setLivestock] = useState<SelectOption[]>([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const [weightsData, livestockData] = await Promise.all([
                weightChangeApi.list(),
                livestockApi.list(),
            ]);

            const livestockMap = new Map(livestockData.map((l: Livestock) => [l.id, `${l.name || 'Unnamed'} (${l.identificationNumber || l.dummyTagId || 'No Tag'})`]));

            const enrichedData = weightsData.map((w: WeightChange) => ({
                ...w,
                livestockName: w.livestockId ? livestockMap.get(w.livestockId) : '-',
            }));

            setData(enrichedData);

            setLivestock(livestockData.map((l: Livestock) => ({
                value: l.id,
                label: `${l.name || 'Unnamed'} (${l.identificationNumber || l.dummyTagId || 'No Tag'})`
            })));

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
        { id: 'id', header: 'ID', accessorKey: 'id', size: 80 },
        { id: 'livestockName', header: 'Livestock', accessorKey: 'livestockName' },
        {
            id: 'recordDate',
            header: 'Date',
            accessorFn: (row) => formatDate(row.recordDate),
        },
        {
            id: 'weight',
            header: 'Weight',
            accessorFn: (row) => `${row.weight} ${row.weightUnit || 'kg'}`,
        },
    ];

    const formFields: FormField<Partial<WeightChange>>[] = [
        {
            name: 'livestockId',
            label: 'Livestock',
            type: 'select',
            required: true,
            options: livestock,
            placeholder: 'Select livestock',
        },
        {
            name: 'recordDate',
            label: 'Date',
            type: 'date',
            required: true,
        },
        {
            name: 'weight',
            label: 'Weight',
            type: 'number',
            required: true,
            min: 0,
        },
        {
            name: 'weightUnit',
            label: 'Unit',
            type: 'select',
            options: [
                { value: 'kg', label: 'kg' },
                { value: 'lbs', label: 'lbs' },
            ],
            defaultValue: 'kg',
        },
        {
            name: 'notes',
            label: 'Notes',
            type: 'textarea',
            placeholder: 'Comments',
        },
    ];

    const detailFields = [
        { key: 'id' as keyof WeightChangeDisplay, label: 'ID' },
        { key: 'livestockName' as keyof WeightChangeDisplay, label: 'Livestock' },
        { key: 'recordDate' as keyof WeightChangeDisplay, label: 'Date', render: (val: unknown) => formatDate(String(val)) },
        { key: 'weight' as keyof WeightChangeDisplay, label: 'Weight' },
        { key: 'weightUnit' as keyof WeightChangeDisplay, label: 'Unit' },
        { key: 'notes' as keyof WeightChangeDisplay, label: 'Notes' },
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
            formFields={formFields}
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
