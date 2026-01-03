import { useState, useEffect, useCallback } from 'react';
import { CrudPage, DataTableColumn, FormField } from '../../components/crud';
import { referenceApi } from '../../services/api';
import { SchoolLevel } from '../../types/entities';

export function SchoolLevelsPage() {
    const [levels, setLevels] = useState<SchoolLevel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const data = await referenceApi.schoolLevels.list();
            setLevels(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const columns: DataTableColumn<SchoolLevel>[] = [
        { id: 'id', header: 'ID', accessorKey: 'id', size: 80 },
        { id: 'name', header: 'Education Level', accessorKey: 'name' },
    ];

    const formFields: FormField<Partial<SchoolLevel>>[] = [
        {
            name: 'name',
            label: 'Education Level',
            type: 'text',
            required: true,
            placeholder: 'e.g., Primary, Secondary, University',
        },
    ];

    const detailFields = [
        { key: 'id' as keyof SchoolLevel, label: 'ID' },
        { key: 'name' as keyof SchoolLevel, label: 'Education Level' },
    ];

    const handleCreate = async (data: Partial<SchoolLevel>) => {
        await referenceApi.schoolLevels.create(data as SchoolLevel);
    };

    const handleUpdate = async (id: number | string, data: Partial<SchoolLevel>) => {
        await referenceApi.schoolLevels.update(Number(id), data as SchoolLevel);
    };

    const handleDelete = async (id: number | string) => {
        await referenceApi.schoolLevels.delete(Number(id));
    };

    return (
        <CrudPage
            title="School Levels"
            description="Manage education level classifications"
            data={levels}
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
            createLabel="Add Level"
            createModalSize="sm"
            editModalSize="sm"
        />
    );
}

export default SchoolLevelsPage;
