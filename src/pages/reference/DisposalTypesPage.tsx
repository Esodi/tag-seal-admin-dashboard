import { useState, useEffect, useCallback } from 'react';
import { CrudPage, DataTableColumn, FormField } from '../../components/crud';
import { referenceApi } from '../../services/api';
import { DisposalType } from '../../types/entities';

export function DisposalTypesPage() {
    const [data, setData] = useState<DisposalType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const result = await referenceApi.disposalTypes.list();
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

    const columns: DataTableColumn<DisposalType>[] = [
        { id: 'id', header: 'ID', accessorKey: 'id', size: 80 },
        { id: 'name', header: 'Name', accessorKey: 'name' },
        { id: 'created_at', header: 'Created At', accessorKey: 'created_at', size: 150 },
    ];

    const formFields: FormField<Partial<DisposalType>>[] = [
        {
            name: 'name',
            label: 'Name',
            type: 'text',
            required: true,
            placeholder: 'e.g. Sale, Death, Slaughter',
        },
    ];

    const handleCreate = async (item: Partial<DisposalType>) => {
        await referenceApi.disposalTypes.create(item as DisposalType);
    };

    const handleUpdate = async (id: number | string, item: Partial<DisposalType>) => {
        await referenceApi.disposalTypes.update(Number(id), item as DisposalType);
    };

    const handleDelete = async (id: number | string) => {
        await referenceApi.disposalTypes.delete(Number(id));
    };

    return (
        <CrudPage
            title="Disposal Types"
            description="Manage reasons/methods for livestock disposal"
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

export default DisposalTypesPage;
