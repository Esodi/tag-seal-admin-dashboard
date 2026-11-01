import { useState, useEffect, useCallback } from 'react';
import { CrudPage, DataTableColumn, FormField } from '../../components/crud';
import { referenceApi } from '../../services/api';
import { IdentityCardType } from '../../types/entities';

export function IdentityCardTypesPage() {
    const [types, setTypes] = useState<IdentityCardType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const data = await referenceApi.identityCardTypes.list();
            setTypes(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const columns: DataTableColumn<IdentityCardType>[] = [
        { id: 'id', header: 'ID', accessorKey: 'id', size: 80 },
        { id: 'name', header: 'Card Type', accessorKey: 'name' },
    ];

    const formFields: FormField<Partial<IdentityCardType>>[] = [
        {
            name: 'name',
            label: 'Card Type Name',
            type: 'text',
            required: true,
            placeholder: 'e.g., NIDA, Passport, Driving License',
        },
    ];

    const detailFields = [
        { key: 'id' as keyof IdentityCardType, label: 'ID' },
        { key: 'name' as keyof IdentityCardType, label: 'Card Type' },
    ];

    const handleCreate = async (data: Partial<IdentityCardType>) => {
        await referenceApi.identityCardTypes.create(data as IdentityCardType);
    };

    const handleUpdate = async (id: number | string, data: Partial<IdentityCardType>) => {
        await referenceApi.identityCardTypes.update(Number(id), data as IdentityCardType);
    };

    const handleDelete = async (id: number | string) => {
        await referenceApi.identityCardTypes.delete(Number(id));
    };

    return (
        <CrudPage
            title="Identity Card Types"
            description="Manage types of identity documents"
            data={types}
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

export default IdentityCardTypesPage;
