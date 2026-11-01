import { useState, useEffect, useCallback } from 'react';
import { CrudPage, DataTableColumn, FormField } from '../../components/crud';
import { referenceApi } from '../../services/api';
import { LegalStatus } from '../../types/entities';

export function LegalStatusesPage() {
    const [statuses, setStatuses] = useState<LegalStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const data = await referenceApi.legalStatuses.list();
            setStatuses(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const columns: DataTableColumn<LegalStatus>[] = [
        { id: 'id', header: 'ID', accessorKey: 'id', size: 80 },
        { id: 'name', header: 'Legal Status', accessorKey: 'name' },
    ];

    const formFields: FormField<Partial<LegalStatus>>[] = [
        {
            name: 'name',
            label: 'Legal Status Name',
            type: 'text',
            required: true,
            placeholder: 'e.g., Individual, Company, Cooperative',
        },
    ];

    const detailFields = [
        { key: 'id' as keyof LegalStatus, label: 'ID' },
        { key: 'name' as keyof LegalStatus, label: 'Legal Status' },
    ];

    const handleCreate = async (data: Partial<LegalStatus>) => {
        await referenceApi.legalStatuses.create(data as LegalStatus);
    };

    const handleUpdate = async (id: number | string, data: Partial<LegalStatus>) => {
        await referenceApi.legalStatuses.update(Number(id), data as LegalStatus);
    };

    const handleDelete = async (id: number | string) => {
        await referenceApi.legalStatuses.delete(Number(id));
    };

    return (
        <CrudPage
            title="Legal Statuses"
            description="Manage farm legal status types"
            data={statuses}
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
            createLabel="Add Status"
            createModalSize="sm"
            editModalSize="sm"
        />
    );
}

export default LegalStatusesPage;
