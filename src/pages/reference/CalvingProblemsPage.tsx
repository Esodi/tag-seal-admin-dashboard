import { useState, useEffect, useCallback } from 'react';
import { CrudPage, DataTableColumn, FormField } from '../../components/crud';
import { referenceApi } from '../../services/api';
import { CalvingProblem } from '../../types/entities';

export function CalvingProblemsPage() {
    const [data, setData] = useState<CalvingProblem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const result = await referenceApi.calvingProblems.list();
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

    const columns: DataTableColumn<CalvingProblem>[] = [
        { id: 'id', header: 'ID', accessorKey: 'id', size: 80 },
        { id: 'name', header: 'Name', accessorKey: 'name' },
        { id: 'created_at', header: 'Created At', accessorKey: 'created_at', size: 150 },
    ];

    const formFields: FormField<Partial<CalvingProblem>>[] = [
        {
            name: 'name',
            label: 'Name',
            type: 'text',
            required: true,
            placeholder: 'e.g. Milk Fever, Retained Placenta',
        },
    ];

    const handleCreate = async (item: Partial<CalvingProblem>) => {
        await referenceApi.calvingProblems.create(item as CalvingProblem);
    };

    const handleUpdate = async (id: number | string, item: Partial<CalvingProblem>) => {
        await referenceApi.calvingProblems.update(Number(id), item as CalvingProblem);
    };

    const handleDelete = async (id: number | string) => {
        await referenceApi.calvingProblems.delete(Number(id));
    };

    return (
        <CrudPage
            title="Calving Problems"
            description="Manage problems encountered during calving"
            data={data}
            loading={loading}
            error={error}
            columns={columns}
            formFields={formFields}
            onCreate={handleCreate}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onRefresh={fetchData}
            createLabel="Add Problem"
        />
    );
}

export default CalvingProblemsPage;
