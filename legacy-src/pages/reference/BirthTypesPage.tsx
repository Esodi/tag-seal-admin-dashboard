import { useState, useEffect, useCallback } from 'react';
import { CrudPage, DataTableColumn, FormField } from '../../components/crud';
import { referenceApi } from '../../services/api';
import { BirthType } from '../../types/entities';

export function BirthTypesPage() {
    const [data, setData] = useState<BirthType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const result = await referenceApi.birthTypes.list();
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

    const columns: DataTableColumn<BirthType>[] = [
        { id: 'id', header: 'ID', accessorKey: 'id', size: 80 },
        { id: 'name', header: 'Name', accessorKey: 'name' },
        { id: 'created_at', header: 'Created At', accessorKey: 'created_at', size: 150 },
    ];

    const formFields: FormField<Partial<BirthType>>[] = [
        {
            name: 'name',
            label: 'Name',
            type: 'text',
            required: true,
            placeholder: 'e.g. Normal, Assisted',
        },
    ];

    const handleCreate = async (item: Partial<BirthType>) => {
        await referenceApi.birthTypes.create(item as BirthType);
    };

    const handleUpdate = async (id: number | string, item: Partial<BirthType>) => {
        await referenceApi.birthTypes.update(Number(id), item as BirthType);
    };

    const handleDelete = async (id: number | string) => {
        await referenceApi.birthTypes.delete(Number(id));
    };

    return (
        <CrudPage
            title="Birth Types"
            description="Manage types of livestock births"
            data={data}
            loading={loading}
            error={error}
            columns={columns}
            formFields={formFields}
            onCreate={handleCreate}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onRefresh={fetchData}
            createLabel="Add Birth Type"
        />
    );
}

export default BirthTypesPage;
