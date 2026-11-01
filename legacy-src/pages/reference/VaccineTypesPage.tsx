import { useState, useEffect, useCallback } from 'react';
import { CrudPage, DataTableColumn, FormField } from '../../components/crud';
import { referenceApi } from '../../services/api';
import { VaccineType } from '../../types/entities';
import { formatDate } from '../../lib/utils';

export function VaccineTypesPage() {
    const [data, setData] = useState<VaccineType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const result = await referenceApi.vaccineTypes.list();
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load vaccine types');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const columns: DataTableColumn<VaccineType>[] = [
        { id: 'id', header: 'ID', accessorKey: 'id', size: 80 },
        { id: 'name', header: 'Name', accessorKey: 'name' },
    ];

    const formFields: FormField<Partial<VaccineType>>[] = [
        {
            name: 'name',
            label: 'Type Name',
            type: 'text',
            required: true,
            placeholder: 'Enter vaccine type name',
        },
    ];

    const detailFields = [
        { key: 'id' as keyof VaccineType, label: 'ID' },
        { key: 'name' as keyof VaccineType, label: 'Name' },
        {
            key: 'created_at' as keyof VaccineType,
            label: 'Created',
            render: (value: unknown) => value ? formatDate(String(value)) : '-',
        },
    ];

    const handleCreate = async (item: Partial<VaccineType>) => {
        await referenceApi.vaccineTypes.create(item as VaccineType);
    };

    const handleUpdate = async (id: number | string, item: Partial<VaccineType>) => {
        await referenceApi.vaccineTypes.update(Number(id), item as VaccineType);
    };

    const handleDelete = async (id: number | string) => {
        await referenceApi.vaccineTypes.delete(Number(id));
    };

    return (
        <CrudPage
            title="Vaccine Types"
            description={`Manage vaccine categories - ${data.length} records`}
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
            createLabel="Add Vaccine Type"
            createModalSize="sm"
            editModalSize="sm"
        />
    );
}

export default VaccineTypesPage;
