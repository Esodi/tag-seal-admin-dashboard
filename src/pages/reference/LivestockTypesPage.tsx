import { useState, useEffect, useCallback } from 'react';
import { CrudPage, DataTableColumn, FormField } from '../../components/crud';
import { referenceApi } from '../../services/api';
import { LivestockType } from '../../types/entities';

export function LivestockTypesPage() {
    const [livestockTypes, setLivestockTypes] = useState<LivestockType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const data = await referenceApi.livestockTypes.list();
            setLivestockTypes(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load livestock types');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const columns: DataTableColumn<LivestockType>[] = [
        { id: 'id', header: 'ID', accessorKey: 'id', size: 80 },
        { id: 'name', header: 'Type Name', accessorKey: 'name' },
    ];

    const formFields: FormField<Partial<LivestockType>>[] = [
        {
            name: 'name',
            label: 'Type Name',
            type: 'text',
            required: true,
            placeholder: 'e.g., Dairy, Beef, Poultry',
        },
    ];

    const detailFields = [
        { key: 'id' as keyof LivestockType, label: 'ID' },
        { key: 'name' as keyof LivestockType, label: 'Type Name' },
    ];

    const handleCreate = async (data: Partial<LivestockType>) => {
        await referenceApi.livestockTypes.create(data as LivestockType);
    };

    const handleUpdate = async (id: number | string, data: Partial<LivestockType>) => {
        await referenceApi.livestockTypes.update(Number(id), data as LivestockType);
    };

    const handleDelete = async (id: number | string) => {
        await referenceApi.livestockTypes.delete(Number(id));
    };

    return (
        <CrudPage
            title="Livestock Types"
            description="Manage livestock category types"
            data={livestockTypes}
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
            createLabel="Add Type"
            createModalSize="sm"
            editModalSize="sm"
        />
    );
}

export default LivestockTypesPage;
