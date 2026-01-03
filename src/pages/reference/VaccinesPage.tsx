import { useState, useEffect, useCallback } from 'react';
import { CrudPage, DataTableColumn, FormField, SelectOption } from '../../components/crud';
import { referenceApi } from '../../services/api';
import { Vaccine, VaccineType } from '../../types/entities';
import { formatDate } from '../../lib/utils';

interface VaccineDisplay extends Vaccine {
    typeName?: string;
}

export function VaccinesPage() {
    const [data, setData] = useState<VaccineDisplay[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    const [types, setTypes] = useState<SelectOption[]>([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const [vaccinesData, typesData] = await Promise.all([
                referenceApi.vaccines.list(),
                referenceApi.vaccineTypes.list(),
            ]);

            const typeMap = new Map(typesData.map((t: VaccineType) => [t.id, t.name]));

            const enrichedData = vaccinesData.map((v: Vaccine) => ({
                ...v,
                typeName: v.vaccineTypeId ? typeMap.get(v.vaccineTypeId) : 'Unknown Type',
            }));

            setData(enrichedData);
            setTypes(typesData.map((t: VaccineType) => ({ value: t.id, label: t.name })));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load vaccines');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const columns: DataTableColumn<VaccineDisplay>[] = [
        { id: 'id', header: 'ID', accessorKey: 'id', size: 80 },
        { id: 'name', header: 'Name', accessorKey: 'name' },
        { id: 'typeName', header: 'Type', accessorKey: 'typeName' },
        { id: 'manufacturer', header: 'Manufacturer', accessorKey: 'manufacturer' },
    ];

    const formFields: FormField<Partial<Vaccine>>[] = [
        {
            name: 'name',
            label: 'Vaccine Name',
            type: 'text',
            required: true,
            placeholder: 'Enter vaccine name',
        },
        {
            name: 'vaccineTypeId',
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
        { key: 'id' as keyof VaccineDisplay, label: 'ID' },
        { key: 'name' as keyof VaccineDisplay, label: 'Name' },
        { key: 'typeName' as keyof VaccineDisplay, label: 'Type' },
        { key: 'manufacturer' as keyof VaccineDisplay, label: 'Manufacturer' },
        { key: 'description' as keyof VaccineDisplay, label: 'Description' },
        {
            key: 'created_at' as keyof VaccineDisplay,
            label: 'Created',
            render: (value: unknown) => value ? formatDate(String(value)) : '-',
        },
    ];

    const handleCreate = async (item: Partial<Vaccine>) => {
        await referenceApi.vaccines.create(item as Vaccine);
    };

    const handleUpdate = async (id: number | string, item: Partial<Vaccine>) => {
        await referenceApi.vaccines.update(Number(id), item as Vaccine);
    };

    const handleDelete = async (id: number | string) => {
        await referenceApi.vaccines.delete(Number(id));
    };

    return (
        <CrudPage
            title="Vaccines"
            description={`Manage vaccines - ${data.length} records`}
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
            createLabel="Add Vaccine"
            createModalSize="md"
            editModalSize="md"
        />
    );
}

export default VaccinesPage;
