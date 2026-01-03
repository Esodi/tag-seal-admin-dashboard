import { useState, useEffect, useCallback } from 'react';
import { CrudPage, DataTableColumn, FormField } from '../../components/crud';
import { locationApi } from '../../services/api';
import { Street, Village } from '../../types/entities';

export function StreetsPage() {
    const [streets, setStreets] = useState<Street[]>([]);
    const [villages, setVillages] = useState<Village[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const [streetsData, villagesData] = await Promise.all([
                locationApi.streets.list(),
                locationApi.villages.list(),
            ]);
            setStreets(streetsData);
            setVillages(villagesData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const columns: DataTableColumn<Street>[] = [
        { id: 'id', header: 'ID', accessorKey: 'id', size: 80 },
        { id: 'name', header: 'Street Name', accessorKey: 'name' },
        {
            id: 'village',
            header: 'Village',
            accessorFn: (row) => {
                const village = villages.find((v) => v.id === row.villageId);
                return village?.name || '-';
            },
        },
    ];

    const formFields: FormField<Partial<Street>>[] = [
        {
            name: 'name',
            label: 'Street Name',
            type: 'text',
            required: true,
            placeholder: 'e.g., Bagamoyo Road',
        },
        {
            name: 'villageId',
            label: 'Village',
            type: 'select',
            required: true,
            options: villages.map((v) => ({ value: v.id, label: v.name })),
            placeholder: 'Select village',
        },
    ];

    const detailFields = [
        { key: 'id' as keyof Street, label: 'ID' },
        { key: 'name' as keyof Street, label: 'Street Name' },
        {
            key: 'villageId' as keyof Street,
            label: 'Village',
            render: (value: unknown) => {
                const village = villages.find((v) => v.id === value);
                return village?.name || '-';
            },
        },
    ];

    const handleCreate = async (data: Partial<Street>) => {
        await locationApi.streets.create(data as Street);
    };

    const handleUpdate = async (id: number | string, data: Partial<Street>) => {
        await locationApi.streets.update(Number(id), data as Street);
    };

    const handleDelete = async (id: number | string) => {
        await locationApi.streets.delete(Number(id));
    };

    return (
        <CrudPage
            title="Streets"
            description="Manage street records within villages"
            data={streets}
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
            createLabel="Add Street"
            createModalSize="sm"
            editModalSize="sm"
        />
    );
}

export default StreetsPage;
