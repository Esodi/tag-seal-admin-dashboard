import { useState, useEffect, useCallback } from 'react';
import { CrudPage, DataTableColumn, FormField } from '../../components/crud';
import { referenceApi } from '../../services/api';
import { CalvingType } from '../../types/entities';

export function CalvingTypesPage() {
    const [data, setData] = useState<CalvingType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const result = await referenceApi.calvingTypes.list();
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

    const columns: DataTableColumn<CalvingType>[] = [
        { id: 'id', header: 'ID', accessorKey: 'id', size: 80 },
        { id: 'name', header: 'Name', accessorKey: 'name' },
        { id: 'created_at', header: 'Created At', accessorKey: 'created_at', size: 150 },
    ];

    const formFields: FormField<Partial<CalvingType>>[] = [
        {
            name: 'name',
            label: 'Name',
            type: 'text',
            required: true,
            placeholder: 'e.g. Normal, Assisted',
        },
    ];

    const handleCreate = async (item: Partial<CalvingType>) => {
        await referenceApi.calvingTypes.create(item as CalvingType);
    };

    const handleUpdate = async (id: number | string, item: Partial<CalvingType>) => {
        await referenceApi.calvingTypes.update(Number(id), item as CalvingType);
    };

    const handleDelete = async (id: number | string) => {
        await referenceApi.calvingTypes.delete(Number(id));
    };

    return (
        <CrudPage
            title="Calving Types"
            description="Manage types of calving events"
            data={data}
            loading={loading}
            error={error}
            columns={columns}
            formFields={formFields}
            onCreate={handleCreate}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onRefresh={fetchData}
            createLabel="Add Calving Type"
        />
    );
}

export default CalvingTypesPage;
