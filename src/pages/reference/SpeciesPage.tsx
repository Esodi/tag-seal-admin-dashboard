import { useState, useEffect, useCallback } from 'react';
import { CrudPage, DataTableColumn, FormField } from '../../components/crud';
import { referenceApi } from '../../services/api';
import { Specie } from '../../types/entities';

export function SpeciesPage() {
    const [species, setSpecies] = useState<Specie[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const data = await referenceApi.species.list();
            setSpecies(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load species');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const columns: DataTableColumn<Specie>[] = [
        { id: 'id', header: 'ID', accessorKey: 'id', size: 80 },
        { id: 'name', header: 'Species Name', accessorKey: 'name' },
    ];

    const formFields: FormField<Partial<Specie>>[] = [
        {
            name: 'name',
            label: 'Species Name',
            type: 'text',
            required: true,
            placeholder: 'e.g., Cattle, Goat, Sheep',
        },
    ];

    const detailFields = [
        { key: 'id' as keyof Specie, label: 'ID' },
        { key: 'name' as keyof Specie, label: 'Species Name' },
    ];

    const handleCreate = async (data: Partial<Specie>) => {
        await referenceApi.species.create(data as Specie);
    };

    const handleUpdate = async (id: number | string, data: Partial<Specie>) => {
        await referenceApi.species.update(Number(id), data as Specie);
    };

    const handleDelete = async (id: number | string) => {
        await referenceApi.species.delete(Number(id));
    };

    return (
        <CrudPage
            title="Species"
            description="Manage livestock species types"
            data={species}
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
            createLabel="Add Species"
            createModalSize="sm"
            editModalSize="sm"
        />
    );
}

export default SpeciesPage;
