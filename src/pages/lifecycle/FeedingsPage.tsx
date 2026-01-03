import { useState, useEffect, useCallback } from 'react';
import { CrudPage, DataTableColumn, FormField, SelectOption } from '../../components/crud';
import { feedingApi, livestockApi, feedingTypeApi } from '../../services/api';
import { Feeding, Livestock, FeedingType } from '../../types/entities';
import { formatDate } from '../../lib/utils';

// Extended type for display
interface FeedingDisplay extends Feeding {
    livestockName?: string;
    typeName?: string;
}

export function FeedingsPage() {
    const [data, setData] = useState<FeedingDisplay[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    const [livestock, setLivestock] = useState<SelectOption[]>([]);
    const [types, setTypes] = useState<SelectOption[]>([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const [feedingsData, livestockData, typesData] = await Promise.all([
                feedingApi.list(),
                livestockApi.list(),
                feedingTypeApi.list(),
            ]);

            const livestockMap = new Map(livestockData.map((l: Livestock) => [l.id, `${l.name || 'Unnamed'} (${l.identificationNumber || l.dummyTagId || 'No Tag'})`]));
            const typeMap = new Map(typesData.map((t: FeedingType) => [t.id, t.name]));

            const enrichedData = feedingsData.map((f: Feeding) => ({
                ...f,
                livestockName: f.livestockId ? livestockMap.get(f.livestockId) : '-',
                typeName: f.feedingTypeId ? typeMap.get(f.feedingTypeId) : '-',
            }));

            setData(enrichedData);

            setLivestock(livestockData.map((l: Livestock) => ({
                value: l.id,
                label: `${l.name || 'Unnamed'} (${l.identificationNumber || l.dummyTagId || 'No Tag'})`
            })));

            setTypes(typesData.map((t: FeedingType) => ({ value: t.id, label: t.name })));

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load feeding records');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const columns: DataTableColumn<FeedingDisplay>[] = [
        { id: 'id', header: 'ID', accessorKey: 'id', size: 80 },
        { id: 'livestockName', header: 'Livestock', accessorKey: 'livestockName' },
        {
            id: 'feedingDate',
            header: 'Date',
            accessorFn: (row) => formatDate(row.feedingDate),
        },
        { id: 'typeName', header: 'Type', accessorKey: 'typeName' },
        { id: 'feedName', header: 'Feed Name', accessorKey: 'feedName' },
        {
            id: 'quantity',
            header: 'Qty',
            accessorFn: (row) => row.quantity ? `${row.quantity} ${row.quantityUnit || ''}` : '-',
        },
    ];

    const formFields: FormField<Partial<Feeding>>[] = [
        {
            name: 'livestockId',
            label: 'Livestock',
            type: 'select',
            required: true,
            options: livestock,
            placeholder: 'Select livestock',
        },
        {
            name: 'feedingDate',
            label: 'Date',
            type: 'date',
            required: true,
        },
        {
            name: 'feedingTypeId',
            label: 'Feeding Type',
            type: 'select',
            options: types,
            placeholder: 'Select type',
        },
        {
            name: 'feedName',
            label: 'Feed Name',
            type: 'text',
            placeholder: 'e.g. Napier Grass, Concentrate',
        },
        {
            name: 'quantity',
            label: 'Quantity',
            type: 'number',
            min: 0,
        },
        {
            name: 'quantityUnit',
            label: 'Unit',
            type: 'select',
            options: [
                { value: 'kg', label: 'kg' },
                { value: 'bale', label: 'bale' },
                { value: 'scoop', label: 'scoop' },
                { value: 'bag', label: 'bag' },
            ],
            defaultValue: 'kg',
        },
        {
            name: 'cost',
            label: 'Cost',
            type: 'number',
            min: 0,
            placeholder: 'Cost if applicable',
        },
        {
            name: 'notes',
            label: 'Notes',
            type: 'textarea',
            placeholder: 'Comments',
        },
    ];

    const detailFields = [
        { key: 'id' as keyof FeedingDisplay, label: 'ID' },
        { key: 'livestockName' as keyof FeedingDisplay, label: 'Livestock' },
        { key: 'feedingDate' as keyof FeedingDisplay, label: 'Date', render: (val: unknown) => formatDate(String(val)) },
        { key: 'typeName' as keyof FeedingDisplay, label: 'Type' },
        { key: 'feedName' as keyof FeedingDisplay, label: 'Feed Name' },
        { key: 'quantity' as keyof FeedingDisplay, label: 'Quantity' },
        { key: 'quantityUnit' as keyof FeedingDisplay, label: 'Unit' },
        { key: 'cost' as keyof FeedingDisplay, label: 'Cost' },
        { key: 'notes' as keyof FeedingDisplay, label: 'Notes' },
        { key: 'created_at' as keyof FeedingDisplay, label: 'Created At', render: (val: unknown) => formatDate(String(val)) },
    ];

    const handleCreate = async (item: Partial<Feeding>) => {
        await feedingApi.create(item as Feeding);
    };

    const handleUpdate = async (id: number | string, item: Partial<Feeding>) => {
        await feedingApi.update(Number(id), item as Feeding);
    };

    const handleDelete = async (id: number | string) => {
        await feedingApi.delete(Number(id));
    };

    return (
        <CrudPage
            title="Feeding Records"
            description="Track feeding and nutrition"
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
            createLabel="Record Feeding"
            createModalSize="lg"
            editModalSize="lg"
        />
    );
}

export default FeedingsPage;
