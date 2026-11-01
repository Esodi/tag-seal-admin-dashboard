import { useState, useEffect, useCallback } from 'react';
import { CrudPage, DataTableColumn, FormField, SelectOption } from '../../components/crud';
import { feedingApi, livestockApi, farmApi, feedingTypeApi } from '../../services/api';
import { Feeding, Livestock, Farm, FeedingType } from '../../types/entities';
import { formatDate } from '../../lib/utils';

// Extended type for display
interface FeedingDisplay extends Feeding {
    livestockName?: string;
    farmName?: string;
    typeName?: string;
}

export function FeedingsPage() {
    const [data, setData] = useState<FeedingDisplay[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    const [livestock, setLivestock] = useState<SelectOption[]>([]);
    const [farms, setFarms] = useState<SelectOption[]>([]);
    const [types, setTypes] = useState<SelectOption[]>([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const [feedingsData, livestockData, farmsData, typesData] = await Promise.all([
                feedingApi.list(),
                livestockApi.list(),
                farmApi.list(),
                feedingTypeApi.list(),
            ]);

            const livestockMap = new Map(livestockData.map((l: Livestock) => [l.uuid, `${l.name || 'Unnamed'} (${l.identificationNumber || l.dummyTagId || 'No Tag'})`]));
            const farmMap = new Map(farmsData.map((f: Farm) => [f.uuid, f.name]));
            const typeMap = new Map(typesData.map((t: FeedingType) => [t.id, t.name]));

            const enrichedData = feedingsData.map((f: Feeding) => ({
                ...f,
                livestockName: f.livestockUuid ? livestockMap.get(f.livestockUuid) : '-',
                farmName: f.farmUuid ? farmMap.get(f.farmUuid) : '-',
                typeName: f.feedingTypeId ? typeMap.get(f.feedingTypeId) : '-',
            }));

            setData(enrichedData);

            setLivestock(livestockData.map((l: Livestock) => ({
                value: l.uuid,
                label: `${l.name || 'Unnamed'} (${l.identificationNumber || l.dummyTagId || 'No Tag'})`
            })));

            setFarms(farmsData.map((f: Farm) => ({ value: f.uuid, label: f.name })));
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
        { id: 'uuid', header: 'UUID', accessorKey: 'uuid', size: 100 },
        { id: 'livestockName', header: 'Livestock', accessorKey: 'livestockName' },
        { id: 'farmName', header: 'Farm', accessorKey: 'farmName' },
        {
            id: 'eventDate',
            header: 'Date',
            accessorFn: (row) => row.eventDate ? formatDate(row.eventDate) : (row.created_at ? formatDate(row.created_at) : '-'),
        },
        { id: 'typeName', header: 'Type', accessorKey: 'typeName' },
        { id: 'amount', header: 'Amount', accessorKey: 'amount' },
    ];

    const formFields: FormField<Feeding>[] = [
        {
            name: 'farmUuid' as keyof Feeding,
            label: 'Farm',
            type: 'select',
            required: true,
            options: farms,
            placeholder: 'Select farm',
        },
        {
            name: 'livestockUuid' as keyof Feeding,
            label: 'Livestock',
            type: 'select',
            required: true,
            options: livestock,
            placeholder: 'Select livestock',
        },
        {
            name: 'eventDate' as keyof Feeding,
            label: 'Date',
            type: 'date',
            required: true,
        },
        {
            name: 'feedingTypeId' as keyof Feeding,
            label: 'Feeding Type',
            type: 'select',
            options: types,
            placeholder: 'Select type',
        },
        {
            name: 'amount' as keyof Feeding,
            label: 'Amount',
            type: 'text',
        },
        {
            name: 'nextFeedingTime' as keyof Feeding,
            label: 'Next Feeding Time',
            type: 'datetime',
        },
        {
            name: 'remarks' as keyof Feeding,
            label: 'Remarks',
            type: 'textarea',
            placeholder: 'Comments',
        },
    ];

    const detailFields = [
        { key: 'uuid' as keyof FeedingDisplay, label: 'UUID' },
        { key: 'livestockName' as keyof FeedingDisplay, label: 'Livestock' },
        { key: 'farmName' as keyof FeedingDisplay, label: 'Farm' },
        { key: 'eventDate' as keyof FeedingDisplay, label: 'Date', render: (val: unknown) => val ? formatDate(String(val)) : '-' },
        { key: 'typeName' as keyof FeedingDisplay, label: 'Type' },
        { key: 'amount' as keyof FeedingDisplay, label: 'Amount' },
        { key: 'nextFeedingTime' as keyof FeedingDisplay, label: 'Next Feeding', render: (val: unknown) => val ? formatDate(String(val)) : '-' },
        { key: 'remarks' as keyof FeedingDisplay, label: 'Remarks' },
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
            formFields={formFields as any}
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
