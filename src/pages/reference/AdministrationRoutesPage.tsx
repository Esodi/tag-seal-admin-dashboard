import { useState, useEffect, useCallback } from 'react';
import { CrudPage, DataTableColumn, FormField } from '../../components/crud';
import { referenceApi } from '../../services/api';
import { AdministrationRoute } from '../../types/entities';
import { formatDate } from '../../lib/utils';

export function AdministrationRoutesPage() {
    const [data, setData] = useState<AdministrationRoute[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const result = await referenceApi.administrationRoutes.list();
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load administration routes');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const columns: DataTableColumn<AdministrationRoute>[] = [
        { id: 'id', header: 'ID', accessorKey: 'id', size: 80 },
        { id: 'name', header: 'Name', accessorKey: 'name' },
    ];

    const formFields: FormField<Partial<AdministrationRoute>>[] = [
        {
            name: 'name',
            label: 'Route Name',
            type: 'text',
            required: true,
            placeholder: 'Enter administration route (e.g. Oral)',
        },
    ];

    const detailFields = [
        { key: 'id' as keyof AdministrationRoute, label: 'ID' },
        { key: 'name' as keyof AdministrationRoute, label: 'Name' },
        {
            key: 'created_at' as keyof AdministrationRoute,
            label: 'Created',
            render: (value: unknown) => value ? formatDate(String(value)) : '-',
        },
    ];

    const handleCreate = async (item: Partial<AdministrationRoute>) => {
        await referenceApi.administrationRoutes.create(item as AdministrationRoute);
    };

    const handleUpdate = async (id: number | string, item: Partial<AdministrationRoute>) => {
        await referenceApi.administrationRoutes.update(Number(id), item as AdministrationRoute);
    };

    const handleDelete = async (id: number | string) => {
        await referenceApi.administrationRoutes.delete(Number(id));
    };

    return (
        <CrudPage
            title="Administration Routes"
            description={`Manage drug administration routes - ${data.length} records`}
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
            createLabel="Add Route"
            createModalSize="sm"
            editModalSize="sm"
        />
    );
}

export default AdministrationRoutesPage;
