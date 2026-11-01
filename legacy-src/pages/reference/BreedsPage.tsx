import { useState, useEffect, useCallback } from 'react';
import { CrudPage, DataTableColumn, FormField } from '../../components/crud';
import { referenceApi } from '../../services/api';
import { Breed, Specie } from '../../types/entities';

export function BreedsPage() {
    const [breeds, setBreeds] = useState<Breed[]>([]);
    const [species, setSpecies] = useState<Specie[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const [breedsData, speciesData] = await Promise.all([
                referenceApi.breeds.list(),
                referenceApi.species.list(),
            ]);
            setBreeds(breedsData);
            setSpecies(speciesData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const columns: DataTableColumn<Breed>[] = [
        { id: 'id', header: 'ID', accessorKey: 'id', size: 80 },
        { id: 'name', header: 'Breed Name', accessorKey: 'name' },
        {
            id: 'species',
            header: 'Species',
            accessorFn: (row) => {
                const specie = species.find((s) => s.id === row.speciesId);
                return specie?.name || '-';
            },
        },
    ];

    const formFields: FormField<Partial<Breed>>[] = [
        {
            name: 'name',
            label: 'Breed Name',
            type: 'text',
            required: true,
            placeholder: 'e.g., Friesian, Boer, Dorper',
        },
        {
            name: 'speciesId',
            label: 'Species',
            type: 'select',
            required: false,
            options: species.map((s) => ({ value: s.id, label: s.name })),
            placeholder: 'Select species (optional)',
        },
    ];

    const detailFields = [
        { key: 'id' as keyof Breed, label: 'ID' },
        { key: 'name' as keyof Breed, label: 'Breed Name' },
        {
            key: 'speciesId' as keyof Breed,
            label: 'Species',
            render: (value: unknown) => {
                const specie = species.find((s) => s.id === value);
                return specie?.name || '-';
            },
        },
    ];

    const handleCreate = async (data: Partial<Breed>) => {
        await referenceApi.breeds.create(data as Breed);
    };

    const handleUpdate = async (id: number | string, data: Partial<Breed>) => {
        await referenceApi.breeds.update(Number(id), data as Breed);
    };

    const handleDelete = async (id: number | string) => {
        await referenceApi.breeds.delete(Number(id));
    };

    return (
        <CrudPage
            title="Breeds"
            description="Manage livestock breed types"
            data={breeds}
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
            createLabel="Add Breed"
            createModalSize="sm"
            editModalSize="sm"
        />
    );
}

export default BreedsPage;
