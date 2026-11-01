import { useState, useEffect, useCallback } from 'react';
import { CrudPage, DataTableColumn, FormField } from '../../components/crud';
import { locationApi } from '../../services/api';
import { Ward, District } from '../../types/entities';

export function WardsPage() {
    const [wards, setWards] = useState<Ward[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const [wardsData, districtsData] = await Promise.all([
                locationApi.wards.list(),
                locationApi.districts.list(),
            ]);
            setWards(wardsData);
            setDistricts(districtsData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const columns: DataTableColumn<Ward>[] = [
        { id: 'id', header: 'ID', accessorKey: 'id', size: 80 },
        { id: 'name', header: 'Ward Name', accessorKey: 'name' },
        {
            id: 'district',
            header: 'District',
            accessorFn: (row) => {
                const district = districts.find((d) => d.id === row.districtId);
                return district?.name || '-';
            },
        },
    ];

    const formFields: FormField<Partial<Ward>>[] = [
        {
            name: 'name',
            label: 'Ward Name',
            type: 'text',
            required: true,
            placeholder: 'e.g., Kariakoo',
        },
        {
            name: 'districtId',
            label: 'District',
            type: 'select',
            required: true,
            options: districts.map((d) => ({ value: d.id, label: d.name })),
            placeholder: 'Select district',
        },
    ];

    const detailFields = [
        { key: 'id' as keyof Ward, label: 'ID' },
        { key: 'name' as keyof Ward, label: 'Ward Name' },
        {
            key: 'districtId' as keyof Ward,
            label: 'District',
            render: (value: unknown) => {
                const district = districts.find((d) => d.id === value);
                return district?.name || '-';
            },
        },
    ];

    const handleCreate = async (data: Partial<Ward>) => {
        await locationApi.wards.create(data as Ward);
    };

    const handleUpdate = async (id: number | string, data: Partial<Ward>) => {
        await locationApi.wards.update(Number(id), data as Ward);
    };

    const handleDelete = async (id: number | string) => {
        await locationApi.wards.delete(Number(id));
    };

    return (
        <CrudPage
            title="Wards"
            description="Manage ward divisions within districts"
            data={wards}
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
            createLabel="Add Ward"
            createModalSize="sm"
            editModalSize="sm"
        />
    );
}

export default WardsPage;
