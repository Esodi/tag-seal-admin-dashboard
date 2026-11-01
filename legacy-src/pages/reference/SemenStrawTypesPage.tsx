import { useState, useEffect, useCallback } from 'react';
import { CrudPage, DataTableColumn, FormField } from '../../components/crud';
import { referenceApi } from '../../services/api';
import { SemenStrawType } from '../../types/entities';

export function SemenStrawTypesPage() {
    const [data, setData] = useState<SemenStrawType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const result = await referenceApi.semenStrawTypes.list();
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

    const columns: DataTableColumn<SemenStrawType>[] = [
        { id: 'id', header: 'ID', accessorKey: 'id', size: 80 },
        { id: 'name', header: 'Name', accessorKey: 'name' },
        { id: 'created_at', header: 'Created At', accessorKey: 'created_at', size: 150 },
    ];

    const formFields: FormField<Partial<SemenStrawType>>[] = [
        {
            name: 'name',
            label: 'Name',
            type: 'text',
            required: true,
            placeholder: 'e.g. Sexed Semen, Conventional',
        },
    ];

    const handleCreate = async (item: Partial<SemenStrawType>) => {
        await referenceApi.semenStrawTypes.create(item as SemenStrawType);
    };

    const handleUpdate = async (id: number | string, item: Partial<SemenStrawType>) => {
        await referenceApi.semenStrawTypes.update(Number(id), item as SemenStrawType);
    };

    const handleDelete = async (id: number | string) => {
        await referenceApi.semenStrawTypes.delete(Number(id));
    };

    return (
        <CrudPage
            title="Semen Straw Types"
            description="Manage types of semen straws"
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

export default SemenStrawTypesPage;
