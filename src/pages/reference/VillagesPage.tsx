import { useState, useEffect, useCallback } from 'react';
import { CrudPage, DataTableColumn, FormField } from '../../components/crud';
import { locationApi } from '../../services/api';
import { Village, Ward } from '../../types/entities';

export function VillagesPage() {
    const [villages, setVillages] = useState<Village[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const [villagesData, wardsData] = await Promise.all([
                locationApi.villages.list(),
                locationApi.wards.list(),
            ]);
            setVillages(villagesData);
            setWards(wardsData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const columns: DataTableColumn<Village>[] = [
        { id: 'id', header: 'ID', accessorKey: 'id', size: 80 },
        { id: 'name', header: 'Village Name', accessorKey: 'name' },
        {
            id: 'ward',
            header: 'Ward',
            accessorFn: (row) => {
                const ward = wards.find((w) => w.id === row.wardId);
                return ward?.name || '-';
            },
        },
    ];

    const formFields: FormField<Partial<Village>>[] = [
        {
            name: 'name',
            label: 'Village Name',
            type: 'text',
            required: true,
            placeholder: 'e.g., Msasani',
        },
        {
            name: 'wardId',
            label: 'Ward',
            type: 'select',
            required: true,
            options: wards.map((w) => ({ value: w.id, label: w.name })),
            placeholder: 'Select ward',
        },
    ];

    const detailFields = [
        { key: 'id' as keyof Village, label: 'ID' },
        { key: 'name' as keyof Village, label: 'Village Name' },
        {
            key: 'wardId' as keyof Village,
            label: 'Ward',
            render: (value: unknown) => {
                const ward = wards.find((w) => w.id === value);
                return ward?.name || '-';
            },
        },
    ];

    const handleCreate = async (data: Partial<Village>) => {
        await locationApi.villages.create(data as Village);
    };

    const handleUpdate = async (id: number | string, data: Partial<Village>) => {
        await locationApi.villages.update(Number(id), data as Village);
    };

    const handleDelete = async (id: number | string) => {
        await locationApi.villages.delete(Number(id));
    };

    return (
        <CrudPage
            title="Villages"
            description="Manage village records within wards"
            data={villages}
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
            createLabel="Add Village"
            createModalSize="sm"
            editModalSize="sm"
        />
    );
}

export default VillagesPage;
