import { useState, useEffect, useCallback } from 'react';
import { CrudPage, DataTableColumn, FormField } from '../../components/crud';
import { locationApi } from '../../services/api';
import { Region, Country } from '../../types/entities';

export function RegionsPage() {
    const [regions, setRegions] = useState<Region[]>([]);
    const [countries, setCountries] = useState<Country[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const [regionsData, countriesData] = await Promise.all([
                locationApi.regions.list(),
                locationApi.countries.list(),
            ]);
            setRegions(regionsData);
            setCountries(countriesData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const columns: DataTableColumn<Region>[] = [
        { id: 'id', header: 'ID', accessorKey: 'id', size: 80 },
        { id: 'name', header: 'Region Name', accessorKey: 'name' },
        {
            id: 'country',
            header: 'Country',
            accessorFn: (row) => {
                const country = countries.find((c) => c.id === row.countryId);
                return country?.name || '-';
            },
        },
    ];

    const formFields: FormField<Partial<Region>>[] = [
        {
            name: 'name',
            label: 'Region Name',
            type: 'text',
            required: true,
            placeholder: 'e.g., Dar es Salaam',
        },
        {
            name: 'countryId',
            label: 'Country',
            type: 'select',
            required: true,
            options: countries.map((c) => ({ value: c.id, label: c.name })),
            placeholder: 'Select country',
        },
    ];

    const detailFields = [
        { key: 'id' as keyof Region, label: 'ID' },
        { key: 'name' as keyof Region, label: 'Region Name' },
        {
            key: 'countryId' as keyof Region,
            label: 'Country',
            render: (value: unknown) => {
                const country = countries.find((c) => c.id === value);
                return country?.name || '-';
            },
        },
    ];

    const handleCreate = async (data: Partial<Region>) => {
        await locationApi.regions.create(data as Region);
    };

    const handleUpdate = async (id: number | string, data: Partial<Region>) => {
        await locationApi.regions.update(Number(id), data as Region);
    };

    const handleDelete = async (id: number | string) => {
        await locationApi.regions.delete(Number(id));
    };

    return (
        <CrudPage
            title="Regions"
            description="Manage regional divisions within countries"
            data={regions}
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
            createLabel="Add Region"
            createModalSize="sm"
            editModalSize="sm"
        />
    );
}

export default RegionsPage;
