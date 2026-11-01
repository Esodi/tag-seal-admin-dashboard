import { useState, useEffect, useCallback } from 'react';
import { CrudPage, DataTableColumn, FormField } from '../../components/crud';
import { referenceApi } from '../../services/api';
import { ReproductiveProblem } from '../../types/entities';

export function ReproductiveProblemsPage() {
    const [data, setData] = useState<ReproductiveProblem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const result = await referenceApi.reproductiveProblems.list();
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

    const columns: DataTableColumn<ReproductiveProblem>[] = [
        { id: 'id', header: 'ID', accessorKey: 'id', size: 80 },
        { id: 'name', header: 'Name', accessorKey: 'name' },
        { id: 'created_at', header: 'Created At', accessorKey: 'created_at', size: 150 },
    ];

    const formFields: FormField<Partial<ReproductiveProblem>>[] = [
        {
            name: 'name',
            label: 'Name',
            type: 'text',
            required: true,
            placeholder: 'e.g. Cystic Ovaries, Metritis',
        },
    ];

    const handleCreate = async (item: Partial<ReproductiveProblem>) => {
        await referenceApi.reproductiveProblems.create(item as ReproductiveProblem);
    };

    const handleUpdate = async (id: number | string, item: Partial<ReproductiveProblem>) => {
        await referenceApi.reproductiveProblems.update(Number(id), item as ReproductiveProblem);
    };

    const handleDelete = async (id: number | string) => {
        await referenceApi.reproductiveProblems.delete(Number(id));
    };

    return (
        <CrudPage
            title="Reproductive Problems"
            description="Manage reproductive health problems"
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

export default ReproductiveProblemsPage;
