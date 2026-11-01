import { useState, useEffect, useCallback } from 'react';
import { CrudPage, DataTableColumn, FormField } from '../../components/crud';
import { referenceApi } from '../../services/api';
import { HeatType } from '../../types/entities';

export function HeatTypesPage() {
    const [data, setData] = useState<HeatType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const result = await referenceApi.heatTypes.list();
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

    const columns: DataTableColumn<HeatType>[] = [
        { id: 'id', header: 'ID', accessorKey: 'id', size: 80 },
        { id: 'name', header: 'Name', accessorKey: 'name' },
        { id: 'created_at', header: 'Created At', accessorKey: 'created_at', size: 150 },
    ];

    const formFields: FormField<Partial<HeatType>>[] = [
        {
            name: 'name',
            label: 'Name',
            type: 'text',
            required: true,
            placeholder: 'e.g. Standing Heat, Mucus Discharge',
        },
    ];

    const handleCreate = async (item: Partial<HeatType>) => {
        await referenceApi.heatTypes.create(item as HeatType);
    };

    const handleUpdate = async (id: number | string, item: Partial<HeatType>) => {
        await referenceApi.heatTypes.update(Number(id), item as HeatType);
    };

    const handleDelete = async (id: number | string) => {
        await referenceApi.heatTypes.delete(Number(id));
    };

    return (
        <CrudPage
            title="Heat Types"
            description="Manage types/signs of heat (estrus)"
            data={data}
            loading={loading}
            error={error}
            columns={columns}
            formFields={formFields}
            onCreate={handleCreate}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onRefresh={fetchData}
            createLabel="Add Heat Type"
        />
    );
}

export default HeatTypesPage;
