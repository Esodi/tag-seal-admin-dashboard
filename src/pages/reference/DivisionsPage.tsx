import { useState, useEffect, useCallback } from 'react';
import { CrudPage, DataTableColumn, FormField } from '../../components/crud';
import { locationApi } from '../../services/api';
import { Division, District } from '../../types/entities';

export function DivisionsPage() {
    const [divisions, setDivisions] = useState<Division[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const [divisionsData, districtsData] = await Promise.all([
                locationApi.divisions.list(),
                locationApi.districts.list(),
            ]);
            setDivisions(divisionsData);
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

    const columns: DataTableColumn<Division>[] = [
        { id: 'id', header: 'ID', accessorKey: 'id', size: 80 },
        { id: 'name', header: 'Division Name', accessorKey: 'name' },
        {
            id: 'district',
            header: 'District',
            accessorFn: (row) => {
                const district = districts.find((d) => d.id === row.districtId);
                return district?.name || '-';
            },
        },
    ];

    const formFields: FormField<Partial<Division>>[] = [
        {
            name: 'name',
            label: 'Division Name',
            type: 'text',
            required: true,
            placeholder: 'e.g., Urban Division',
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
        { key: 'id' as keyof Division, label: 'ID' },
        { key: 'name' as keyof Division, label: 'Division Name' },
        {
            key: 'districtId' as keyof Division,
            label: 'District',
            render: (value: unknown) => {
                const district = districts.find((d) => d.id === value);
                return district?.name || '-';
            },
        },
    ];

    const handleCreate = async (data: Partial<Division>) => {
        await locationApi.divisions.create(data as Division);
    };

    const handleUpdate = async (id: number | string, data: Partial<Division>) => {
        await locationApi.divisions.update(Number(id), data as Division);
    };

    const handleDelete = async (id: number | string) => {
        await locationApi.divisions.delete(Number(id));
    };

    return (
        <CrudPage
            title="Divisions"
            description="Manage administrative divisions within districts"
            data={divisions}
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
            createLabel="Add Division"
            createModalSize="sm"
            editModalSize="sm"
        />
    );
}

export default DivisionsPage;
