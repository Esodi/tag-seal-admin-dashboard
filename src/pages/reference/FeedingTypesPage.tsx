import { useState, useEffect, useCallback } from 'react';
import { CrudPage, DataTableColumn, FormField } from '../../components/crud';
import { referenceApi } from '../../services/api';
import { FeedingType } from '../../types/entities';

export function FeedingTypesPage() {
    const [data, setData] = useState<FeedingType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const result = await referenceApi.feedingTypes.list();
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const columns: DataTableColumn<FeedingType>[] = [
        { id: 'id', header: 'ID', accessorKey: 'id', size: 80 },
        { id: 'name', header: 'Name', accessorKey: 'name' },
        { id: 'created_at', header: 'Created At', accessorKey: 'created_at', size: 150 },
    ];

    const formFields: FormField<Partial<FeedingType>>[] = [
        {
            name: 'name',
            label: 'Name',
            type: 'text',
            required: true,
            placeholder: 'e.g. Grazing, Zero Grazing, Supplemental',
        },
    ];

    const handleCreate = async (item: Partial<FeedingType>) => {
        await referenceApi.feedingTypes.create(item as FeedingType);
    };

    const handleUpdate = async (id: number | string, item: Partial<FeedingType>) => {
        await referenceApi.feedingTypes.update(Number(id), item as FeedingType);
    };

    const handleDelete = async (id: number | string) => {
        await referenceApi.feedingTypes.delete(Number(id));
    };

    return (
        <CrudPage
            title="Feeding Types"
            description="Manage types of feeding methods"
            data={data}
            loading={loading}
            error={error}
            columns={columns}
            formFields={formFields}
            onCreate={handleCreate}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onRefresh={fetchData}
            createLabel="Add Type"
        />
    );
}

export default FeedingTypesPage;
