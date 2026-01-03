import { useState, useEffect, useCallback } from 'react';
import { CrudPage, DataTableColumn, FormField } from '../../components/crud';
import { locationApi } from '../../services/api';
import { District, Region } from '../../types/entities';

export function DistrictsPage() {
    const [districts, setDistricts] = useState<District[]>([]);
    const [regions, setRegions] = useState<Region[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const [districtsData, regionsData] = await Promise.all([
                locationApi.districts.list(),
                locationApi.regions.list(),
            ]);
            setDistricts(districtsData);
            setRegions(regionsData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const columns: DataTableColumn<District>[] = [
        { id: 'id', header: 'ID', accessorKey: 'id', size: 80 },
        { id: 'name', header: 'District Name', accessorKey: 'name' },
        {
            id: 'region',
            header: 'Region',
            accessorFn: (row) => {
                const region = regions.find((r) => r.id === row.regionId);
                return region?.name || '-';
            },
        },
    ];

    const formFields: FormField<Partial<District>>[] = [
        {
            name: 'name',
            label: 'District Name',
            type: 'text',
            required: true,
            placeholder: 'e.g., Ilala',
        },
        {
            name: 'regionId',
            label: 'Region',
            type: 'select',
            required: true,
            options: regions.map((r) => ({ value: r.id, label: r.name })),
            placeholder: 'Select region',
        },
    ];

    const detailFields = [
        { key: 'id' as keyof District, label: 'ID' },
        { key: 'name' as keyof District, label: 'District Name' },
        {
            key: 'regionId' as keyof District,
            label: 'Region',
            render: (value: unknown) => {
                const region = regions.find((r) => r.id === value);
                return region?.name || '-';
            },
        },
    ];

    const handleCreate = async (data: Partial<District>) => {
        await locationApi.districts.create(data as any);
    };

    const handleUpdate = async (id: number | string, data: Partial<District>) => {
        await locationApi.districts.update(Number(id), data as any);
    };

    const handleDelete = async (id: number | string) => {
        await locationApi.districts.delete(Number(id));
    };

    return (
        <CrudPage
            title="Districts"
            description="Manage district divisions within regions"
            data={districts}
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
            createLabel="Add District"
            createModalSize="sm"
            editModalSize="sm"
        />
    );
}

export default DistrictsPage;
