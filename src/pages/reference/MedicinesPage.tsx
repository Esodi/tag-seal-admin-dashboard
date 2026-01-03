import { useState, useEffect, useCallback } from 'react';
import { CrudPage, DataTableColumn, FormField, SelectOption } from '../../components/crud';
import { referenceApi } from '../../services/api';
import { Medicine, MedicineType } from '../../types/entities';
import { formatDate } from '../../lib/utils';

interface MedicineDisplay extends Medicine {
    typeName?: string;
}

export function MedicinesPage() {
    const [data, setData] = useState<MedicineDisplay[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    const [types, setTypes] = useState<SelectOption[]>([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const [medicinesData, typesData] = await Promise.all([
                referenceApi.medicines.list(),
                referenceApi.medicineTypes.list(),
            ]);

            const typeMap = new Map(typesData.map((t: MedicineType) => [t.id, t.name]));

            const enrichedData = medicinesData.map((m: Medicine) => ({
                ...m,
                typeName: m.medicineTypeId ? typeMap.get(m.medicineTypeId) : 'Unknown Type',
            }));

            setData(enrichedData);
            setTypes(typesData.map((t: MedicineType) => ({ value: t.id, label: t.name })));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load medicines');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const columns: DataTableColumn<MedicineDisplay>[] = [
        { id: 'id', header: 'ID', accessorKey: 'id', size: 80 },
        { id: 'name', header: 'Name', accessorKey: 'name' },
        { id: 'typeName', header: 'Type', accessorKey: 'typeName' },
        { id: 'manufacturer', header: 'Manufacturer', accessorKey: 'manufacturer' },
    ];

    const formFields: FormField<Partial<Medicine>>[] = [
        {
            name: 'name',
            label: 'Medicine Name',
            type: 'text',
            required: true,
            placeholder: 'Enter medicine name',
        },
        {
            name: 'medicineTypeId',
            label: 'Category',
            type: 'select',
            required: true,
            options: types,
            placeholder: 'Select type',
        },
        {
            name: 'manufacturer',
            label: 'Manufacturer',
            type: 'text',
            placeholder: 'Enter manufacturer',
        },
        {
            name: 'description',
            label: 'Description',
            type: 'textarea',
            placeholder: 'Enter description (optional)',
        },
    ];

    const detailFields = [
        { key: 'id' as keyof MedicineDisplay, label: 'ID' },
        { key: 'name' as keyof MedicineDisplay, label: 'Name' },
        { key: 'typeName' as keyof MedicineDisplay, label: 'Type' },
        { key: 'manufacturer' as keyof MedicineDisplay, label: 'Manufacturer' },
        { key: 'description' as keyof MedicineDisplay, label: 'Description' },
        {
            key: 'created_at' as keyof MedicineDisplay,
            label: 'Created',
            render: (value: unknown) => value ? formatDate(String(value)) : '-',
        },
    ];

    const handleCreate = async (item: Partial<Medicine>) => {
        await referenceApi.medicines.create(item as Medicine);
    };

    const handleUpdate = async (id: number | string, item: Partial<Medicine>) => {
        await referenceApi.medicines.update(Number(id), item as Medicine);
    };

    const handleDelete = async (id: number | string) => {
        await referenceApi.medicines.delete(Number(id));
    };

    return (
        <CrudPage
            title="Medicines"
            description={`Manage medicines - ${data.length} records`}
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
            createLabel="Add Medicine"
            createModalSize="md"
            editModalSize="md"
        />
    );
}

export default MedicinesPage;
