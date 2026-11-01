import { useState, useEffect, useCallback } from 'react';
import { CrudPage, DataTableColumn, FormField } from '../../components/crud';
import { referenceApi } from '../../services/api';
import { MilkingMethod } from '../../types/entities';

export function MilkingMethodsPage() {
    const [data, setData] = useState<MilkingMethod[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const result = await referenceApi.milkingMethods.list();
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

    const columns: DataTableColumn<MilkingMethod>[] = [
        { id: 'id', header: 'ID', accessorKey: 'id', size: 80 },
        { id: 'name', header: 'Name', accessorKey: 'name' },
        { id: 'created_at', header: 'Created At', accessorKey: 'created_at', size: 150 },
    ];

    const formFields: FormField<Partial<MilkingMethod>>[] = [
        {
            name: 'name',
            label: 'Name',
            type: 'text',
            required: true,
            placeholder: 'e.g. Hand Milking, Machine Milking',
        },
    ];

    const handleCreate = async (item: Partial<MilkingMethod>) => {
        await referenceApi.milkingMethods.create(item as MilkingMethod);
    };

    const handleUpdate = async (id: number | string, item: Partial<MilkingMethod>) => {
        await referenceApi.milkingMethods.update(Number(id), item as MilkingMethod);
    };

    const handleDelete = async (id: number | string) => {
        await referenceApi.milkingMethods.delete(Number(id));
    };

    return (
        <CrudPage
            title="Milking Methods"
            description="Manage methods of milking"
            data={data}
            loading={loading}
            error={error}
            columns={columns}
            formFields={formFields}
            onCreate={handleCreate}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onRefresh={fetchData}
            createLabel="Add Method"
        />
    );
}

export default MilkingMethodsPage;
