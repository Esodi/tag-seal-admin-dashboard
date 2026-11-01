import { useState, useEffect, useCallback } from 'react';
import { CrudPage, DataTableColumn, FormField } from '../../components/crud';
import { referenceApi } from '../../services/api';
import { MedicineType } from '../../types/entities';
import { formatDate } from '../../lib/utils';

export function MedicineTypesPage() {
    const [data, setData] = useState<MedicineType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const result = await referenceApi.medicineTypes.list();
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load medicine types');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const columns: DataTableColumn<MedicineType>[] = [
        { id: 'id', header: 'ID', accessorKey: 'id', size: 80 },
        { id: 'name', header: 'Name', accessorKey: 'name' },
    ];

    const formFields: FormField<Partial<MedicineType>>[] = [
        {
            name: 'name',
            label: 'Type Name',
            type: 'text',
            required: true,
            placeholder: 'Enter medicine type name',
        },
    ];

    const detailFields = [
        { key: 'id' as keyof MedicineType, label: 'ID' },
        { key: 'name' as keyof MedicineType, label: 'Name' },
        {
            key: 'created_at' as keyof MedicineType,
            label: 'Created',
            render: (value: unknown) => value ? formatDate(String(value)) : '-',
        },
    ];

    const handleCreate = async (item: Partial<MedicineType>) => {
        await referenceApi.medicineTypes.create(item as MedicineType);
    };

    const handleUpdate = async (id: number | string, item: Partial<MedicineType>) => {
        await referenceApi.medicineTypes.update(Number(id), item as MedicineType);
    };

    const handleDelete = async (id: number | string) => {
        await referenceApi.medicineTypes.delete(Number(id));
    };

    return (
        <CrudPage
            title="Medicine Types"
            description={`Manage medicine categories - ${data.length} records`}
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
            createLabel="Add Medicine Type"
            createModalSize="sm"
            editModalSize="sm"
        />
    );
}

export default MedicineTypesPage;
