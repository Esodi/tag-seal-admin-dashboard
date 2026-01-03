import { useState, useEffect, useCallback } from 'react';
import { CrudPage, DataTableColumn, FormField } from '../../components/crud';
import { referenceApi } from '../../services/api';
import { BirthProblem } from '../../types/entities';

export function BirthProblemsPage() {
    const [data, setData] = useState<BirthProblem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const result = await referenceApi.birthProblems.list();
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

    const columns: DataTableColumn<BirthProblem>[] = [
        { id: 'id', header: 'ID', accessorKey: 'id', size: 80 },
        { id: 'name', header: 'Name', accessorKey: 'name' },
        { id: 'created_at', header: 'Created At', accessorKey: 'created_at', size: 150 },
    ];

    const formFields: FormField<Partial<BirthProblem>>[] = [
        {
            name: 'name',
            label: 'Name',
            type: 'text',
            required: true,
            placeholder: 'e.g. Dystocia, Stillbirth',
        },
    ];

    const handleCreate = async (item: Partial<BirthProblem>) => {
        await referenceApi.birthProblems.create(item as BirthProblem);
    };

    const handleUpdate = async (id: number | string, item: Partial<BirthProblem>) => {
        await referenceApi.birthProblems.update(Number(id), item as BirthProblem);
    };

    const handleDelete = async (id: number | string) => {
        await referenceApi.birthProblems.delete(Number(id));
    };

    return (
        <CrudPage
            title="Birth Problems"
            description="Manage problems encountered during birth"
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

export default BirthProblemsPage;
