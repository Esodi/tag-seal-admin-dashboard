import { useState, useEffect, useCallback } from 'react';
import { CrudPage, DataTableColumn, FormField } from '../../components/crud';
import { referenceApi } from '../../services/api';
import { Disease } from '../../types/entities';
import { formatDate } from '../../lib/utils';

export function DiseasesPage() {
    const [data, setData] = useState<Disease[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const result = await referenceApi.diseases.list();
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load diseases');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const columns: DataTableColumn<Disease>[] = [
        { id: 'id', header: 'ID', accessorKey: 'id', size: 80 },
        { id: 'name', header: 'Name', accessorKey: 'name' },
        { id: 'description', header: 'Description', accessorKey: 'description' },
    ];

    const formFields: FormField<Partial<Disease>>[] = [
        {
            name: 'name',
            label: 'Disease Name',
            type: 'text',
            required: true,
            placeholder: 'Enter disease name',
        },
        {
            name: 'description',
            label: 'Description',
            type: 'textarea',
            placeholder: 'Enter disease description',
        },
    ];

    const detailFields = [
        { key: 'id' as keyof Disease, label: 'ID' },
        { key: 'name' as keyof Disease, label: 'Name' },
        { key: 'description' as keyof Disease, label: 'Description' },
        {
            key: 'created_at' as keyof Disease,
            label: 'Created',
            render: (value: unknown) => value ? formatDate(String(value)) : '-',
        },
    ];

    const handleCreate = async (item: Partial<Disease>) => {
        await referenceApi.diseases.create(item as Disease);
    };

    const handleUpdate = async (id: number | string, item: Partial<Disease>) => {
        await referenceApi.diseases.update(Number(id), item as Disease);
    };

    const handleDelete = async (id: number | string) => {
        await referenceApi.diseases.delete(Number(id));
    };

    return (
        <CrudPage
            title="Diseases"
            description={`Manage livestock diseases - ${data.length} records`}
            data={data}
            loading={loading}
            error={error}
            columns={columns}
            formFields={formFields}
            detailFields={detailFields}
            onCreate={handleCreate}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onRefresh={fetchData}
            createLabel="Add Disease"
            createModalSize="md"
            editModalSize="md"
        />
    );
}

export default DiseasesPage;
