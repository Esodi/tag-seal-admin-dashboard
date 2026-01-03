import { useState, useEffect, useCallback } from 'react';
import { CrudPage, DataTableColumn, FormField } from '../../components/crud';
import { referenceApi } from '../../services/api';
import { InseminationService } from '../../types/entities';

export function InseminationServicesPage() {
    const [data, setData] = useState<InseminationService[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const result = await referenceApi.inseminationServices.list();
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

    const columns: DataTableColumn<InseminationService>[] = [
        { id: 'id', header: 'ID', accessorKey: 'id', size: 80 },
        { id: 'name', header: 'Name', accessorKey: 'name' },
        { id: 'created_at', header: 'Created At', accessorKey: 'created_at', size: 150 },
    ];

    const formFields: FormField<Partial<InseminationService>>[] = [
        {
            name: 'name',
            label: 'Name',
            type: 'text',
            required: true,
            placeholder: 'e.g. AI Service, Natural Service',
        },
    ];

    const handleCreate = async (item: Partial<InseminationService>) => {
        await referenceApi.inseminationServices.create(item as InseminationService);
    };

    const handleUpdate = async (id: number | string, item: Partial<InseminationService>) => {
        await referenceApi.inseminationServices.update(Number(id), item as InseminationService);
    };

    const handleDelete = async (id: number | string) => {
        await referenceApi.inseminationServices.delete(Number(id));
    };

    return (
        <CrudPage
            title="Insemination Services"
            description="Manage types of insemination services"
            data={data}
            loading={loading}
            error={error}
            columns={columns}
            formFields={formFields}
            onCreate={handleCreate}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onRefresh={fetchData}
            createLabel="Add Service"
        />
    );
}

export default InseminationServicesPage;
