import { useState, useEffect, useCallback } from 'react';
import { CrudPage, DataTableColumn, FormField } from '../../components/crud';
import { referenceApi } from '../../services/api';
import { LivestockObtainedMethod } from '../../types/entities';

export function LivestockObtainedMethodsPage() {
    const [methods, setMethods] = useState<LivestockObtainedMethod[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const data = await referenceApi.livestockObtainedMethods.list();
            setMethods(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const columns: DataTableColumn<LivestockObtainedMethod>[] = [
        { id: 'id', header: 'ID', accessorKey: 'id', size: 80 },
        { id: 'name', header: 'Method Name', accessorKey: 'name' },
    ];

    const formFields: FormField<Partial<LivestockObtainedMethod>>[] = [
        {
            name: 'name',
            label: 'Method Name',
            type: 'text',
            required: true,
            placeholder: 'e.g., Purchased, Born on Farm, Gift',
        },
    ];

    const detailFields = [
        { key: 'id' as keyof LivestockObtainedMethod, label: 'ID' },
        { key: 'name' as keyof LivestockObtainedMethod, label: 'Method Name' },
    ];

    const handleCreate = async (data: Partial<LivestockObtainedMethod>) => {
        await referenceApi.livestockObtainedMethods.create(data as LivestockObtainedMethod);
    };

    const handleUpdate = async (id: number | string, data: Partial<LivestockObtainedMethod>) => {
        await referenceApi.livestockObtainedMethods.update(Number(id), data as LivestockObtainedMethod);
    };

    const handleDelete = async (id: number | string) => {
        await referenceApi.livestockObtainedMethods.delete(Number(id));
    };

    return (
        <CrudPage
            title="Livestock Obtained Methods"
            description="Manage methods of how livestock was obtained"
            data={methods}
            loading={loading}
            error={error}
            columns={columns}
            formFields={formFields}
            detailFields={detailFields}
            formColumns={1}
            onCreate={handleCreate}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onRefresh={fetchData}
            createLabel="Add Method"
            createModalSize="sm"
            editModalSize="sm"
        />
    );
}

export default LivestockObtainedMethodsPage;
